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

export interface TopicCluster {
  id: string;
  canonicalTopic: string;
  representativeQuestion: string;
  summary: string;
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
  status: "active" | "queued" | "answered" | "dismissed" | "pinned" | "expired";
  pinned: boolean;
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

export interface RawChatLogEntry {
  message: ChatMessage;
  verdict: FilterVerdict;
  receivedAt: number;
}
