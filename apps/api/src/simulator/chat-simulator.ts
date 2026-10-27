import { ChatMessage } from "../types.js";

export type ScenarioType = "boss_fight" | "raid_influx" | "technical_alert" | "chill_qna";

export class ChatSimulator {
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;
  private messageCallback: ((msg: ChatMessage) => void) | null = null;
  private intervalMs = 1200;

  private viewerUsernames = [
    "PixelHunter", "ViperStrike", "KevGamer99", "Nova_x", "EchoStreamer",
    "GamerGirl92", "ShadowBlade", "ZeroCool", "LunarKnight", "FrostyBite",
    "ApexPredator", "IronClad", "CyberSamurai", "NeonRider", "SwiftArrow"
  ];

  public onMessage(callback: (msg: ChatMessage) => void): void {
    this.messageCallback = callback;
  }

  public start(scenario: ScenarioType = "boss_fight", intervalMs = 1200): void {
    this.stop();
    this.isRunning = true;
    this.intervalMs = intervalMs;

    console.log(`[Simulator] Started scenario: "${scenario}" (Interval: ${intervalMs}ms)`);
    this.runScenarioLoop(scenario);
  }

  public stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log("[Simulator] Stopped.");
  }

  public getStatus(): { isRunning: boolean; intervalMs: number } {
    return { isRunning: this.isRunning, intervalMs: this.intervalMs };
  }

  private runScenarioLoop(scenario: ScenarioType): void {
    if (!this.isRunning) return;

    const msg = this.generateMessageForScenario(scenario);
    if (this.messageCallback) {
      this.messageCallback(msg);
    }

    // Add slight natural jitter to interval
    const jitter = Math.floor(Math.random() * 400) - 200;
    const nextInterval = Math.max(300, this.intervalMs + jitter);

    this.timer = setTimeout(() => {
      this.runScenarioLoop(scenario);
    }, nextInterval);
  }

  public triggerSingleMessage(customText?: string, isFirstTimer = false): void {
    if (!this.messageCallback) return;
    const username = this.getRandomUsername();
    this.messageCallback({
      id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      username,
      message: customText || "What in-game sensitivity and DPI are you using?",
      isFirstTimer,
      isSubscriber: !isFirstTimer && Math.random() > 0.6,
      isMod: false,
      channel: "demo_streamer"
    });
  }

  private generateMessageForScenario(scenario: ScenarioType): ChatMessage {
    const roll = Math.random();
    const id = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = Date.now();

    switch (scenario) {
      case "boss_fight":
        // 80% hype noise, 20% meaningful question
        if (roll < 0.35) {
          return this.createMsg(id, timestamp, this.pick(["W", "L", "KEKW", "POGGERS", "SHEESH", "NO WAY", "RIP", "EZ"]), false);
        } else if (roll < 0.65) {
          return this.createMsg(id, timestamp, this.pick(["catJam", "monkaW monkaW", "widepeepoHappy", "LUL", "pepega", "gg"]), false);
        } else if (roll < 0.8) {
          return this.createMsg(id, timestamp, this.pick(["HE'S ONE SHOT", "DODGE RIGHT", "LOOK OUT", "HIT THE FLASK", "FOCUS"]), false);
        } else {
          // Meaningful questions during boss fight
          const isNew = Math.random() > 0.5;
          const questions = [
            "Why did you max Q before W in this matchup?",
            "What build are you going for after this phase?",
            "Is this weapon better than the greatsword for scaling?",
            "How did you dodge that sweep attack so cleanly?",
            "Can you explain your flask setup when you finish this?"
          ];
          return this.createMsg(id, timestamp, this.pick(questions), isNew);
        }

      case "raid_influx":
        // 60% raid copypasta, 40% new viewers asking about the streamer
        if (roll < 0.6) {
          return this.createMsg(id, timestamp, "RAID INCOMING! ❤️ ❤️ ❤️ LOVE FROM STREAMTEAM", true);
        } else {
          const newViewerQuestions = [
            "Hey, first time here! What character are you playing?",
            "Who are you and what rank are you currently?",
            "First time seeing your stream! How long have you been streaming?",
            "What game is this? Looks super clean!",
            "Love the vibes here, do you play with viewers on weekends?"
          ];
          return this.createMsg(id, timestamp, this.pick(newViewerQuestions), true);
        }

      case "technical_alert":
        if (roll < 0.3) {
          return this.createMsg(id, timestamp, "pog stream", false);
        } else {
          const techAlerts = [
            "wait is your mic muted?",
            "mic muted bro",
            "no sound right now!",
            "stream audio is completely desynced",
            "game audio is muted, only hearing music"
          ];
          return this.createMsg(id, timestamp, this.pick(techAlerts), Math.random() > 0.5);
        }

      case "chill_qna":
      default:
        if (roll < 0.35) {
          return this.createMsg(id, timestamp, this.pick(["haha", "true", "lol fr", "based", "nice"]), false);
        } else {
          const qnaList = [
            "What mouse DPI and in-game sensitivity do you run?",
            "What monitor refresh rate are you using? 240Hz or 360Hz?",
            "Are you planning to stream again tomorrow night?",
            "What made you switch to this character today?",
            "Do you have any tips for ranking up solo queue?"
          ];
          return this.createMsg(id, timestamp, this.pick(qnaList), Math.random() > 0.4);
        }
    }
  }

  private createMsg(id: string, timestamp: number, message: string, isFirstTimer: boolean): ChatMessage {
    const username = this.getRandomUsername();
    return {
      id,
      timestamp,
      username,
      message,
      isFirstTimer,
      isSubscriber: !isFirstTimer && Math.random() > 0.5,
      isMod: false,
      channel: "demo_streamer"
    };
  }

  private getRandomUsername(): string {
    return this.viewerUsernames[Math.floor(Math.random() * this.viewerUsernames.length)];
  }

  private pick(items: string[]): string {
    return items[Math.floor(Math.random() * items.length)];
  }
}
