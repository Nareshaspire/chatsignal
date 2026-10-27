import React from "react";
import { TopicCluster } from "../types";

interface AiInspectorModalProps {
  signal: TopicCluster;
  onClose: () => void;
}

export const AiInspectorModal: React.FC<AiInspectorModalProps> = ({ signal, onClose }) => {
  const reasoning = signal.aiReasoning;

  return (
    <div className="modal-backdrop" onClick={onClose} id="ai-inspector-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} id="ai-inspector-card">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.2rem" }}>🔬</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>AI TRIAGE REASONING & CODEX PIPELINE</h3>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "4px 8px" }}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Latency & Model Performance Metrics */}
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">STAGE 1 HEURISTIC</span>
              <span className="stat-val" style={{ color: "#34D399" }}>
                {reasoning?.stage1LatencyMs || 0.4} ms
              </span>
              <span className="stat-sub">Regex & Noise Gate</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">STAGE 2 CODEX / LLM</span>
              <span className="stat-val" style={{ color: "var(--accent-cyan)" }}>
                {reasoning?.stage2LatencyMs || 180} ms
              </span>
              <span className="stat-sub">{reasoning?.modelUsed || "gpt-4o-mini"}</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">INTENT CONFIDENCE</span>
              <span className="stat-val" style={{ color: "var(--accent-gold)" }}>
                {Math.round((reasoning?.confidence || 0.9) * 100)}%
              </span>
              <span className="stat-sub">Structured JSON</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">TOTAL PIPELINE</span>
              <span className="stat-val">
                {Math.round((reasoning?.stage1LatencyMs || 0.4) + (reasoning?.stage2LatencyMs || 180))} ms
              </span>
              <span className="stat-sub">End-to-End Latency</span>
            </div>
          </div>

          {/* Mathematical Priority Scoring Decomposition */}
          <div className="inspector-section">
            <h4 className="inspector-subtitle">MATHEMATICAL PRIORITY DECOMPOSITION (SCORE: {signal.priorityScore}/100)</h4>
            <div className="formula-breakdown-list">
              <div className="formula-row">
                <span>⭐ First-Time Chatter Bonus (w₁ · S_first):</span>
                <strong style={{ color: reasoning?.formula.firstTimer ? "#34D399" : "var(--text-muted)" }}>
                  +{reasoning?.formula.firstTimer || (signal.hasFirstTimeChatter ? 30 : 0)} pts
                </strong>
              </div>
              <div className="formula-row">
                <span>🎯 Intent & Question Quality (w₂ · S_intent):</span>
                <strong style={{ color: "var(--accent-cyan)" }}>
                  +{reasoning?.formula.intent || 25} pts
                </strong>
              </div>
              <div className="formula-row">
                <span>👥 Topic Cluster Multiplier (w₃ · log₂(1 + N) with N = {signal.viewerCount} viewers):</span>
                <strong style={{ color: "var(--accent-gold)" }}>
                  +{reasoning?.formula.cluster || 20} pts
                </strong>
              </div>
              <div className="formula-row">
                <span>⚠️ Stream Urgency & Health (w₄ · S_urgency):</span>
                <strong style={{ color: signal.urgency === "urgent" ? "var(--accent-rose)" : "var(--text-muted)" }}>
                  +{reasoning?.formula.urgency || (signal.urgency === "urgent" ? 15 : 5)} pts
                </strong>
              </div>
              <div className="formula-row" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", marginTop: "4px" }}>
                <span>FINAL COMPOSITE SCORE (P):</span>
                <span className="score-badge" style={{ padding: "2px 10px" }}>{signal.priorityScore}</span>
              </div>
            </div>
          </div>

          {/* Prompt & Payload Transparency */}
          <div className="inspector-section">
            <h4 className="inspector-subtitle">CODEX / OPENAI STRUCTURED PROMPT PAYLOAD</h4>
            <pre className="code-inspector-block">
{reasoning?.promptUsed || `Analyze this Twitch chat message for a live video game streamer.
Sender: "${signal.initiator.username}" (First-time chatter: ${signal.hasFirstTimeChatter})
Message: "${signal.representativeQuestion}"

Task:
1. Determine if this is a direct question directed at the streamer.
2. Extract the canonical 2-4 word topic label.
3. Suggest a 1-sentence contextual talking point for the streamer to say while playing.`}
            </pre>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
