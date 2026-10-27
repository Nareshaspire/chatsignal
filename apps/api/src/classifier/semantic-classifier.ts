import { OpenAI } from "openai";
import { ChatMessage, IntentClassification } from "../types.js";

export class SemanticIntentClassifier {
  private openai: OpenAI | null = null;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (apiKey && apiKey !== "your_openai_api_key_here") {
      this.openai = new OpenAI({ apiKey });
    }
  }

  public getModelName(): string {
    return this.openai ? this.model : "ChatSignal-LocalHeuristic-v1";
  }

  public getPromptForMessage(msg: ChatMessage): string {
    return `Analyze this Twitch chat message for a live video game streamer.
Sender: "${msg.username}" (First-time chatter: ${msg.isFirstTimer})
Message: "${msg.message}"

Task:
1. Determine if this is a direct question directed at the streamer.
2. Extract the canonical 2-4 word topic.
3. Suggest a 1-sentence contextual talking point the streamer can say while playing.`;
  }

  public async classify(message: ChatMessage): Promise<IntentClassification> {
    // If OpenAI client is configured and available, try the LLM
    if (this.openai) {
      try {
        return await this.classifyWithLLM(message);
      } catch (err) {
        console.warn("[Classifier] LLM invocation failed, falling back to local heuristic:", err);
      }
    }

    // High-speed rule-based local classifier (offline / fallback mode)
    return this.classifyLocalFallback(message);
  }

  private async classifyWithLLM(msg: ChatMessage): Promise<IntentClassification> {
    const prompt = `Analyze this Twitch chat message for a live video game streamer.
Sender: "${msg.username}" (First-time chatter: ${msg.isFirstTimer})
Message: "${msg.message}"

Return a valid JSON object matching this schema:
{
  "isQuestion": boolean,
  "category": "gameplay_strategy" | "technical_setup" | "personal_opinion" | "schedule" | "general_banter" | "none",
  "confidence": number (between 0.0 and 1.0),
  "urgency": "urgent" | "normal" | "low",
  "canonicalTopic": string (concise 2-4 word topic label, e.g. "Mouse Sensitivity", "Ability Leveling Order", "Audio Delay"),
  "summary": string (clean 1-sentence version of what they are asking/saying),
  "suggestedTalkingPoint": string (quick 1-sentence answer for the streamer to say on stream),
  "suggestedAction": "answer_now" | "answer_later" | "ignore"
}`;

    const completion = await this.openai!.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "system",
          content: "You are an ultra-fast attention triage classifier for live video game streamers. Your output must be strictly valid JSON without markdown wrapping."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 180
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(rawContent) as Partial<IntentClassification>;

    return {
      isQuestion: Boolean(parsed.isQuestion),
      category: parsed.category || "general_banter",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.85,
      urgency: parsed.urgency || "normal",
      canonicalTopic: parsed.canonicalTopic || this.generateLocalTopic(msg.message),
      summary: parsed.summary || msg.message,
      suggestedTalkingPoint: parsed.suggestedTalkingPoint || this.generateLocalTalkingPoint(msg.message, parsed.canonicalTopic || "Topic"),
      suggestedAction: parsed.suggestedAction || (parsed.isQuestion ? "answer_now" : "ignore")
    };
  }

  /**
   * Fast, zero-dependency local semantic classifier.
   * Extracts canonical topics and intent using regex patterns.
   */
  public classifyLocalFallback(msg: ChatMessage): IntentClassification {
    const text = msg.message.trim();
    const lower = text.toLowerCase();
    const hasQuestionMark = text.includes("?");

    // 1. Technical / Audio Urgency
    if (/(mic(rophone)?\s*(is)?\s*mute(d)?|no sound|audio desync|black screen|game froze|stream lag)/i.test(lower)) {
      return {
        isQuestion: true,
        category: "technical_setup",
        confidence: 0.98,
        urgency: "urgent",
        canonicalTopic: "Stream Audio & Technical Alert",
        summary: "Viewer is reporting a critical technical or audio issue on stream.",
        suggestedTalkingPoint: "Quick check: 'Appreciate the heads up chat, let me check my OBS audio mixer right now!'",
        suggestedAction: "answer_now"
      };
    }

    // 2. Hardware / Peripherals / Settings
    if (/(sens|sensitivity|dpi|mouse|keyboard|resolution|crosshair|settings|refresh rate|hz)/i.test(lower)) {
      return {
        isQuestion: true,
        category: "technical_setup",
        confidence: 0.92,
        urgency: "normal",
        canonicalTopic: "Peripherals & In-Game Sensitivity",
        summary: "Inquiring about your mouse DPI, sensitivity, or hardware setup.",
        suggestedTalkingPoint: "Mention: 'I'm playing on 800 DPI with 0.35 in-game sens, rocking a 240Hz monitor!'",
        suggestedAction: "answer_now"
      };
    }

    // 3. Gameplay Strategy & Build Order
    if (/(build|item|ability|upgrade|skill|runes|perks|max|why did you|why q|why w|why e|combo|strat|strategy)/i.test(lower)) {
      return {
        isQuestion: true,
        category: "gameplay_strategy",
        confidence: 0.9,
        urgency: "normal",
        canonicalTopic: "In-Game Build & Strategy",
        summary: "Asking about your character build, leveling order, or tactical choice.",
        suggestedTalkingPoint: "Mention: 'I maxed Q first for early lane waveclear against aggressive matchups!'",
        suggestedAction: "answer_now"
      };
    }

    // 4. Stream Schedule & Viewer Games
    if (/(play with viewers|duos|customs|schedule|tomorrow|next stream|when are you)/i.test(lower)) {
      return {
        isQuestion: true,
        category: "schedule",
        confidence: 0.85,
        urgency: "normal",
        canonicalTopic: "Schedule & Community Games",
        summary: "Asking about future stream times or playing with viewers.",
        suggestedTalkingPoint: "Mention: 'I do community custom games every Friday at 7 PM EST!'",
        suggestedAction: "answer_later"
      };
    }

    // 5. General Inquiry (Starts with question words)
    if (/^(what|why|how|who|where|when|can you|could you|is that|are you)\b/i.test(lower) || hasQuestionMark) {
      const topic = this.generateLocalTopic(text);
      return {
        isQuestion: true,
        category: "personal_opinion",
        confidence: 0.8,
        urgency: "normal",
        canonicalTopic: topic,
        summary: text,
        suggestedTalkingPoint: `Quick response addressing ${topic}: 'Good question! It really comes down to game tempo and current patch meta.'`,
        suggestedAction: "answer_now"
      };
    }

    // 6. First-time chatter greeting
    if (msg.isFirstTimer) {
      return {
        isQuestion: false,
        category: "general_banter",
        confidence: 0.75,
        urgency: "normal",
        canonicalTopic: "First-Time Viewer Greeting",
        summary: "A new viewer introduced themselves to the channel.",
        suggestedTalkingPoint: `Say: 'Welcome in @${msg.username}, great having you here tonight! Hope you enjoy the games!'`,
        suggestedAction: "answer_now"
      };
    }

    return {
      isQuestion: false,
      category: "general_banter",
      confidence: 0.5,
      urgency: "low",
      canonicalTopic: "General Chat Banter",
      summary: text,
      suggestedTalkingPoint: "Casual chat acknowledgement.",
      suggestedAction: "ignore"
    };
  }

  private generateLocalTalkingPoint(text: string, topic: string): string {
    return `Quick answer for ${topic}: 'Great question chat, that's mainly for maximizing damage during team fights!'`;
  }

  private generateLocalTopic(text: string): string {
    const cleaned = text.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    const words = cleaned.split(/\s+/).slice(0, 4);
    if (words.length === 0) return "General Inquiry";
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
}
