import React, { useState } from "react";

interface SimulationControlsProps {
  onTriggerScenario: (scenario: "boss_fight" | "raid_influx" | "technical_alert" | "chill_qna") => void;
  onConnectTwitch: (channel: string) => void;
  onClear: () => void;
  activeChannel: string;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  onTriggerScenario,
  onConnectTwitch,
  onClear,
  activeChannel
}) => {
  const [channelInput, setChannelInput] = useState("");

  const handleTwitchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelInput.trim()) {
      onConnectTwitch(channelInput.trim());
      setChannelInput("");
    }
  };

  return (
    <div className="sim-bar" id="simulation-controls-bar">
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
            width: "130px"
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
