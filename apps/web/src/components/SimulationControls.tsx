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
  const [channelInput, setChannelInput] = useState("");
  const [customMsg, setCustomMsg] = useState("");
  const [isFirstTimerCheck, setIsFirstTimerCheck] = useState(true);
  const [velocity, setVelocity] = useState<number>(1200);

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
    <div className="sim-bar" id="simulation-controls-bar">
      {/* Scenario Triggers */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-secondary)" }}>
          DEMO SCENARIOS ({activeChannel})
        </span>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
          Test triage without needing a live broadcast
        </span>
      </div>

      <div className="sim-btn-group">
        <button
          className="sim-btn"
          id="btn-sim-boss"
          onClick={() => onTriggerScenario("boss_fight")}
          title="Simulate high-intensity boss fight with 80% hype emote noise"
        >
          ⚔️ Boss Fight
        </button>

        <button
          className="sim-btn"
          id="btn-sim-raid"
          onClick={() => onTriggerScenario("raid_influx")}
          title="Simulate 150-viewer raid influx with first-time chatters"
        >
          🚀 Raid Influx
        </button>

        <button
          className="sim-btn"
          id="btn-sim-tech"
          onClick={() => onTriggerScenario("technical_alert")}
          title="Simulate mic muted alert"
        >
          ⚠️ Mic Muted Alert
        </button>

        <button
          className="sim-btn"
          id="btn-sim-qna"
          onClick={() => onTriggerScenario("chill_qna")}
          title="Simulate casual stream with hardware/build questions"
        >
          ☕ Chill Q&A
        </button>
      </div>

      {/* Chat Velocity Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>SPEED:</span>
        <button
          className={`sim-btn ${velocity === 2200 ? "active" : ""}`}
          onClick={() => handleVelocityChange(2200)}
          style={{ padding: "4px 8px", fontSize: "0.72rem" }}
        >
          Slow
        </button>
        <button
          className={`sim-btn ${velocity === 1200 ? "active" : ""}`}
          onClick={() => handleVelocityChange(1200)}
          style={{ padding: "4px 8px", fontSize: "0.72rem" }}
        >
          Normal
        </button>
        <button
          className={`sim-btn ${velocity === 450 ? "active" : ""}`}
          onClick={() => handleVelocityChange(450)}
          style={{ padding: "4px 8px", fontSize: "0.72rem", color: "var(--accent-rose)" }}
        >
          🔥 Raid Speed
        </button>
      </div>

      {/* Live Custom Message Injector */}
      <form onSubmit={handleInjectSubmit} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <input
          type="text"
          id="input-custom-message"
          placeholder="Test custom chat message..."
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "5px 10px",
            color: "#FFF",
            fontSize: "0.78rem",
            outline: "none",
            width: "180px"
          }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "var(--text-secondary)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={isFirstTimerCheck}
            onChange={(e) => setIsFirstTimerCheck(e.target.checked)}
          />
          New?
        </label>
        <button type="submit" className="sim-btn" style={{ background: "rgba(0, 242, 254, 0.2)", color: "var(--accent-cyan)" }}>
          Send
        </button>
      </form>

      {/* Twitch Channel Input */}
      <form onSubmit={handleTwitchSubmit} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <input
          type="text"
          id="input-twitch-channel"
          placeholder="Twitch Channel..."
          value={channelInput}
          onChange={(e) => setChannelInput(e.target.value)}
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "5px 10px",
            color: "#FFF",
            fontSize: "0.78rem",
            outline: "none",
            width: "115px"
          }}
        />
        <button type="submit" className="sim-btn" style={{ background: "rgba(157, 78, 221, 0.2)" }}>
          Connect
        </button>
      </form>

      <button
        className="btn btn-ghost"
        id="btn-clear-signals"
        onClick={onClear}
        style={{ fontSize: "0.75rem", padding: "4px 8px" }}
        title="Clear all active and queued signals"
      >
        Clear All
      </button>
    </div>
  );
};
