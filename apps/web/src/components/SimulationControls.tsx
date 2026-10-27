import React, { useState } from "react";

interface SimulationControlsProps {
  onTriggerScenario: (scenario: "boss_fight" | "raid_influx" | "technical_alert" | "chill_qna") => void;
  onConnectTwitch: (channel: string) => void;
  onClear: () => void;
  onInjectMessage: (message: string, isFirstTimer: boolean) => void;
  onSetVelocity: (intervalMs: number) => void;
  activeChannel: string;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  onTriggerScenario,
  onConnectTwitch,
  onClear,
  onInjectMessage,
  onSetVelocity,
  activeChannel
}) => {
  const [activeTab, setActiveTab] = useState<"scenarios" | "custom" | "twitch">("scenarios");
  const [channelInput, setChannelInput] = useState("");
  const [customMsg, setCustomMsg] = useState("");
  const [isFirstTimerCheck, setIsFirstTimerCheck] = useState(true);
  const [velocity, setVelocity] = useState<number>(1200);

  const isRealTimeTwitch = !activeChannel.startsWith("SIM");

  const handleTwitchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelInput.trim()) {
      onConnectTwitch(channelInput.trim());
      setChannelInput("");
    }
  };

  const handleInjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMsg.trim()) {
      onInjectMessage(customMsg.trim(), isFirstTimerCheck);
      setCustomMsg("");
    }
  };

  const handleVelocityChange = (ms: number) => {
    setVelocity(ms);
    onSetVelocity(ms);
  };

  return (
    <div className="sim-hub-card" id="simulation-testing-hub">
      {/* Tab Navigation */}
      <div className="sim-tabs-header">
        <button
          className={`sim-tab-btn ${activeTab === "scenarios" ? "active" : ""}`}
          onClick={() => setActiveTab("scenarios")}
        >
          <span>⚡ 1-Click Scenarios</span>
        </button>

        <button
          className={`sim-tab-btn ${activeTab === "custom" ? "active" : ""}`}
          onClick={() => setActiveTab("custom")}
        >
          <span>✍️ Test Any Custom Message</span>
        </button>

        <button
          className={`sim-tab-btn ${activeTab === "twitch" ? "active" : ""}`}
          onClick={() => setActiveTab("twitch")}
        >
          <span>🔴 Real-Time Twitch Live</span>
          {isRealTimeTwitch && <span className="active-dot" />}
        </button>

        <button
          className="btn btn-ghost"
          onClick={onClear}
          style={{ marginLeft: "auto", fontSize: "0.74rem", padding: "4px 8px" }}
          title="Clear all active signals"
        >
          Clear Signals
        </button>
      </div>

      {/* Tab 1: 1-Click Scenarios */}
      {activeTab === "scenarios" && (
        <div className="sim-tab-body">
          <div className="scenario-grid">
            <button
              className="scenario-card"
              id="btn-scenario-boss"
              onClick={() => onTriggerScenario("boss_fight")}
            >
              <div className="scenario-icon">⚔️</div>
              <div className="scenario-info">
                <strong>Boss Fight</strong>
                <span>85% hype emote spam with questions buried</span>
              </div>
            </button>

            <button
              className="scenario-card"
              id="btn-scenario-raid"
              onClick={() => onTriggerScenario("raid_influx")}
            >
              <div className="scenario-icon">🚀</div>
              <div className="scenario-info">
                <strong>Raid Influx</strong>
                <span>150-viewer raid + new first-time chatters</span>
              </div>
            </button>

            <button
              className="scenario-card"
              id="btn-scenario-tech"
              onClick={() => onTriggerScenario("technical_alert")}
            >
              <div className="scenario-icon">⚠️</div>
              <div className="scenario-info">
                <strong>Mic Muted Alert</strong>
                <span>Urgent stream health alert (Priority 95+)</span>
              </div>
            </button>

            <button
              className="scenario-card"
              id="btn-scenario-qna"
              onClick={() => onTriggerScenario("chill_qna")}
            >
              <div className="scenario-icon">☕</div>
              <div className="scenario-info">
                <strong>Chill Q&A</strong>
                <span>Hardware, mouse DPI, and schedule questions</span>
              </div>
            </button>
          </div>

          {/* Velocity Bar */}
          <div className="velocity-control-row">
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Simulated Chat Velocity:</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                className={`sim-btn ${velocity === 2200 ? "active" : ""}`}
                onClick={() => handleVelocityChange(2200)}
              >
                Slow (30/min)
              </button>
              <button
                className={`sim-btn ${velocity === 1200 ? "active" : ""}`}
                onClick={() => handleVelocityChange(1200)}
              >
                Normal (100/min)
              </button>
              <button
                className={`sim-btn ${velocity === 450 ? "active" : ""}`}
                onClick={() => handleVelocityChange(450)}
                style={{ color: "var(--accent-rose)", borderColor: velocity === 450 ? "var(--accent-rose)" : undefined }}
              >
                🔥 Raid Speed (300/min)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Test Any Custom Message */}
      {activeTab === "custom" && (
        <div className="sim-tab-body">
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
            Type any message below to see whether it gets filtered out by Stage 1 or classified as a high-priority question by Stage 2:
          </p>
          <form onSubmit={handleInjectSubmit} className="custom-msg-form">
            <input
              type="text"
              id="custom-msg-input"
              className="custom-input"
              placeholder="e.g. 'What in-game sensitivity are you using?' or 'L KEKW'"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
            />
            <label className="first-timer-checkbox-label">
              <input
                type="checkbox"
                checked={isFirstTimerCheck}
                onChange={(e) => setIsFirstTimerCheck(e.target.checked)}
              />
              <span>⭐ First-Time Chatter? (+30 pts)</span>
            </label>
            <button type="submit" className="btn btn-primary" style={{ padding: "8px 18px" }}>
              Test Triage
            </button>
          </form>

          {/* Quick preset examples */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Quick Click to Try:</span>
            <button
              type="button"
              className="sim-btn"
              style={{ fontSize: "0.72rem", padding: "3px 8px" }}
              onClick={() => setCustomMsg("Why did you choose this build over the standard meta?")}
            >
              "Why this build?"
            </button>
            <button
              type="button"
              className="sim-btn"
              style={{ fontSize: "0.72rem", padding: "3px 8px" }}
              onClick={() => setCustomMsg("wait is your mic muted bro?")}
            >
              "mic muted?"
            </button>
            <button
              type="button"
              className="sim-btn"
              style={{ fontSize: "0.72rem", padding: "3px 8px" }}
              onClick={() => setCustomMsg("L KEKW W W OMEGALUL")}
            >
              "L KEKW W" (Test Spam Drop)
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Real Twitch Live Channels */}
      {activeTab === "twitch" && (
        <div className="sim-tab-body">
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "10px" }}>
            Connect to any live Twitch channel to triage <strong>real-world live chat</strong> with real viewers and authentic badges:
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--accent-rose)", fontWeight: 700 }}>
              🔴 1-CLICK POPULAR CHANNELS:
            </span>
            {["tarik", "kaicenat", "shroud", "eslcs", "riotgames"].map((chan) => (
              <button
                key={chan}
                type="button"
                className={`sim-btn ${activeChannel.toLowerCase() === chan ? "active" : ""}`}
                style={{
                  padding: "6px 12px",
                  fontSize: "0.8rem",
                  borderColor: activeChannel.toLowerCase() === chan ? "var(--accent-emerald)" : undefined,
                  color: activeChannel.toLowerCase() === chan ? "#34D399" : undefined
                }}
                onClick={() => onConnectTwitch(chan)}
              >
                #{chan}
              </button>
            ))}
          </div>

          <form onSubmit={handleTwitchSubmit} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="text"
              id="custom-twitch-channel-input"
              className="custom-input"
              placeholder="Or enter any custom Twitch channel name..."
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              style={{ maxWidth: "340px" }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: "8px 18px" }}>
              Connect Channel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
