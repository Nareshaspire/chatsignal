# ChatSignal Product Specification

## 1. Product Vision & Philosophy

**ChatSignal** is a private, real-time attention filter and semantic radar for live video game streamers.

### Core Philosophy
1. **Empower the Creator, Never Replace Them**: ChatSignal never speaks on behalf of the creator. It does not post AI-generated replies into Twitch chat or speak aloud without explicit invitation.
2. **Sub-Second Glanceability**: The streamer's eyes must remain on their game or camera. Any UI signal must be decipherable in less than **250 milliseconds**.
3. **Drastic Noise Reduction**: 90% of chat during high-action gaming is low-entropy noise (emotes, copypasta, single-word reactions). The tool's primary value is ruthlessly dropping noise to spotlight the 2% of high-value human connections.
4. **First-Time Chatter Retention**: A first-time chatter whose initial question is answered within 60 seconds is 4.2x more likely to become a recurring viewer and subscriber. ChatSignal ensures those moments are never missed.

---

## 2. Target User Personas

### Persona A: "The Solo Competitive Gamer" (Primary)
* **Demographics**: Streams 15–30 hours/week, 20–150 concurrent viewers (CCV).
* **Pain Points**:
  * Plays fast-paced titles (*Valorant*, *Apex Legends*, *League of Legends*, *Elden Ring*).
  * Has no budget or volunteer team for full-time active moderators.
  * During high-stress matches, cannot look away from the primary gaming monitor for minutes at a time.
  * Constant anxiety over missing chat questions from new viewers who drop in and leave unnoticed.
* **Success Criteria with ChatSignal**: Can glance at an OBS dock between rounds or deaths, see 1 clustered question topic, address it in 5 seconds, and clear it with a hotkey.

### Persona B: "The Mid-Tier Variety Streamer" (Secondary)
* **Demographics**: 150–600 CCV, variety gaming and "Just Chatting".
* **Pain Points**:
  * Chat moves at 100–300 messages per minute.
  * Viewers repeatedly ask the same 5 questions (*"What mouse do you use?"*, *"What rank are you?"*, *"Are you playing with viewers later?"*).
  * Reading chat feels exhausting; the streamer suffers cognitive fatigue within 90 minutes.
* **Success Criteria with ChatSignal**: ChatSignal rolls 15 identical questions into 1 consolidated topic card with a count indicator (*"12 viewers asking about your mouse DPI"*).

---

## 3. The Priority Scoring Model

Each incoming chat message $m$ passing the Stage 1 heuristic filter is evaluated across 5 weighted vectors to compute a **Priority Score** $P(m) \in [0, 100]$:

$$P(m) = \text{clamp}\left( w_1 S_{\text{first\_timer}} + w_2 S_{\text{intent}} + w_3 \log_2(1 + N_{\text{cluster}}) + w_4 S_{\text{urgency}} - w_5 S_{\text{noise}}, 0, 100 \right)$$

### Vector Definitions & Weighting:

| Vector | Weight ($w_i$) | Description | Scoring Logic |
| :--- | :--- | :--- | :--- |
| **$S_{\text{first\_timer}}$** | **+30 pts** | New Viewer Status | 1.0 if Twitch metadata flags `first_time_chatter == true`, else 0.0. |
| **$S_{\text{intent}}$** | **+25 pts** | Semantic Question / Conversation Intent | Evaluated via structured JSON from micro-classifier: `1.0` for direct actionable question, `0.5` for constructive conversational opening, `0.0` for casual comment. |
| **$N_{\text{cluster}}$** | **+20 pts** | Topic Repetition Multiplier | Number of unique viewers asking semantically similar questions within the active 90-second sliding window. Scaled logarithmically: $\log_2(1 + N)$. |
| **$S_{\text{urgency}}$** | **+15 pts** | Stream / Context Urgency | Detects immediate technical or stream feedback (e.g., *"Mic is muted"*, *"Game audio desynced"*, *"Stream dropped frames"*). |
| **$S_{\text{noise}}$** | **-50 pts** | Emote / Meme / Banter Penalty | Penalty for messages containing high emote-to-text ratio, copypasta repetition, or toxic patterns. |

### Signal Thresholds:
* **$P \ge 80$ (Critical Signal - Gold Banner)**: Immediate glanceable priority card. Placed at the top of the HUD. Optional gentle haptic / soft chime.
* **$50 \le P < 80$ (Warm Signal - Blue Banner)**: Queued for quiet moments between gameplay rounds.
* **$P < 50$ (Suppressed)**: Discarded from the attention HUD; remains visible in standard Twitch chat without triggering alert triage.

---

## 4. User Experience & Interface Specifications

### The OBS Dock / Glanceable HUD
```
┌─────────────────────────────────────────────────────────────┐
│  📡 CHATSIGNAL HUD                      [● LIVE] [🔔 Sound] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⭐ TOP SIGNAL                                [Score: 94]   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🎯 TOPIC: Champion Build & Skill Order                │  │
│  │                                                       │  │
│  │ "Why do you upgrade Q before W against Zed?"          │  │
│  │                                                       │  │
│  │ 👤 Asked by: @KevGamer99 (First-Time Chatter!)        │  │
│  │ 👥 +3 others asked similar (4 total viewers)           │  │
│  │ ⏱️ 38s ago                                            │  │
│  │                                                       │  │
│  │ [✓ Answered (Ctrl+Space)]   [✕ Dismiss]   [📌 Pin]    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  📋 QUEUED SIGNALS (2)                                      │
│  • [Score 78] 👥 5 viewers: "Can you play duos with chat?" │
│  • [Score 72] 👤 @Nova_x: "What rank did you hit in S14?"   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Visual Ergonomics:
* **Background**: Deep matte black (`#0B0E14`) with high-contrast text (`#F0F6FC`) to eliminate glare on secondary displays.
* **Single Focus Principle**: Only **one** primary signal card is highlighted at full size. The streamer never has to scan a list while playing.
* **Low-Friction Dismissal**:
  * Global Hotkey (e.g., `Ctrl + Shift + Space` or Stream Deck button) marks the top signal as "Answered".
  * Auto-expiry: Signals naturally de-escalate and age out after 120 seconds if unpinned, avoiding visual staleness.

---

## 5. Success Metrics & Validation Targets

| Metric | Baseline (Without Tool) | Target (With ChatSignal) | How We Measure |
| :--- | :--- | :--- | :--- |
| **First-Time Chatter Response Rate** | 22% responded to | **> 75% responded to** | Ingestion timestamp vs. streamer audio/mod tag |
| **Streamer Response Latency** | 140 seconds (or never) | **< 45 seconds** | Time elapsed from message arrival to dismissal/answer |
| **Cognitive Distraction Score** | N/A (Manual chat scanning) | **< 1.8 / 5.0 distraction** | Post-stream survey ("Did the tool distract you during play?") |
| **Token Cost Efficiency** | N/A | **< $0.08 per 3-hour stream** | OpenAI API usage telemetry |
