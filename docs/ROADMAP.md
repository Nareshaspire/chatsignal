# ChatSignal Product & Technical Roadmap

## Phase 1: Hackathon MVP (Current Sprint)
**Goal**: Build a fully demonstrable, high-impact prototype featuring the synthetic simulator, the two-stage triage pipeline, and the glanceable Streamer HUD.

- [x] **Architecture & Product Specification**: Complete system architecture, threat model, and scoring heuristics.
- [ ] **Synthetic Chat Simulator**:
  - Replay scenarios: *Intense Boss Fight*, *Raid Influx (200 msgs/min)*, *Slow Chat / Meaningful Questions*.
  - Configurable chat velocity and first-time chatter injection.
- [ ] **Stage 1 Heuristic Pre-Filter**:
  - Fast-path regex filtering for emotes, hype spam (`W`, `L`, `KEKW`), and copypasta.
  - Priority boost for Twitch `first_time_chatter` badges.
- [ ] **Stage 2 Semantic Intent Classifier**:
  - OpenAI `gpt-4o-mini` integration with structured JSON outputs.
  - Urgency and question classification.
- [ ] **Sliding-Window Topic Clustering**:
  - 90-second sliding window topic grouping.
  - Repetition multiplier $\log_2(1 + N)$ score calculation.
- [ ] **Glanceable Streamer HUD**:
  - Dark-mode, high-contrast, zero-distraction UI.
  - Hotkey support (`Ctrl+Shift+Space` to mark answered).
  - OBS Browser Dock compatibility.
- [ ] **Twitch IRC Ingestion**:
  - Direct read-only listener to any live Twitch channel without requiring bot write access.

---

## Phase 2: Streamer Pilot & Validation (Post-Hackathon)
**Goal**: Deploy with 10–20 pilot streamers (20–250 CCV) to measure cognitive distraction and first-time chatter retention.

- [ ] **Twitch EventSub WebSocket Integration**:
  - Official Twitch OAuth flow with granular, read-only permissions.
  - Support for channel point redemptions and raid events as priority signals.
- [ ] **Elgato Stream Deck Plugin**:
  - Dedicated Stream Deck key showing the count of active high-priority signals.
  - One-tap button to mark the top question as answered.
- [ ] **Custom Streamer Heuristic Tuning**:
  - Sliders allowing streamers to adjust sensitivity (e.g., "Only alert on first-time chatters", "Aggressive spam filter").
- [ ] **Pilot Feedback Analytics**:
  - Track response latency, signal dismissal rates, and false-positive alert reports.

---

## Phase 3: Hardware Integrations & Voice Recognition
**Goal**: Eliminate the need for any manual clicks or hotkeys via local speech recognition.

- [ ] **Local Voice-Response Auto-Dismiss (Whisper / VAD)**:
  - Connect to the streamer's microphone input locally.
  - When the streamer verbally addresses the topic (e.g., *"Yeah, I'm using 800 DPI and 0.4 sensitivity"*), the NLP engine recognizes the topic match and automatically dismisses the HUD card.
- [ ] **Multi-Platform Support**:
  - Ingestion connectors for **YouTube Live** and **Kick** chat streams.
- [ ] **Audio Whisper / Haptic Cue Options**:
  - Ultra-soft directional chime or discrete Bluetooth vibration cue for VR/single-monitor streamers.

---

## Phase 4: Post-Stream Community Intelligence Report
**Goal**: Provide creators with actionable insights on what their community cared about after the broadcast ends.

- [ ] **Unanswered Questions Recap**:
  - A clean post-stream list of great questions asked during intense moments that the streamer couldn't get to, ready to be answered on Twitter/Discord.
- [ ] **Audience Interest Heatmaps**:
  - Which gameplay decisions or stream segments generated the highest concentration of genuine questions.
- [ ] **First-Time Chatter Retention Cohort Analysis**:
  - Telemetry showing how answering first-time chatters directly influenced follow/sub conversion.
