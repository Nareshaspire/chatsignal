export interface ChatMessage {
  id: string;
  timestamp: number;
  username: string;
  message: string;
  isFirstTimer: boolean;
  isSubscriber: boolean;
  isMod: boolean;
  isVip?: boolean;
  channel: string;
  rawBadges?: string[];
}

export type FilterVerdict =
  | "PASS"
  | "FAST_PASS_FIRST_TIMER"
  | "FAST_PASS_URGENT"
  | "DROP_EMOTE_SPAM"
  | "DROP_TOO_SHORT"
  | "DROP_HYPE_BANTER"
  | "DROP_COPYPASTA"
  | "DROP_BLOCKED_SLUR";

export interface FilterResult {
  passed: boolean;
  verdict: FilterVerdict;
  message: ChatMessage;
  processedAt: number;
  reasonDescription?: string;
}

export interface IntentClassification {
  isQuestion: boolean;
  category: "gameplay_strategy" | "technical_setup" | "personal_opinion" | "schedule" | "general_banter" | "none";
  confidence: number; // 0.0 - 1.0
  urgency: "urgent" | "normal" | "low";
  canonicalTopic: string;
  summary: string;
  suggestedTalkingPoint: string;
  suggestedAction: "answer_now" | "answer_later" | "ignore";
}

export type SignalStatus = "active" | "queued" | "answered" | "dismissed" | "pinned" | "expired";

export interface AiReasoningLog {
  stage1LatencyMs: number;
  stage2LatencyMs: number;
  confidence: number;
  formula: {
    firstTimer: number;
    intent: number;
    cluster: number;
    urgency: number;
    total: number;
  };
  promptUsed: string;
  modelUsed: string;
}

export interface TopicCluster {
  id: string;
  canonicalTopic: string;
  representativeQuestion: string;
  summary: string;
  suggestedTalkingPoint: string;
  category: string;
  urgency: "urgent" | "normal" | "low";
  initiator: {
    username: string;
    isFirstTimer: boolean;
    isSubscriber: boolean;
    isMod: boolean;
  };
  messages: ChatMessage[];
  uniqueViewers: string[];
  viewerCount: number;
  hasFirstTimeChatter: boolean;
  firstSeenAt: number;
  lastSeenAt: number;
  priorityScore: number;
  status: SignalStatus;
  pinned: boolean;
  resolvedAt?: number;
  aiReasoning?: AiReasoningLog;
}

export interface PipelineMetrics {
  totalIngested: number;
  droppedByStage1: number;
  passedToStage2: number;
  activeSignalsCount: number;
  noiseDropRatePercent: number;
  firstTimersRescued: number;
  lastUpdated: number;
}

export interface StreamerConfig {
  weightFirstTimer: number;
  weightIntent: number;
  weightCluster: number;
  weightUrgency: number;
  weightNoisePenalty: number;
  minPriorityThreshold: number;
  soundEnabled: boolean;
}

export type WSClientAction =
  | { type: "RESOLVE_SIGNAL"; signalId: string; resolution: "answered" | "dismissed" }
  | { type: "PIN_SIGNAL"; signalId: string; pinned: boolean }
  | { type: "TRIGGER_SCENARIO"; scenario: "boss_fight" | "raid_influx" | "technical_alert" | "chill_qna" }
  | { type: "TOGGLE_SIMULATOR"; enabled: boolean }
  | { type: "SET_VELOCITY"; intervalMs: number }
  | { type: "INJECT_MESSAGE"; message: string; isFirstTimer?: boolean }
  | { type: "CLEAR_SIGNALS" };

export type WSServerEvent =
  | { type: "SNAPSHOT"; topSignal: TopicCluster | null; queuedSignals: TopicCluster[]; metrics: PipelineMetrics }
  | { type: "SIGNAL_PUBLISHED"; signal: TopicCluster }
  | { type: "SIGNAL_UPDATED"; signal: TopicCluster }
  | { type: "SIGNAL_RESOLVED"; signalId: string; resolution: string }
  | { type: "METRICS_UPDATE"; metrics: PipelineMetrics }
  | { type: "RAW_CHAT_SAMPLE"; message: ChatMessage; verdict: FilterVerdict };
