# 🍳 Smart AI Recipe Generator

> An AI-powered recipe generator built with HTML, CSS, JavaScript, and Claude AI (Anthropic). Enter ingredients you have and instantly get a complete, professional recipe — with cooking steps, substitutions, a food image, and a downloadable PDF.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 AI Recipe Generation | Full recipes from any ingredients via Claude AI |
| 🖼️ Food Image | Auto-fetched via Unsplash (free, no key needed) |
| 🔄 Smart Substitutions | 3–5 ingredient swap suggestions per recipe |
| 👨‍🍳 Chef's Tip | A pro cooking tip for each dish |
| 🎤 Voice Input | Speak your ingredients (Web Speech API) |
| 📄 Download PDF | Print-ready recipe via browser |
| 🌙 Dark Mode | Persisted via localStorage |
| 📱 Responsive | Works on mobile, tablet, desktop |
| ⚡ Fast | No login, no signup, instant results |

---

## 🚀 Quick Start (Frontend Only — Easiest)

This app works **without any backend**. Just open `index.html` in your browser. The Claude API is called directly from the browser.

> ⚠️ **Note:** Calling the API from the browser exposes your API key in the Network tab. This is fine for local use / development / portfolio demo. For production, use the backend (server.js).

1. Clone or download this project
2. Open `index.html` in any modern browser
3. Enter ingredients → click **Generate My Recipe**

---

## 🔐 Secure Backend Setup (Recommended for Production)

To keep your API key safe on the server:

### Prerequisites
- Node.js v18+
- An Anthropic API key → [console.anthropic.com](https://console.anthropic.com/)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env

# 3. Add your Anthropic API key to .env
# ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx

# 4. Start the server
npm start
# or for hot-reload during development:
npm run dev

# 5. Open your browser
# http://localhost:3000
```

Then update `script.js` to use the server endpoint instead of calling Anthropic directly:

```js
// In script.js → callClaudeForRecipe(), replace fetch() with:
const response = await fetch("/api/generate-recipe", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ingredients })
});
const data   = await response.json();
return data.recipe;
```

---

## 📁 File Structure

```
smart-ai-recipe-generator/
│
├── index.html        ← Main UI (all sections, icons, layout)
├── style.css         ← All styling (dark mode, responsive, animations)
├── script.js         ← All logic (AI call, render, voice, PDF, dark mode)
│
├── server.js         ← Optional Express backend (API key proxy)
├── package.json      ← Node dependencies
├── .env.example      ← Environment variable template
├── .gitignore        ← Git ignore (keeps .env & node_modules out)
└── README.md         ← This file
```

---

## 🎨 Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES2022)
- **AI:** Anthropic Claude (`claude-sonnet-4-20250514`)
- **Icons:** Lucide Icons (CDN)
- **Fonts:** Google Fonts (Playfair Display + DM Sans)
- **Images:** Unsplash Source API (free, no key)
- **Voice:** Web Speech API (browser built-in)
- **PDF:** Browser Print API
- **Backend (optional):** Node.js + Express

---

## 🧠 How the AI Works

1. User enters ingredients (e.g. `chicken, lemon, garlic, rosemary`)
2. `script.js` builds a structured prompt asking Claude for a JSON recipe
3. Claude returns a JSON object with: title, cuisine, cook time, difficulty, servings, ingredients, steps, substitutions, chef tip
4. The app parses the JSON and renders each field into the recipe card
5. Simultaneously, Unsplash fetches a food photo matching the dish name

---

## 📸 Image System

Images are sourced from [Unsplash Source](https://source.unsplash.com/) using the recipe title and cuisine as search keywords. This is completely free and requires no API key. Images are random per search — regenerating gives a different image.

---

## 🌙 Dark Mode

Click the moon/sun icon in the top-right corner. The preference is saved in `localStorage` and persists across sessions.

---

## 🎤 Voice Input

Click the microphone button next to the input field. Speak your ingredients naturally — the Web Speech API transcribes them. Works in Chrome, Edge, and Safari.

> Not available in Firefox (no Web Speech API support).

---

## 📄 Download PDF

Click **Download PDF** after generating a recipe. A new print-ready window opens with a clean layout. Use your browser's Print → Save as PDF option.

---

## 🔧 Customisation

### Change the AI model
In `script.js`, find:
```js
const MODEL = "claude-sonnet-4-20250514";
```
Replace with any Anthropic model string.

### Change cuisine style
Modify the prompt in `callClaudeForRecipe()` to bias toward a specific cuisine, e.g. append:
```
Prefer Indian cuisine if possible.
```

### Add nutrition info
In the prompt, add a `"nutrition"` field to the JSON schema and render it in the card.

---

## 🙏 Credits

- [Anthropic](https://anthropic.com) — Claude AI
- [Unsplash](https://unsplash.com) — Food photography
- [Lucide](https://lucide.dev) — Icons
- [Google Fonts](https://fonts.google.com) — Typography

---

## 📜 License

MIT — free to use, modify, and distribute.

---

*Built as a real-world AI portfolio project. Suitable for resume showcase.*
