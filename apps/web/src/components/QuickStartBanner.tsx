import React, { useState } from "react";

interface QuickStartBannerProps {
  onTriggerScenario: (scenario: "boss_fight" | "raid_influx" | "technical_alert" | "chill_qna") => void;
}

export const QuickStartBanner: React.FC<QuickStartBannerProps> = ({ onTriggerScenario }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
        <button
          className="btn btn-ghost"
          style={{ fontSize: "0.75rem", padding: "2px 8px", color: "var(--accent-cyan)" }}
          onClick={() => setDismissed(false)}
        >
          ℹ️ Show Quick Testing Guide
        </button>
      </div>
    );
  }

  return (
    <div className="quickstart-banner" id="quickstart-testing-guide">
      <div className="quickstart-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.1rem" }}>⚡</span>
          <strong style={{ fontSize: "0.9rem", color: "#FFF" }}>Test ChatSignal in 3 Simple Steps:</strong>
        </div>
        <button
          className="btn btn-ghost"
          style={{ padding: "2px 6px", fontSize: "0.75rem" }}
          onClick={() => setDismissed(true)}
          title="Dismiss guide"
        >
          ✕ Dismiss
        </button>
      </div>

      <div className="quickstart-steps-grid">
        <div className="quickstart-step-box">
          <span className="step-num">STEP 1</span>
          <span className="step-text">Choose a test scenario below</span>
          <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
            <button
              className="sim-btn"
              style={{ padding: "3px 8px", fontSize: "0.72rem", background: "rgba(0, 242, 254, 0.15)", color: "var(--accent-cyan)" }}
              onClick={() => onTriggerScenario("boss_fight")}
            >
              ⚔️ Boss Fight
            </button>
            <button
              className="sim-btn"
              style={{ padding: "3px 8px", fontSize: "0.72rem", background: "rgba(157, 78, 221, 0.15)", color: "#c084fc" }}
              onClick={() => onTriggerScenario("raid_influx")}
            >
              🚀 Raid Influx
            </button>
          </div>
        </div>

        <div className="quickstart-step-box">
          <span className="step-num">STEP 2</span>
          <span className="step-text">Watch the Noise Radar (Right) drop 90% spam</span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Emotes & hype are filtered; only meaningful questions reach the Hero Card.
          </span>
        </div>

        <div className="quickstart-step-box">
          <span className="step-num">STEP 3</span>
          <span className="step-text">Press Spacebar to answer</span>
          <span style={{ fontSize: "0.72rem", color: "var(--accent-gold)" }}>
            ⌨️ Tap <strong>Space</strong> or click "Mark Answered" to clear and advance!
          </span>
        </div>
      </div>
    </div>
  );
};
