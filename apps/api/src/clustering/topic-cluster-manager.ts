import { ChatMessage, IntentClassification, PipelineMetrics, StreamerConfig, TopicCluster } from "../types.js";

export interface IngestionMetadata {
  stage1Ms: number;
  stage2Ms: number;
  promptUsed: string;
  modelUsed: string;
}

export class TopicClusterManager {
  private clusters: Map<string, TopicCluster> = new Map();
  private readonly WINDOW_TTL_MS = 90000; // 90 seconds sliding window

  private config: StreamerConfig = {
    weightFirstTimer: 30,
    weightIntent: 25,
    weightCluster: 20,
    weightUrgency: 15,
    weightNoisePenalty: 0,
    minPriorityThreshold: 60,
    soundEnabled: true
  };

  private metrics: PipelineMetrics = {
    totalIngested: 0,
    droppedByStage1: 0,
    passedToStage2: 0,
    activeSignalsCount: 0,
    noiseDropRatePercent: 0,
    firstTimersRescued: 0,
    lastUpdated: Date.now()
  };

  constructor() {
    setInterval(() => this.sweepExpiredClusters(), 10000);
  }

  public recordRawIngestion(dropped: boolean): void {
    this.metrics.totalIngested += 1;
    if (dropped) {
      this.metrics.droppedByStage1 += 1;
    } else {
      this.metrics.passedToStage2 += 1;
    }

    if (this.metrics.totalIngested > 0) {
      this.metrics.noiseDropRatePercent = Math.round(
        (this.metrics.droppedByStage1 / this.metrics.totalIngested) * 100
      );
    }
    this.metrics.lastUpdated = Date.now();
  }

