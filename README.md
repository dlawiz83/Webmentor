# 🧠 WebMentor — Learn Smarter on Any Webpage

Transform any webpage into your personal learning assistant — powered by **Chrome’s Built-in AI**.

---

## 🚀 Overview

**WebMentor** is a Chrome extension that turns any webpage into an interactive learning guide.  
Whether you’re reading an article, research paper, or blog post — WebMentor helps you **summarize, simplify, translate, rewrite, and proofread** content instantly, **without leaving the page**.

Designed for **students, non-native readers, and lifelong learners**, it makes the web easier to understand and more accessible — all with **on-device AI**, ensuring speed, privacy, and offline use.

---

## ✨ Features

| Feature                     | Description                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| 🪄 **Summarize**            | Get concise summaries of any webpage instantly.                                          |
| 🧩 **Simplify (4 modes)**   | Rephrase complex text for **Kids**, **Students**, **Professionals**, or **Custom** tone. |
| 🌍 **Translate**            | Translate content between multiple languages — instantly.                                |
| ✍️ **Proofread**            | Fix grammar and improve clarity with one click.                                          |
| 🔁 **Rewrite**              | Customize the tone or structure for clarity or creativity.                               |
| 🔊 **Read Aloud**           | Let Chrome read the page to you — with pause, resume, and speed control.                 |
| 💡 **Floating Action Menu** | Highlight any text and interact with AI right on the page.                               |

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **UI:** Tailwind CSS, Framer Motion, Lucide Icons
- **Platform:** Chrome Extension (Manifest V3)
- **APIs:** Chrome Built-in AI (Summarizer, Translator, Proofreader, Prompt API, Rewriter)

---

## ⚙️ How It Works

1. **Load** the extension in developer mode.
2. **Highlight** any text on a webpage.
3. **Open** the floating menu → choose an action (Summarize, Simplify, Translate, etc).
4. **View results instantly** — processed by Chrome’s local AI models.
5. **Use the popup interface** for advanced actions.

All processing happens **locally** for privacy and offline accessibility.

---

### ⚙️ Installation & Setup

Before running WebMentor, make sure Chrome’s built-in AI environment is properly set up.  
Follow these steps carefully to ensure everything works as intended.

---

```bash
# Clone the repository
git clone https://github.com/dlawiz83/Webmentor.git
cd frontend

```

### 🧩 1. Prerequisites

- ✅ Use the **latest version of Google Chrome** or Dev build, Canary (up-to-date).
- ✅ Go to `chrome://components` and confirm that **Optimization Guide On-Device Model** is installed and updated.
  - If you don’t see it, click **“Check for update”** to install it.

---

### 🪄 2. Enable Required Chrome Flags

Enable the following flags in your Chrome browser:

- **Optimization Guide On-Device**  
  Go to: `chrome://flags/#optimization-guide-on-device`  
  → Set to **Enabled**  
  → Click **Relaunch**

- **Rewriter API for Gemini Nano**  
  Go to: `chrome://flags/#rewriter-api-for-gemini-nano`  
  → Set to **Enabled**  
  → Click **Relaunch**

- **Proofreader API for Gemini Nano**  
  Go to: `chrome://flags/#proofreader-api-for-gemini-nano`  
  → Set to **Enabled**  
  → Click **Relaunch**

---

### ✏️ 3. Register for API Access (Origin Trials)

Some APIs (like **Rewriter** and **Proofreader**) require registration in Chrome’s Origin Trials.

1. Visit the **Rewriter API Origin Trial** page.

   - Click **Register** and fill out the form.
   - In the _Web Origin_ field, provide your extension ID in this format:
     ```
     chrome-extension://YOUR_EXTENSION_ID
     ```
   - Submit the form and copy the **token** you receive.

2. Do the same for the **Proofreader API Origin Trial**.
   - Register and use the same `chrome-extension://YOUR_EXTENSION_ID`.
   - Copy the provided token.

---

### 🔑 4. Add Tokens to Environment File

Create a `.env` file in the root of your project and add the following lines:

```env
VITE_REWRITE_TOKEN=your_rewriter_api_token_here
VITE_CHROME_AI_TOKEN=your_proofreader_api_token_here

```

Save the file.
These tokens authorize your extension to access the experimental Chrome APIs locally.

### 5. Build the extension

```bash

npm install
npm run build

```

Then:

1. Open `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load unpacked** → select the `/dist` folder
4. You’ll see the “ WebMentor” icon appear in your Chrome toolbar

### 6. Model Download

When you trigger one of WebMentor’s AI actions (e.g., Summarize, Proofread, or Simplify),
Chrome will automatically begin downloading the required on-device model.

You can view live download logs in the Console (Developer Tools).
Once downloaded, all processing will run locally and offline.

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
