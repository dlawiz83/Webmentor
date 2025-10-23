# 🧠 WebMentor — Learn Smarter on Any Webpage

Transform any webpage into your personal learning assistant — powered by **Chrome’s Built-in AI**.

---

## 🚀 Overview

**WebMentor** is a Chrome extension that turns any webpage into an interactive learning guide.  
Whether you’re reading an article, research paper, or blog post — WebMentor helps you **summarize, simplify, translate, and proofread** content instantly, **without leaving the page**.

Designed for **students, non-native readers, and lifelong learners**, it makes the web easier to understand and more accessible — all with **on-device AI**, ensuring speed, privacy, and offline use.

---

## ✨ Features

| Feature                     | Description                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| 🪄 **Summarize**            | Get concise summaries of any webpage instantly.                                          |
| 🧩 **Simplify (4 modes)**   | Rephrase complex text for **Kids**, **Students**, **Professionals**, or **Custom** tone. |
| 🌍 **Translate**            | Translate content between multiple languages — instantly.                                |
| ✍️ **Proofread**            | Fix grammar and improve clarity with one click.                                          |
| 🔁 **Rewrite (optional)**   | Customize the tone or structure for clarity or creativity.                               |
| 🔊 **Read Aloud**           | Let Chrome read the page to you — with pause, resume, and speed control.                 |
| 💡 **Floating Action Menu** | Highlight any text and interact with AI right on the page.                               |

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **UI:** Tailwind CSS, Framer Motion, Lucide Icons
- **Platform:** Chrome Extension (Manifest V3)
- **APIs:** Chrome Built-in AI (Summarizer, Translator, Proofreader, Prompt API — optional)
- **Storage:** Chrome Local Storage

---

## ⚙️ How It Works

1. **Load** the extension in developer mode.
2. **Highlight** any text on a webpage.
3. **Open** the floating menu → choose an action (Summarize, Simplify, Translate, etc).
4. **View results instantly** — processed by Chrome’s local AI models.
5. **Use the popup interface** for advanced actions or read-aloud features.

All processing happens **locally** for privacy and offline accessibility.

---

## 📦 Installation (Developer Mode)

```bash
# Clone the repository
git clone https://github.com/dlawiz83/Webmentor.git
cd webmentor

# Build the extension
npm install
npm run build

```

Then:

1. Open `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load unpacked** → select the `/dist` folder
4. You’ll see the “💡 WebMentor” icon appear in your Chrome toolbar

---

## 🌐 Use Cases

- 🧑‍🎓 **Students** — Simplify lessons, summarize research papers, translate resources
- 🧑‍🏫 **Teachers** — Generate accessible summaries for multilingual classrooms
- 📰 **Readers** — Understand complex topics or read foreign content easily
- 👩‍💻 **Professionals** — Proofread and polish writing before publishing

---

## 🔒 Privacy First

WebMentor is **100% local** — it runs on Chrome’s built-in AI APIs, meaning:  
✅ No external servers  
✅ No data tracking  
✅ No internet dependency  
✅ Instant response times

---

## 💭 The Problem

Millions of students, readers, and professionals struggle to understand complex online content — whether due to language barriers, difficult vocabulary, or long, information-dense pages.
Switching between multiple tabs to translate, summarize, or simplify text interrupts learning flow and wastes time.

## 🚀 The Solution — WebMentor

WebMentor transforms any webpage into a personal learning coach.
By integrating directly into Chrome, it allows users to summarize, simplify, translate, proofread, and rewrite any content on the page itself, without leaving it — powered entirely by on-device AI models for privacy and speed.

---

## 🧠 Future Enhancements

- Add support for **Prompt API** (creative rewriting, Q&A, etc)
- Add **speech-to-text** accessibility (voice input)
- Expand to **Firefox & Edge**
- Support **on-page learning mode** (interactive explanations & quiz hints)

---

## 🏆 Built For

**Google Chrome Built-in AI Challenge 2025**  
Empowering learning accessibility for the next billion users.

---

## 👩‍💻 Team

**Ayesha Dawodi** — Developer & Designer  
🚀 _Builder in Residence_ (The Residency)

---

## 💬 One-liner Pitch

> **WebMentor** turns any webpage into your personal learning coach, summarize, simplify, translate, and proofread instantly with Chrome’s built-in AI.
