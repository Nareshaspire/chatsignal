# ChatSignal 📡

> **Intelligent Attention & Priority Signal Engine for Live Streamers**  
> *Never lose a meaningful viewer interaction to a fast-moving chat.*

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![Status: MVP](https://img.shields.io/badge/Status-Hackathon_MVP-blue.svg)](docs/ROADMAP.md)
[![Twitch: EventSub](https://img.shields.io/badge/Twitch-IRC%20%2F%20EventSub-9146FF.svg)](https://dev.twitch.tv)
[![AI: OpenAI](https://img.shields.io/badge/AI-OpenAI%20Codex%20%2F%20GPT--4o-00A67E.svg)](https://openai.com)

---

## 🎯 The Core Problem

During a live broadcast, streamers must simultaneously perform, monitor alerts, manage gameplay, and read chat. As viewership grows, chat velocity turns into an unreadable firehose of emojis, copypasta, and casual remarks:

* **Good questions disappear** in seconds before the streamer can glance at the monitor.
* **First-time chatters are missed**, lose motivation, leave the stream, and never return.
* **Repetitive questions** clog the chat (e.g., *"What build is that?"*, *"What sensitivity do you use?"*).
* **Existing AI tools fail streamers** by either spamming public chat with intrusive AI bots, demanding rigid viewer commands (`!ask`), or displaying complex, laggy analytics dashboards that cannot be read during high-intensity gameplay.

---

## 💡 The Solution: ChatSignal

**ChatSignal** is a **private, low-cognitive-load Heads-Up Display (HUD)** for streamers. It quietly ingests raw Twitch chat, eliminates 90% of noise using an ultra-fast heuristic filter, semantically clusters related conversations, and surfaces **only the 1–3 critical signals that matter right now**.

```
TWITCH CHAT FIREHOSE (500 msgs/min)
              │
              ▼
   ┌──────────────────────┐
   │  STAGE 1 HEURISTIC   │ ──(Drop 90% spam, emotes, single-char messages)──> 🗑️
   └──────────┬───────────┘
              │ (High-potential messages)
              ▼
   ┌──────────────────────┐
   │  STAGE 2 NLP TRIAGE  │ ──(Semantic intent, question detection, topic clustering)
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │  PRIORITY SCORER     │ ──(Formula: First-Timer + Question + Cluster - Noise)
   └──────────┬───────────┘
              │
              ▼
   ┌────────────────────────────────────────────────────────┐
   │             GLANCEABLE STREAMER HUD (OBS DOCK)         │
   │                                                        │
   │  ⭐ TOP SIGNAL (Score: 92)                              │
   │  Topic: Character Build & Strategy                     │
   │  👥 4 viewers asking | 👤 Includes 1 first-time chatter │
   │  "Why did you max ability Q first in this matchup?"    │
   │                                                        │
   │  [Mark Answered] (Hotkey: Ctrl+Shift+X)                │
   └────────────────────────────────────────────────────────┘
```

---

## ✨ Key Capabilities

1. **Glanceable Attention HUD**:
   * Designed specifically to be mounted as an **OBS Custom Browser Dock** or loaded on a secondary monitor/tablet.
   * Shows a single primary focus card at a time to prevent cognitive overload.
2. **Two-Stage Filtration Pipeline**:
   * **Stage 1 (0ms, $0)**: Local rules discard emote-only spam, single-character reactions (`W`, `L`, `KEKW`), and duplicate copypasta.
   * **Stage 2 (Micro-LLM)**: Structured semantic analysis detects conversational intent and urgency without high latency.
3. **Sliding-Window Topic Clustering**:
   * Automatically groups viewers asking variations of the same question within a 60–90 second window into a unified conversation thread.
4. **First-Time Chatter Multiplier**:
   * Heavily prioritizes genuine questions from new viewers to maximize community retention.
5. **Zero Public Intrusion**:
   * Operates completely silently. No chatbot messages in public chat, no robotic text-to-speech interruptions unless specifically enabled.
6. **Built-in Synthetic Stream Simulator**:
   * Includes a full test harness that replays synthetic chat scenarios (chat raids, boss fights, Q&A bursts) for rapid local development and demo presentations.

---

## 🏗️ Architecture & Tech Stack

* **apps/api**:
  * Node.js & TypeScript
  * Twitch IRC / WebSocket EventSub client
  * OpenAI API (`gpt-4o-mini` with strict Structured JSON outputs)
  * In-memory sliding-window topic aggregator & priority scorer
  * WebSocket / Server-Sent Events (SSE) server for low-latency streaming to the HUD
* **apps/web**:
  * Modern, responsive web app built for high contrast and rapid glanceability
  * Streamer HUD with dark-mode glassmorphism and minimal motion
  * OBS Studio Browser Dock integration & keyboard shortcuts
* **docs/**:
  * Complete product specifications, architectural diagrams, threat models, and roadmaps.

---

## 🚀 Quick Start

### Prerequisites
* Node.js 20+ and npm / pnpm
* OpenAI API Key (or local LLM provider)
* *(Optional for live streaming)* Twitch Developer Application Credentials

### 1. Clone & Configure Environment
```bash
git clone https://github.com/Nareshaspire/chatsignal.git
cd chatsignal
cp .env.example .env
```
Fill in `.env` with your API credentials.

### 2. Run the Development Environment
```bash
# Install dependencies
npm install

# Run backend and frontend concurrently
npm run dev
```

### 3. Test with the Simulator
If you do not have an active live stream, toggle simulation mode:
```bash
# Trigger a synthetic Twitch chat simulation with 50 viewers
npm run simulate -- --scenario=boss-fight
```

---

## 📚 Documentation Directory

* [Product Vision & Heuristics](docs/PRODUCT.md) — Personas, priority mathematical model, and core UX design.
* [System Architecture](docs/ARCHITECTURE.md) — Two-stage pipeline data flow, WebSocket contracts, and latency budgets.
* [Roadmap & Milestones](docs/ROADMAP.md) — Hackathon MVP scope and post-launch vision.
* [Threat Model & Security](docs/THREAT-MODEL.md) — Prompt injection defenses, PII handling, and rate-limiting.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
