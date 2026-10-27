# Privacy Policy

**Last Updated: October 2026**

ChatSignal ("we", "our", or "the application") is committed to protecting the privacy of content creators and their live stream viewers. This document details how data is handled during the operation of ChatSignal.

---

## 1. Principles of Data Processing

1. **Ephemeral Processing Only**: ChatSignal processes live public chat messages in volatile computer memory (RAM). In our standard MVP operation, chat messages are retained only within a 90–120 second sliding window for topic clustering and are then automatically purged.
2. **No Data Brokerage or Sale**: We do not sell, trade, or monetize viewer chat data, usernames, or telemetry.
3. **Streamer-Controlled**: The streamer controls which channels ChatSignal connects to and may disconnect or purge active memory at any time.

---

## 2. Information Handled

* **Public Twitch Chat Events**: Message content, timestamp, sender display name, and public chat badges (e.g., subscriber, VIP, first-time chatter).
* **AI Processing**: Messages passing the initial noise filter are passed to OpenAI API endpoints strictly for transient intent classification. These requests are configured under enterprise API terms where customer data is not used for model training.
* **PII Sanitization**: We actively filter recognizable personal identifying information (such as email addresses, telephone numbers, and street addresses) prior to AI processing.

---

## 3. Compliance with Twitch Developer Policies

ChatSignal operates strictly within the boundaries of the **Twitch Developer Services Agreement** and API Terms of Service. ChatSignal does not scrape unauthorized endpoints, bypass moderation rules, or store chat histories beyond real-time operational needs.

---

## 4. Contact

For inquiries regarding privacy practices or data handling, please open an issue in the GitHub repository or reach out to the project maintainers.
