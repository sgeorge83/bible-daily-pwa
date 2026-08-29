📖 E-GEEK Bible (PWA)
A lightweight Progressive Web App that delivers a **daily Bible verse experience** with contextual clarity and simplicity.

✨ Overview
E-GEEK Bible provides a daily verse by combining trusted scripture sources with AI-assisted summarization to improve readability and understanding—without altering theological meaning.
The goal is to make Scripture **accessible, clear, and distraction-free** for everyday reflection.

⚙️ How It Works
The system follows a multi-source pipeline:

1. 📅 Verse of the Day Source
* Fetches daily verse reference from:
  Bible.org API

2. 📖 Scripture Text Source
* Retrieves the full verse text from:
  English Standard Version (ESV) API

3. 🤖 AI Context Layer
* Uses OpenAI to generate a "short contextual explanation"
* Output rules:
  * 2–3 lines only
  * Simplifies meaning for clarity
  * No theological interpretation
  * No doctrinal commentary
  * No speculative content
4. 🧠 AI Design Principle
The AI layer is intentionally restricted to:
✔ Simplification of language
✔ Contextual clarity
✔ Human-readable summary

And strictly avoids:
❌ Theological opinions
❌ Doctrinal interpretation
❌ Religious debate or assumptions
❌ Hallucinated meaning beyond the verse

This ensures the content remains **neutral, safe, and text-faithful**.

5. 📌 Output Format

Each daily verse is displayed as:
* 📖 Bible Verse (ESV)
* 📅 Reference (Bible.org)
* 🤖 Short AI Summary (2–3 lines)
* ⚠️ Disclaimer

⚠️ Disclaimer
Scripture text is sourced directly from the "ESV (English Standard Version)" via official API.

The AI-generated explanation is:
* For "educational and readability purposes only"
* Not a replacement for theological study or interpretation
* Not doctrinal guidance

Users are encouraged to refer to the original scripture for full understanding.

6. 🌐 Technology Stack
* HTML / CSS / JavaScript
* Progressive Web App (PWA)
* Service Workers (offline support)
* Bible.org API
* ESV API
* OpenAI API (context summarization layer)
* GitHub Pages hosting

7. 📱 PWA Features
* Installable on mobile and desktop
* Offline caching support
* Fast loading experience
* App-like full-screen mode
* Home screen shortcut support

8. 🎯 Purpose
To provide a **clean, distraction-free daily scripture experience** enhanced with AI clarity—without changing the original meaning of the text.

9. 🔐 Data Integrity

* Scripture text is never modified
* AI output is strictly additive (not interpretive authority)
* Source text always remains primary reference

10. 📌 License
For personal and educational use.
