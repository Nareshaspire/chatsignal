import net from "net";
import { ChatMessage } from "../types.js";

export class TwitchIrcConnector {
  private client: net.Socket | null = null;
  private channel: string | null = null;
  private isConnected = false;
  private messageCallback: ((msg: ChatMessage) => void) | null = null;

  public onMessage(callback: (msg: ChatMessage) => void): void {
    this.messageCallback = callback;
  }

  public connect(channelName: string): void {
    this.disconnect();

    const normalizedChannel = channelName.toLowerCase().replace(/^#/, "").trim();
    if (!normalizedChannel) return;

    this.channel = normalizedChannel;
    console.log(`[Twitch IRC] Connecting to channel #${this.channel}...`);

    this.client = new net.Socket();

    this.client.connect(6667, "irc.chat.twitch.tv", () => {
      this.isConnected = true;
      console.log("[Twitch IRC] Connected to Twitch IRC server.");

      // Request capabilities for user badges and metadata (first-msg, badges, etc.)
      this.client?.write("CAP REQ :twitch.tv/tags twitch.tv/commands\r\n");
      // Anonymous read-only login
      const randomJustin = Math.floor(10000 + Math.random() * 90000);
      this.client?.write(`PASS SCHMOOPIIE\r\n`);
      this.client?.write(`NICK justinfan${randomJustin}\r\n`);
      this.client?.write(`JOIN #${this.channel}\r\n`);
    });

    let buffer = "";

    this.client.on("data", (data) => {
      buffer += data.toString("utf8");
      const lines = buffer.split("\r\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        this.handleIrcLine(line);
      }
    });

    this.client.on("error", (err) => {
      console.error("[Twitch IRC] Error:", err.message);
    });

    this.client.on("close", () => {
      this.isConnected = false;
      console.log("[Twitch IRC] Connection closed.");
    });
  }

  public disconnect(): void {
    if (this.client) {
      try {
        this.client.write(`PART #${this.channel}\r\n`);
        this.client.end();
        this.client.destroy();
      } catch {
        // ignore
      }
      this.client = null;
    }
    this.isConnected = false;
    this.channel = null;
  }

  public getStatus(): { isConnected: boolean; channel: string | null } {
    return { isConnected: this.isConnected, channel: this.channel };
  }

  private handleIrcLine(line: string): void {
    // Respond to IRC PING to maintain connection
    if (line.startsWith("PING")) {
      this.client?.write("PONG :tmi.twitch.tv\r\n");
      return;
    }

    // Example parsed tag line:
    // @badge-info=;badges=moderator/1;color=#1E90FF;display-name=KevGamer;first-msg=1;... :kevgamer!kevgamer@kevgamer.tmi.twitch.tv PRIVMSG #streamer :hello world
    if (line.includes("PRIVMSG")) {
      const parsed = this.parsePrivmsg(line);
      if (parsed && this.messageCallback) {
        this.messageCallback(parsed);
      }
    }
  }

  private parsePrivmsg(raw: string): ChatMessage | null {
    try {
      let tags: Record<string, string> = {};
      let remaining = raw;

      if (raw.startsWith("@")) {
        const spaceIdx = raw.indexOf(" ");
        const tagSection = raw.substring(1, spaceIdx);
        remaining = raw.substring(spaceIdx + 1);

        for (const part of tagSection.split(";")) {
          const [key, val] = part.split("=");
          tags[key] = val || "";
        }
      }

      // Format: :username!username@username.tmi.twitch.tv PRIVMSG #channel :message
      const privmsgIdx = remaining.indexOf("PRIVMSG");
      if (privmsgIdx === -1) return null;

      const userSection = remaining.substring(0, privmsgIdx).trim();
      const afterPrivmsg = remaining.substring(privmsgIdx + 7).trim();

      const colonIdx = afterPrivmsg.indexOf(":");
      if (colonIdx === -1) return null;

      const messageContent = afterPrivmsg.substring(colonIdx + 1);

      // Extract username
      let username = tags["display-name"];
      if (!username) {
        const match = userSection.match(/:([^!]+)!/);
        username = match ? match[1] : "anonymous";
      }

      const badges = tags["badges"] || "";
      const isMod = badges.includes("moderator") || badges.includes("broadcaster");
      const isSubscriber = badges.includes("subscriber");
      const isVip = badges.includes("vip");
      const isFirstTimer = tags["first-msg"] === "1";

      return {
        id: tags["id"] || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        username,
        message: messageContent,
        isFirstTimer,
        isSubscriber,
        isMod,
        isVip,
        channel: this.channel || "twitch"
      };
    } catch {
      return null;
    }
  }
}
