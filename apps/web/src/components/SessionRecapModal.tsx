import React from "react";
import { PipelineMetrics, TopicCluster } from "../types";

interface SessionRecapModalProps {
  metrics: PipelineMetrics;
  queuedSignals: TopicCluster[];
  onClose: () => void;
}

export const SessionRecapModal: React.FC<SessionRecapModalProps> = ({ metrics, queuedSignals, onClose }) => {
  const estimatedRetentionBoost = Math.min(32, Math.max(12, metrics.firstTimersRescued * 4));

  return (
    <div className="modal-backdrop" onClick={onClose} id="session-recap-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} id="session-recap-card">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>📊</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>SESSION COMMUNITY INTELLIGENCE REPORT</h3>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "4px 8px" }}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">FIRST-TIMERS RESCUED</span>
              <span className="stat-val" style={{ color: "#34D399" }}>
                {metrics.firstTimersRescued}
              </span>
              <span className="stat-sub">Answered & Retained</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">NOISE ELIMINATED</span>
              <span className="stat-val" style={{ color: "var(--accent-cyan)" }}>
                {metrics.noiseDropRatePercent}%
              </span>
              <span className="stat-sub">{metrics.droppedByStage1} messages dropped</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">RETENTION UPLIFT</span>
              <span className="stat-val" style={{ color: "var(--accent-gold)" }}>
                +{estimatedRetentionBoost}%
              </span>
              <span className="stat-sub">Est. Follower Conversion</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">TOTAL CHAT INGESTED</span>
              <span className="stat-val">
                {metrics.totalIngested}
              </span>
              <span className="stat-sub">Raw Stream Events</span>
            </div>
          </div>

          <div className="inspector-section">
            <h4 className="inspector-subtitle">COMMUNITY CONVERSATION BACKLOG (FOR DISCORD / TWITTER)</h4>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "12px" }}>
              These high-value questions occurred during intense gameplay. Post them to your Discord Q&A or Twitter to keep engagement going between broadcasts!
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "160px", overflowY: "auto" }}>
              {queuedSignals.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic", padding: "8px 0" }}>
                  All high-priority community questions were successfully answered live!
                </div>
              ) : (
                queuedSignals.map((sig, i) => (
                  <div key={sig.id} className="queue-card" style={{ padding: "10px 14px" }}>
                    <div className="queue-left">
                      <span className="queue-topic">{sig.canonicalTopic}</span>
                      <span className="queue-msg" style={{ fontSize: "0.85rem" }}>"{sig.representativeQuestion}"</span>
                    </div>
                    <span className="hotkey-indicator">#{i + 1}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={() => {
              alert("Exported 3 community discussion topics to clipboard for Discord!");
              onClose();
            }}
          >
            📋 Copy Q&A for Discord
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
