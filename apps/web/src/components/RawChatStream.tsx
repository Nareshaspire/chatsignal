import React, { useEffect, useRef } from "react";
import { RawChatLogEntry, PipelineMetrics } from "../types";

interface RawChatStreamProps {
  logs: RawChatLogEntry[];
  metrics: PipelineMetrics;
}

export const RawChatStream: React.FC<RawChatStreamProps> = ({ logs, metrics }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of raw log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const dropRate = metrics.noiseDropRatePercent || 0;

  return (
    <aside className="stream-panel" id="raw-chat-stream-panel" aria-label="Live Chat Noise Radar">
      <div className="stream-panel-header">
        <h2>NOISE RADAR INSPECTION</h2>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          <span>90% TARGET FILTER</span>
          <span style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
            {dropRate}% NOISE DROPPED
          </span>
        </div>
        <div className="noise-meter-bar" title="Proportion of low-value chatter filtered out">
          <div className="noise-meter-fill" style={{ width: `${dropRate}%` }} />
        </div>
      </div>

      <div className="chat-log-list" ref={scrollRef} id="chat-log-container">
        {logs.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", marginTop: "24px" }}>
            Waiting for incoming chat traffic...
          </div>
        ) : (
          logs.map((entry, idx) => {
            const isPass = entry.verdict.startsWith("PASS") || entry.verdict.startsWith("FAST_PASS");
            return (
              <div
                key={`${entry.message.id}_${idx}`}
                className={`chat-log-item ${isPass ? "pass" : "dropped"}`}
              >
                <div className="chat-log-top">
                  <span className="chat-log-user">
                    {entry.message.isFirstTimer && "⭐ "}
                    @{entry.message.username}
                  </span>
                  <span className={`verdict-tag ${isPass ? "pass" : ""}`}>
                    {entry.verdict.replace("DROP_", "")}
                  </span>
                </div>
                <div style={{ color: isPass ? "#FFFFFF" : "var(--text-secondary)", wordBreak: "break-word" }}>
                  {entry.message.message}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
