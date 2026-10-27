import React, { useState } from "react";
import { PipelineMetrics } from "../types";
import { soundNotifier } from "../utils/audio";

interface HeaderProps {
  isConnected: boolean;
  metrics: PipelineMetrics;
  activeChannel: string;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, metrics, activeChannel }) => {
  const [muted, setMuted] = useState(soundNotifier.getIsMuted());

  const toggleSound = () => {
    const isNowMuted = soundNotifier.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      soundNotifier.playChime();
    }
  };

  return (
    <header className="header" id="header-bar">
      <div className="brand">
        <div className="logo-badge" id="brand-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00F2FE" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h2" />
            <path d="M6 12h2" />
            <path d="M12 2v2" />
            <path d="M12 6v2" />
            <path d="M12 16v2" />
            <path d="M12 20v2" />
            <path d="M16 12h2" />
            <path d="M20 12h2" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div className="brand-text">
          <h1>CHATSIGNAL</h1>
          <p>ATTENTION & PRIORITY RADAR</p>
        </div>
      </div>

      <div className="header-status-group">
        <div className="status-pill" id="live-status-pill">
          <span className={`pulse-dot ${isConnected ? "" : "danger"}`} />
          <span>{isConnected ? `STREAM: ${activeChannel.toUpperCase()}` : "DISCONNECTED"}</span>
        </div>

        <div className="metric-pill" id="metric-noise-pill" title="Percentage of spam, emote floods, and copypasta dropped before the streamer sees it">
          <span>NOISE DROP:</span>
          <strong>{metrics.noiseDropRatePercent || 0}%</strong>
        </div>

        <div className="metric-pill" id="metric-rescued-pill" title="First-time chatters surfaced to the streamer">
          <span>FIRST-TIMERS:</span>
          <strong style={{ color: "#34D399" }}>{metrics.firstTimersRescued}</strong>
        </div>

        <button
          className="btn btn-ghost"
          id="sound-toggle-btn"
          onClick={toggleSound}
          title={muted ? "Unmute Priority Chimes" : "Mute Priority Chimes"}
          style={{ padding: "6px 12px" }}
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00F2FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
