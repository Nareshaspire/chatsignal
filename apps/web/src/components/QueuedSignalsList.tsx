import React from "react";
import { TopicCluster } from "../types";

interface QueuedSignalsListProps {
  signals: TopicCluster[];
  onSelect: (signal: TopicCluster) => void;
  onDismiss: (id: string) => void;
}

export const QueuedSignalsList: React.FC<QueuedSignalsListProps> = ({ signals, onSelect, onDismiss }) => {
  if (signals.length === 0) return null;

  return (
    <div className="queue-section" id="queue-signals-section">
      <div className="section-title">
        <span>QUEUED SIGNALS FOR QUIET MOMENTS ({signals.length})</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text-muted)" }}>CLICK TO EXPAND</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {signals.map((sig) => (
          <div
            key={sig.id}
            className="queue-card"
            id={`queued-signal-${sig.id}`}
            onClick={() => onSelect(sig)}
          >
            <div className="queue-left">
              <span className="queue-topic">{sig.canonicalTopic}</span>
              <span className="queue-msg">"{sig.representativeQuestion}"</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {sig.viewerCount > 1 && (
                <span className="cluster-count-badge">👥 {sig.viewerCount}</span>
              )}
              {sig.hasFirstTimeChatter && (
                <span className="badge-first-timer" style={{ fontSize: "0.7rem", padding: "2px 8px" }}>NEW</span>
              )}
              <span className="score-badge" style={{ padding: "2px 8px", fontSize: "0.75rem" }}>
                {sig.priorityScore}
              </span>
              <button
                className="btn btn-ghost"
                style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(sig.id);
                }}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
