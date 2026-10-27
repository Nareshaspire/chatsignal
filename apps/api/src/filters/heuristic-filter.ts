import { ChatMessage, FilterResult, FilterVerdict } from "../types.js";

export class Stage1HeuristicFilter {
  // Ring buffer for copypasta detection: maps normalized string to { count, firstSeen }
  private recentMessages: Map<string, { count: number; timestamp: number }> = new Map();
  private readonly COPYPASTA_WINDOW_MS = 45000;
  private readonly MAX_RECENT_TRACKED = 200;

  // Single token / hype reactions that should be instantly dropped
  private readonly HYPE_WORDS_REGEX =
    /^(w|l|pog|poggers|kekw|lul|lol|gg|omg|nice|sheesh|hype|f|rip|yep|catjam|ez|bruh|widepeepohappy|monkaw|monkas|pepega|copium|based|gigachad|w streamer|l streamer|true|fr|fr fr)$/i;

  // Urgent stream alerts that should bypass Stage 1 immediately
  private readonly URGENT_REGEX =
    /(mic(rophone)?\s*(is)?\s*mute(d)?|no sound|audio (is)?\s*(desync(ed)?|gone|dead|lagging)|black screen|stream lag(ging)?|game froze|dropped frames|echo|sound check)/i;

  // Basic slur / toxicity guardrail
  private readonly TOXIC_REGEX =
    /\b(n[i1]gg[ae3]r|f[a4]gg[o0]t|k[y1]s|retard|kill\s*yourself)\b/i;

  constructor() {
    // Periodically sweep the deduplication map
    setInterval(() => this.cleanupRecentMessages(), 15000);
  }

  public evaluate(msg: ChatMessage): FilterResult {
    const rawText = msg.message.trim();
    const normalized = rawText.toLowerCase().replace(/\s+/g, " ");

    // 1. Slur & Toxic Drop
    if (this.TOXIC_REGEX.test(normalized)) {
      return {
        passed: false,
        verdict: "DROP_BLOCKED_SLUR",
        message: msg,
        processedAt: Date.now(),
        reasonDescription: "Contained blocked hate speech or toxic slur."
      };
    }

    // 2. Urgent Stream Health Fast-Pass
    if (this.URGENT_REGEX.test(normalized)) {
      return {
        passed: true,
        verdict: "FAST_PASS_URGENT",
        message: msg,
        processedAt: Date.now(),
        reasonDescription: "Detected stream technical urgency (mic muted, audio/video issue)."
      };
    }

    // 3. First-Time Chatter Fast-Pass (if it has substance)
    if (msg.isFirstTimer && (rawText.length >= 8 || rawText.includes("?"))) {
      return {
        passed: true,
        verdict: "FAST_PASS_FIRST_TIMER",
        message: msg,
        processedAt: Date.now(),
        reasonDescription: "First-time chatter asking a question or greeting with substance."
      };
    }

    // 4. Length Gate: Discard messages shorter than 4 characters
    if (rawText.length < 4) {
      return {
        passed: false,
        verdict: "DROP_TOO_SHORT",
        message: msg,
        processedAt: Date.now(),
        reasonDescription: "Message too short to contain actionable inquiry."
      };
    }

    // 5. Single Token Hype Reaction Drop
    if (this.HYPE_WORDS_REGEX.test(normalized)) {
      return {
        passed: false,
        verdict: "DROP_HYPE_BANTER",
        message: msg,
        processedAt: Date.now(),
        reasonDescription: "Single-word chat reaction/hype emote."
      };
    }

    // 6. Emote-Only & Emoji Flood Drop
    if (this.isEmoteOrEmojiFlood(rawText)) {
      return {
        passed: false,
        verdict: "DROP_EMOTE_SPAM",
        message: msg,
        processedAt: Date.now(),
        reasonDescription: "High emote-to-text density with no conversational substance."
      };
    }

    // 7. Copypasta Deduplication
    if (this.isCopypasta(normalized)) {
      return {
        passed: false,
        verdict: "DROP_COPYPASTA",
        message: msg,
        processedAt: Date.now(),
        reasonDescription: "Identical message repeated across chat (copypasta raid)."
      };
    }

    // Passed Stage 1 Filters
    return {
      passed: true,
      verdict: "PASS",
      message: msg,
      processedAt: Date.now(),
      reasonDescription: "Meets candidate criteria for Stage 2 semantic triage."
    };
  }

  private isEmoteOrEmojiFlood(text: string): boolean {
    // Strip emojis
    const stripped = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
    if (stripped.length === 0 && text.length > 0) {
      return true; // 100% emojis
    }

    // Ratio of alphanumeric characters to total length
    const alphanum = (text.match(/[a-zA-Z0-9]/g) || []).length;
    if (text.length > 6 && alphanum / text.length < 0.35) {
      return true; // Mostly punctuation / symbols / emotes
    }

    return false;
  }

  private isCopypasta(normalized: string): boolean {
    const now = Date.now();
    const entry = this.recentMessages.get(normalized);

    if (entry) {
      entry.count += 1;
      // If repeated 3 or more times within the active window, flag as copypasta
      if (entry.count >= 3) {
        return true;
      }
    } else {
      if (this.recentMessages.size >= this.MAX_RECENT_TRACKED) {
        this.cleanupRecentMessages(true);
      }
      this.recentMessages.set(normalized, { count: 1, timestamp: now });
    }

    return false;
  }

  private cleanupRecentMessages(force = false): void {
    const now = Date.now();
    for (const [key, val] of this.recentMessages.entries()) {
      if (force || now - val.timestamp > this.COPYPASTA_WINDOW_MS) {
        this.recentMessages.delete(key);
      }
    }
  }
}
