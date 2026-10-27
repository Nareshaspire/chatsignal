import React from "react";
import { TopicCluster } from "../types";

interface TopSignalCardProps {
  signal: TopicCluster | null;
  onResolve: (id: string, resolution: "answered" | "dismissed") => void;
  onPin: (id: string, pinned: boolean) => void;
  onInspectAi: (signal: TopicCluster) => void;
}

export const TopSignalCard: React.FC<TopSignalCardProps> = ({
  signal,
  onResolve,
  onPin,
  onInspectAi
}) => {
  if (!signal) {
    return (
      <div className="empty-card" id="empty-signal-card">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m4.93 4.93 4.24 4.24" />
          <path d="m14.83 9.17 4.24-4.24" />
          <path d="m14.83 14.83 4.24 4.24" />
          <path d="m9.17 14.83-4.24 4.24" />
          <circle cx="12" cy="12" r="4" />
        </svg>
        <h3 style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>Radar Listening Quietly</h3>
        <p style={{ maxWidth: "360px", fontSize: "0.85rem" }}>
          ChatSignal is actively filtering incoming chat noise. High-priority questions and topic clusters will appear here.
        </p>
      </div>
    );
  }

  const isUrgent = signal.urgency === "urgent";
  const secondsAgo = Math.max(1, Math.round((Date.now() - signal.lastSeenAt) / 1000));

  return (
    <div
      className={`top-signal-card ${isUrgent ? "urgent" : ""}`}
      id={`top-signal-${signal.id}`}
      role="region"
      aria-label="Top Priority Chat Signal"
    >
      <div className="card-top-bar">
        <span className="topic-tag" id="signal-topic-tag">
          {isUrgent ? "⚠️ URGENT ALERT: " : "🎯 TOPIC: "}
          {signal.canonicalTopic}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            className="btn btn-ghost"
            style={{ padding: "3px 8px", fontSize: "0.74rem", border: "1px solid var(--border-subtle)" }}
            onClick={() => onInspectAi(signal)}
            title="Inspect OpenAI Codex Prompt, JSON Schema & Priority Formula"
          >
            🔬 AI Inspector
          </button>

          <div className={`score-badge ${isUrgent ? "urgent" : ""}`} id="signal-score-badge">
            <span>SCORE</span>
            <span>{signal.priorityScore}</span>
          </div>
        </div>
      </div>

      <h2 className="question-text" id="signal-question-text">
        "{signal.representativeQuestion}"
      </h2>

      {/* Suggested Quick Answer Talking Point */}
      {signal.suggestedTalkingPoint && (
        <div className="talking-point-box" id="signal-talking-point">
          <span className="talking-point-label">💡 AI COPILOT TALKING POINT:</span>
          <span className="talking-point-content">{signal.suggestedTalkingPoint}</span>
        </div>
      )}

      <div className="viewer-meta-row">
        <span>
          Asked by: <strong>@{signal.initiator.username}</strong>
        </span>

        {signal.hasFirstTimeChatter && (
          <span className="badge-first-timer" id="badge-first-timer" title="First-time chatter in your channel! Answering helps retain new community members.">
            ⭐ FIRST-TIME CHATTER
          </span>
        )}

        {signal.viewerCount > 1 && (
          <span className="cluster-count-badge" id="badge-cluster-count">
            👥 +{signal.viewerCount - 1} others asked ({signal.viewerCount} viewers total)
          </span>
        )}

        <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          ⏱️ {secondsAgo}s ago
        </span>
      </div>

      <div className="action-buttons-row">
        <button
          className="btn btn-primary"
          id="btn-answer-signal"
          onClick={() => onResolve(signal.id, "answered")}
        >
          <span>✓ Mark Answered</span>
          <span className="hotkey-indicator">Space</span>
        </button>

        <button
          className="btn btn-secondary"
          id="btn-dismiss-signal"
          onClick={() => onResolve(signal.id, "dismissed")}
        >
          <span>✕ Dismiss</span>
          <span className="hotkey-indicator">D</span>
        </button>

        <button
          className={`btn ${signal.pinned ? "btn-primary" : "btn-secondary"}`}
          id="btn-pin-signal"
          onClick={() => onPin(signal.id, !signal.pinned)}
          style={{ marginLeft: "auto" }}
          title={signal.pinned ? "Unpin Signal" : "Pin Signal"}
        >
          <span>{signal.pinned ? "📌 Pinned" : "Pin"}</span>
          <span className="hotkey-indicator">P</span>
        </button>
      </div>
    </div>
  );
};
