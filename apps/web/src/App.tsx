import React, { useEffect, useState, useRef, useCallback } from "react";
import { Header } from "./components/Header";
import { QuickStartBanner } from "./components/QuickStartBanner";
import { TopSignalCard } from "./components/TopSignalCard";
import { QueuedSignalsList } from "./components/QueuedSignalsList";
import { RawChatStream } from "./components/RawChatStream";
import { SimulationControls } from "./components/SimulationControls";
import { AiInspectorModal } from "./components/AiInspectorModal";
import { SessionRecapModal } from "./components/SessionRecapModal";
import { TopicCluster, PipelineMetrics, RawChatLogEntry } from "./types";
import { soundNotifier } from "./utils/audio";

const API_BASE = "http://localhost:4000";
const WS_BASE = "ws://localhost:4000";

export const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [topSignal, setTopSignal] = useState<TopicCluster | null>(null);
  const [queuedSignals, setQueuedSignals] = useState<TopicCluster[]>([]);
  const [rawLogs, setRawLogs] = useState<RawChatLogEntry[]>([]);
  const [activeChannel, setActiveChannel] = useState("SIMULATOR");
  const [isDockMode, setIsDockMode] = useState(false);
  const [selectedInspectorSignal, setSelectedInspectorSignal] = useState<TopicCluster | null>(null);
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<PipelineMetrics>({
    totalIngested: 0,
    droppedByStage1: 0,
    passedToStage2: 0,
    activeSignalsCount: 0,
    noiseDropRatePercent: 91,
    firstTimersRescued: 0,
    lastUpdated: Date.now()
  });

  const wsRef = useRef<WebSocket | null>(null);
  const lastSignalIdRef = useRef<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Send action over WebSocket
  const sendWsAction = useCallback((action: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(action));
    }
  }, []);

  // Handle Resolving Top Signal
  const handleResolveSignal = useCallback((id: string, resolution: "answered" | "dismissed") => {
    sendWsAction({ type: "RESOLVE_SIGNAL", signalId: id, resolution });
    if (resolution === "answered") {
      showToast("✓ Question Answered! Community connection saved.");
    } else {
      showToast("✕ Signal Dismissed.");
    }
  }, [sendWsAction]);

  // Handle Pinning
  const handlePinSignal = useCallback((id: string, pinned: boolean) => {
    sendWsAction({ type: "PIN_SIGNAL", signalId: id, pinned });
    showToast(pinned ? "📌 Signal Pinned to Top." : "Signal Unpinned.");
  }, [sendWsAction]);

  // Handle Triggering Scenarios
  const handleTriggerScenario = (scenario: "boss_fight" | "raid_influx" | "technical_alert" | "chill_qna") => {
    setActiveChannel(`SIM: ${scenario.toUpperCase()}`);
    sendWsAction({ type: "TRIGGER_SCENARIO", scenario });
    showToast(`⚡ Started scenario: ${scenario.replace("_", " ").toUpperCase()}`);
  };

  // Handle Custom Message Injection
  const handleInjectMessage = (message: string, isFirstTimer: boolean) => {
    sendWsAction({ type: "INJECT_MESSAGE", message, isFirstTimer });
    showToast(`📩 Injected message: "${message.substring(0, 30)}..."`);
  };

  // Handle Velocity Adjustment
  const handleSetVelocity = (intervalMs: number) => {
    sendWsAction({ type: "SET_VELOCITY", intervalMs });
    showToast(`⚡ Chat speed set to ${intervalMs}ms`);
  };

  // Handle Twitch Connection
  const handleConnectTwitch = async (channel: string) => {
    try {
      setActiveChannel(channel);
      await fetch(`${API_BASE}/api/twitch/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel })
      });
      showToast(`🔴 Connected to live Twitch chat on #${channel}!`);
    } catch (err) {
      console.error("Failed to connect to Twitch channel:", err);
      showToast("⚠️ Failed to connect to Twitch channel.");
    }
  };

  // Handle Clear
  const handleClear = () => {
    sendWsAction({ type: "CLEAR_SIGNALS" });
    showToast("Cleared all active signals.");
  };

  // WebSocket Connection Lifecycle
  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectWs = () => {
      const ws = new WebSocket(WS_BASE);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log("[HUD] Connected to ChatSignal WebSocket Server.");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "SNAPSHOT") {
            setTopSignal(data.topSignal);
            setQueuedSignals(data.queuedSignals || []);
            if (data.metrics) setMetrics(data.metrics);

            // Play chime if a new high-priority top signal arrived
            if (data.topSignal && data.topSignal.id !== lastSignalIdRef.current) {
              lastSignalIdRef.current = data.topSignal.id;
              if (data.topSignal.priorityScore >= 75) {
                soundNotifier.playChime();
              }
            }
          } else if (data.type === "RAW_CHAT_SAMPLE") {
            setRawLogs((prev) => {
              const updated = [...prev, { message: data.message, verdict: data.verdict, receivedAt: Date.now() }];
              return updated.slice(-60);
            });
          }
        } catch (err) {
          console.error("[HUD] Error processing message:", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("[HUD] WebSocket disconnected. Reconnecting in 2.5s...");
        reconnectTimer = setTimeout(connectWs, 2500);
      };

      ws.onerror = (err) => {
        console.warn("[HUD] WebSocket error:", err);
        ws.close();
      };
    };

    connectWs();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Global Keyboard Shortcuts (Space to Answer, D to Dismiss, P to Pin, Esc to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedInspectorSignal(null);
        setShowRecapModal(false);
        return;
      }

      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if (!topSignal) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleResolveSignal(topSignal.id, "answered");
      } else if (e.code === "KeyD") {
        e.preventDefault();
        handleResolveSignal(topSignal.id, "dismissed");
      } else if (e.code === "KeyP") {
        e.preventDefault();
        handlePinSignal(topSignal.id, !topSignal.pinned);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [topSignal, handleResolveSignal, handlePinSignal]);

  return (
    <div className={`app-container ${isDockMode ? "dock-mode" : ""}`} id="chatsignal-app">
      <Header
        isConnected={isConnected}
        metrics={metrics}
        activeChannel={activeChannel}
        isDockMode={isDockMode}
        onToggleDockMode={() => setIsDockMode((prev) => !prev)}
        onOpenRecap={() => setShowRecapModal(true)}
      />

      <main className="main-grid">
        <section className="attention-area" id="streamer-attention-area">
          {/* Quick Testing Guide Banner */}
          {!isDockMode && (
            <QuickStartBanner onTriggerScenario={handleTriggerScenario} />
          )}

          {/* Hero Top Signal Card */}
          <TopSignalCard
            signal={topSignal}
            onResolve={handleResolveSignal}
            onPin={handlePinSignal}
            onInspectAi={(sig) => setSelectedInspectorSignal(sig)}
          />

          {/* Secondary Queued Signals */}
          <QueuedSignalsList
            signals={queuedSignals}
            onSelect={(sig) => setTopSignal(sig)}
            onDismiss={(id) => handleResolveSignal(id, "dismissed")}
          />

          {/* Modular Testing Hub (1-Click Scenarios, Custom Sandbox, Twitch Live) */}
          <SimulationControls
            onTriggerScenario={handleTriggerScenario}
            onConnectTwitch={handleConnectTwitch}
            onClear={handleClear}
            onInjectMessage={handleInjectMessage}
            onSetVelocity={handleSetVelocity}
            activeChannel={activeChannel}
          />
        </section>

        {!isDockMode && (
          <RawChatStream
            logs={rawLogs}
            metrics={metrics}
          />
        )}
      </main>

      {/* Action Toast Feedback */}
      {toastMessage && (
        <div className="action-toast-pill" id="action-toast">
          {toastMessage}
        </div>
      )}

      {/* AI Inspector Modal */}
      {selectedInspectorSignal && (
        <AiInspectorModal
          signal={selectedInspectorSignal}
          onClose={() => setSelectedInspectorSignal(null)}
        />
      )}

      {/* Session Intelligence Recap Modal */}
      {showRecapModal && (
        <SessionRecapModal
          metrics={metrics}
          queuedSignals={queuedSignals}
          onClose={() => setShowRecapModal(false)}
        />
      )}
    </div>
  );
};