  public ingestClassifiedMessage(
    msg: ChatMessage,
    intent: IntentClassification,
    meta?: IngestionMetadata
  ): TopicCluster {
    const now = Date.now();
    const topicKey = this.normalizeTopicKey(intent.canonicalTopic);

    let cluster = this.clusters.get(topicKey);

    if (cluster && cluster.status !== "answered" && cluster.status !== "dismissed") {
      cluster.messages.push(msg);
      if (!cluster.uniqueViewers.includes(msg.username)) {
        cluster.uniqueViewers.push(msg.username);
        cluster.viewerCount = cluster.uniqueViewers.length;
      }

      if (msg.isFirstTimer) {
        cluster.hasFirstTimeChatter = true;
        this.metrics.firstTimersRescued += 1;
      }

      cluster.lastSeenAt = now;
      if (intent.urgency === "urgent") {
        cluster.urgency = "urgent";
      }
      if (intent.suggestedTalkingPoint) {
        cluster.suggestedTalkingPoint = intent.suggestedTalkingPoint;
      }

      const breakdown = this.computePriorityBreakdown(cluster, intent);
      cluster.priorityScore = breakdown.total;
      cluster.aiReasoning = {
        stage1LatencyMs: meta?.stage1Ms || 0.6,
        stage2LatencyMs: meta?.stage2Ms || 185,
        confidence: intent.confidence || 0.9,
        formula: breakdown,
        promptUsed: meta?.promptUsed || "",
        modelUsed: meta?.modelUsed || "gpt-4o-mini"
      };
    } else {
      const id = `sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      cluster = {
        id,
        canonicalTopic: intent.canonicalTopic,
        representativeQuestion: msg.message,
        summary: intent.summary,
        suggestedTalkingPoint: intent.suggestedTalkingPoint,
        category: intent.category,
        urgency: intent.urgency,
        initiator: {
          username: msg.username,
          isFirstTimer: msg.isFirstTimer,
          isSubscriber: msg.isSubscriber,
          isMod: msg.isMod
        },
        messages: [msg],
        uniqueViewers: [msg.username],
        viewerCount: 1,
        hasFirstTimeChatter: msg.isFirstTimer,
        firstSeenAt: now,
        lastSeenAt: now,
        priorityScore: 0,
        status: "active",
        pinned: false
      };

      if (msg.isFirstTimer) {
        this.metrics.firstTimersRescued += 1;
      }

      const breakdown = this.computePriorityBreakdown(cluster, intent);
      cluster.priorityScore = breakdown.total;
      cluster.aiReasoning = {
        stage1LatencyMs: meta?.stage1Ms || 0.6,
        stage2LatencyMs: meta?.stage2Ms || 185,
        confidence: intent.confidence || 0.9,
        formula: breakdown,
        promptUsed: meta?.promptUsed || "",
        modelUsed: meta?.modelUsed || "gpt-4o-mini"
      };

      this.clusters.set(topicKey, cluster);
    }

    this.updateActiveCount();
    return cluster;
  }

  public computePriorityBreakdown(cluster: TopicCluster, intent: IntentClassification) {
    let firstTimerPts = 0;
    let intentPts = 0;
    let clusterPts = 0;
    let urgencyPts = 0;

    // 1. First-Timer Bonus
    if (cluster.hasFirstTimeChatter) {
      firstTimerPts = this.config.weightFirstTimer;
    }

    // 2. Intent Bonus
    if (intent.isQuestion) {
      intentPts = Math.round(this.config.weightIntent * (intent.confidence || 0.8));
    }

    // 3. Cluster Repetition Multiplier: log2(1 + N)
    clusterPts = Math.round(Math.min(Math.log2(1 + cluster.viewerCount) * 12, 35));

    // 4. Urgency
    if (cluster.urgency === "urgent") {
      urgencyPts = this.config.weightUrgency;
    } else if (cluster.urgency === "normal") {
      urgencyPts = 5;
    }

    const total = Math.max(0, Math.min(100, firstTimerPts + intentPts + clusterPts + urgencyPts));

    return {
      firstTimer: firstTimerPts,
      intent: intentPts,
      cluster: clusterPts,
      urgency: urgencyPts,
      total
    };
  }

  public resolveSignal(signalId: string, resolution: "answered" | "dismissed"): TopicCluster | null {
    for (const cluster of this.clusters.values()) {
      if (cluster.id === signalId) {
        cluster.status = resolution;
        cluster.resolvedAt = Date.now();
        this.updateActiveCount();
        return cluster;
      }
    }
    return null;
  }

  public pinSignal(signalId: string, pinned: boolean): TopicCluster | null {
    for (const cluster of this.clusters.values()) {
      if (cluster.id === signalId) {
        cluster.pinned = pinned;
        return cluster;
      }
    }
    return null;
  }

  public clearSignals(): void {
    this.clusters.clear();
    this.updateActiveCount();
  }

  public getSnapshot(): {
    topSignal: TopicCluster | null;
    queuedSignals: TopicCluster[];
    metrics: PipelineMetrics;
  } {
    const activeList: TopicCluster[] = [];

    for (const cluster of this.clusters.values()) {
      if (cluster.status === "active" || cluster.status === "queued" || cluster.pinned) {
        activeList.push(cluster);
      }
    }

    // Sort descending by priority score; pinned items prioritized at top
    activeList.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.priorityScore - a.priorityScore;
    });

    const topSignal = activeList.length > 0 ? activeList[0] : null;
    const queuedSignals = activeList.slice(1, 6);

    return {
      topSignal,
      queuedSignals,
      metrics: { ...this.metrics }
    };
  }

  private updateActiveCount(): void {
    let count = 0;
    for (const cluster of this.clusters.values()) {
      if (cluster.status === "active" || cluster.status === "queued") {
        count += 1;
      }
    }
    this.metrics.activeSignalsCount = count;
    this.metrics.lastUpdated = Date.now();
  }

  private sweepExpiredClusters(): void {
    const now = Date.now();
    for (const [key, cluster] of this.clusters.entries()) {
      if (cluster.pinned) continue;
      if (now - cluster.lastSeenAt > this.WINDOW_TTL_MS) {
        this.clusters.delete(key);
      }
    }
    this.updateActiveCount();
  }

  private normalizeTopicKey(topic: string): string {
    return topic.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  }
}
