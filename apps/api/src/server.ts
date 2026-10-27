import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";

import { ChatMessage, WSClientAction, WSServerEvent } from "./types.js";
import { Stage1HeuristicFilter } from "./filters/heuristic-filter.js";
import { SemanticIntentClassifier } from "./classifier/semantic-classifier.js";
import { TopicClusterManager } from "./clustering/topic-cluster-manager.js";
import { ChatSimulator } from "./simulator/chat-simulator.js";
import { TwitchIrcConnector } from "./connectors/twitch-irc.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Core Pipeline Components
const heuristicFilter = new Stage1HeuristicFilter();
const classifier = new SemanticIntentClassifier();
const clusterManager = new TopicClusterManager();
const simulator = new ChatSimulator();
const twitchIrc = new TwitchIrcConnector();

// Connected HUD clients
const connectedClients: Set<WebSocket> = new Set();

function broadcast(event: WSServerEvent): void {
  const payload = JSON.stringify(event);
  for (const client of connectedClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function broadcastSnapshot(): void {
  const snapshot = clusterManager.getSnapshot();
  broadcast({
    type: "SNAPSHOT",
    topSignal: snapshot.topSignal,
    queuedSignals: snapshot.queuedSignals,
    metrics: snapshot.metrics
  });
}

// Ingestion Pipeline Handler
async function processChatMessage(msg: ChatMessage): Promise<void> {
  const t0 = performance.now();

  // 1. Stage 1: Local Heuristic Filter (<1ms)
  const filterResult = heuristicFilter.evaluate(msg);
  const t1 = performance.now();
  const stage1Ms = Number((t1 - t0).toFixed(2));

  clusterManager.recordRawIngestion(!filterResult.passed);

  // Broadcast raw chat sample to HUD inspection pane
  broadcast({
    type: "RAW_CHAT_SAMPLE",
    message: msg,
    verdict: filterResult.verdict
  });

  // If dropped by Stage 1, stop here
  if (!filterResult.passed) {
    return;
  }

  // 2. Stage 2: Semantic Intent Classifier
  const t2 = performance.now();
  const intent = await classifier.classify(msg);
  const t3 = performance.now();
  const stage2Ms = Number((t3 - t2).toFixed(2));

  // 3. Ingest into 90s Topic Cluster & calculate Priority Score with AI Reasoning meta
  clusterManager.ingestClassifiedMessage(msg, intent, {
    stage1Ms,
    stage2Ms,
    promptUsed: classifier.getPromptForMessage(msg),
    modelUsed: classifier.getModelName()
  });

  // 4. Broadcast updated signal snapshot
  broadcastSnapshot();
}

// Attach listeners
simulator.onMessage((msg) => {
  processChatMessage(msg);
});

twitchIrc.onMessage((msg) => {
  processChatMessage(msg);
});

// WebSocket Connection Lifecycle
wss.on("connection", (ws: WebSocket) => {
  connectedClients.add(ws);
  console.log(`[WebSocket] Client connected. Total clients: ${connectedClients.size}`);

  // Send initial snapshot immediately
  const snapshot = clusterManager.getSnapshot();
  ws.send(
    JSON.stringify({
      type: "SNAPSHOT",
      topSignal: snapshot.topSignal,
      queuedSignals: snapshot.queuedSignals,
      metrics: snapshot.metrics
    })
  );

  ws.on("message", (raw: string) => {
    try {
      const action = JSON.parse(raw.toString()) as WSClientAction;

      switch (action.type) {
        case "RESOLVE_SIGNAL": {
          clusterManager.resolveSignal(action.signalId, action.resolution);
          broadcastSnapshot();
          break;
        }

        case "PIN_SIGNAL": {
          clusterManager.pinSignal(action.signalId, action.pinned);
          broadcastSnapshot();
          break;
        }

        case "TRIGGER_SCENARIO": {
          twitchIrc.disconnect();
          simulator.start(action.scenario, 1100);
          break;
        }

        case "TOGGLE_SIMULATOR": {
          if (action.enabled) {
            twitchIrc.disconnect();
            simulator.start("boss_fight", 1200);
          } else {
            simulator.stop();
          }
          break;
        }

        case "SET_VELOCITY": {
          const currentStatus = simulator.getStatus();
          if (currentStatus.isRunning) {
            simulator.start("boss_fight", action.intervalMs);
          }
          break;
        }

        case "INJECT_MESSAGE": {
          processChatMessage({
            id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: Date.now(),
            username: "LiveJudge",
            message: action.message,
            isFirstTimer: Boolean(action.isFirstTimer),
            isSubscriber: false,
            isMod: false,
            channel: twitchIrc.getStatus().channel || "demo_streamer"
          });
          break;
        }

        case "CLEAR_SIGNALS": {
          clusterManager.clearSignals();
          broadcastSnapshot();
          break;
        }
      }
    } catch (err) {
      console.error("[WebSocket] Failed to handle message:", err);
    }
  });

  ws.on("close", () => {
    connectedClients.delete(ws);
    console.log(`[WebSocket] Client disconnected. Total clients: ${connectedClients.size}`);
  });
});

// REST Health & Status Endpoints
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    clientsConnected: connectedClients.size,
    simulator: simulator.getStatus(),
    twitchIrc: twitchIrc.getStatus(),
    metrics: clusterManager.getSnapshot().metrics
  });
});

app.get("/api/snapshot", (req, res) => {
  res.json(clusterManager.getSnapshot());
});

app.post("/api/simulator/start", (req, res) => {
  twitchIrc.disconnect();
  const scenario = req.body?.scenario || "boss_fight";
  const interval = req.body?.interval || 1200;
  simulator.start(scenario, interval);
  res.json({ success: true, scenario, interval });
});

app.post("/api/simulator/stop", (req, res) => {
  simulator.stop();
  res.json({ success: true });
});

app.post("/api/twitch/connect", (req, res) => {
  const channel = req.body?.channel;
  if (!channel) {
    return res.status(400).json({ error: "channel is required" });
  }

  // Seamlessly switch to Real-Time Live Twitch stream
  console.log(`[Real-Time Twitch] Switching to live channel: #${channel}`);
  simulator.stop();
  clusterManager.clearSignals();
  twitchIrc.connect(channel);
  broadcastSnapshot();

  res.json({
    success: true,
    channel,
    mode: "REALTIME_TWITCH_LIVE",
    message: `Now listening in real time to live Twitch chat on #${channel}`
  });
});

app.post("/api/twitch/disconnect", (req, res) => {
  twitchIrc.disconnect();
  res.json({ success: true });
});

// Start Server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`📡 ChatSignal API Engine running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server ready on ws://localhost:${PORT}`);
  console.log(`=======================================================`);

  const shouldAutoSimulate = process.env.SIMULATOR_ENABLED !== "false";
  if (shouldAutoSimulate) {
    const scenario = (process.env.SIMULATOR_SCENARIO as any) || "boss_fight";
    simulator.start(scenario, 1300);
  }
});
