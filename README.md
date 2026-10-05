# 🛡️ SafePlate AI — Open-Source Allergy Shield & Safe Kitchen Companion
> *Built for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

SafePlate AI is a **100% local, open-source AI culinary companion** designed to craft delicious, allergen-safe meals and safe ingredient substitutions for friends and loved ones with severe dietary restrictions (Celiac/Gluten-Free, Anaphylactic Peanut & Tree Nut Allergies, Lactose Intolerance, Shellfish, Low-FODMAP, etc.).

---

## 🌟 Why Open-Source AI?

1. **🔒 Medical & Health Privacy:** Allergy records and gut sensitivities are sensitive health information. Running **Ollama locally with Llama 3.2** ensures health data never touches third-party ad networks or cloud servers.
2. **💸 Zero Cost Forever:** Commercial APIs charge per token. A family or student cooking 3 meals a day shouldn't pay a monthly subscription to eat safely.
3. **📶 100% Offline Kitchen Reliability:** Works without internet directly on your kitchen laptop or tablet.
4. **🧠 Custom Culinary Safety Guardrails:** Deterministic cross-contamination auditing combined with open-weight intelligence.

---

## 🚀 Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Ollama](https://ollama.com/) (Running locally)

### 1. Pull the Open-Weight Model
```bash
ollama pull llama3.2:1b
```

### 2. Start SafePlate AI
```bash
node server.js
```
Visit `http://localhost:3000` in your browser!

---

## 🛠️ Architecture & Tech Stack

- **AI Inference Engine:** Ollama running `llama3.2:1b` / `llama3.2:3b` / `gemma2:2b` via local REST streaming.
- **Backend:** Zero-dependency Node.js HTTP proxy & SSE stream handler.
- **Frontend:** Semantic HTML5, Vanilla CSS Glassmorphism design system, Vanilla JavaScript with local storage state and interactive kitchen timer.
- **Session Tracking:** DevRelay Agent Session integration (`{% agent_session %}`).

---

## 📜 License
MIT License — Free and Open Source.
