/**
 * ============================================================
 *  SMART AI RECIPE GENERATOR — script.js
 *  AI: Groq API (free) via server.js
 *  Images: Pollinations AI (free, no API key needed)
 *  Voice: Web Speech API with full browser support fix
 * ============================================================
 */

let currentRecipe    = null;
let isGenerating     = false;
let voiceRecognition = null;
let isListening      = false;

const loaderMessages = [
  "Consulting the AI chef... 👨‍🍳",
  "Mixing flavours and ideas... 🌿",
  "Checking your pantry... 🧺",
  "Crafting the perfect recipe... ✨",
  "Almost ready to plate... 🍽️"
];
let loaderInterval = null;

const $  = id => document.getElementById(id);
const el = id => $(id);

window.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  initDarkMode();
  initVoiceInput();
  el("ingredientInput").addEventListener("keydown", e => {
    if (e.key === "Enter") generateRecipe();
  });
});

// =============================================================
//  DARK MODE
// =============================================================
function initDarkMode() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") applyDark(true);
  el("darkToggle").addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    applyDark(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}
function applyDark(on) {
  document.body.classList.toggle("dark", on);
  el("moonIcon").style.display = on ? "none" : "";
  el("sunIcon").style.display  = on ? ""     : "none";
}

// =============================================================
//  VOICE INPUT — Fixed for Chrome, Edge, Safari
// =============================================================
function initVoiceInput() {
  // Check for browser support
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition;

  if (!SpeechRecognition) {
    el("voiceBtn").title = "Voice input not supported in this browser";
    el("voiceBtn").style.opacity = "0.4";
    el("voiceBtn").style.cursor  = "not-allowed";
    return;
  }

  el("voiceBtn").addEventListener("click", () => {
    if (isListening) {
      stopVoice();
    } else {
      startVoice(SpeechRecognition);
    }
  });
}

function startVoice(SpeechRecognition) {
  // Create fresh instance each time (fixes Safari/Chrome restart bug)
  voiceRecognition = new SpeechRecognition();
  voiceRecognition.continuous    = false;
  voiceRecognition.interimResults = false;
  voiceRecognition.lang          = "en-US";
  voiceRecognition.maxAlternatives = 1;

  voiceRecognition.onstart = () => {
    isListening = true;
    el("voiceBtn").classList.add("active");
    showToast("🎤 Listening... speak your ingredients");
  };

  voiceRecognition.onresult = e => {
    const transcript = e.results[0][0].transcript;
    el("ingredientInput").value = transcript;
    showToast("✅ Got it: " + transcript.substring(0, 50));
    stopVoice();
  };

  voiceRecognition.onerror = e => {
    let msg = "Voice failed. ";
    if (e.error === "not-allowed")  msg = "Microphone permission denied. Allow mic access in browser settings.";
    if (e.error === "no-speech")    msg = "No speech detected. Try again.";
    if (e.error === "network")      msg = "Network error. Check your connection.";
    showToast(msg, "error");
    stopVoice();
  };

  voiceRecognition.onend = () => { stopVoice(); };

  try {
    voiceRecognition.start();
  } catch(e) {
    showToast("Could not start microphone. Try again.", "error");
    stopVoice();
  }
}

function stopVoice() {
  isListening = false;
  el("voiceBtn").classList.remove("active");
  if (voiceRecognition) {
    try { voiceRecognition.stop(); } catch(e) {}
    voiceRecognition = null;
  }
}

// =============================================================
//  FILL EXAMPLE
// =============================================================
function fillExample(text) {
  el("ingredientInput").value = text;
  el("ingredientInput").focus();
}

// =============================================================
//  GENERATE RECIPE
// =============================================================
async function generateRecipe() {
  if (isGenerating) return;

  const rawInput = el("ingredientInput").value.trim();
  if (!rawInput) {
    showToast("Please enter at least one ingredient!", "error");
    el("ingredientInput").focus();
    return;
  }

  isGenerating = true;
  el("generateBtn").disabled = true;
  showLoader();

  try {
    const recipe = await callGroqForRecipe(rawInput);
    currentRecipe = recipe;
    renderRecipe(recipe);
    loadFoodImage(recipe.title, recipe.cuisine);
    el("resultSection").style.display = "block";
    el("resultSection").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    console.error("Generation error:", err);
    showToast("Failed to generate recipe: " + err.message, "error");
  } finally {
    hideLoader();
    isGenerating = false;
    el("generateBtn").disabled = false;
  }
}

// =============================================================
//  GROQ API via server.js proxy
// =============================================================
async function callGroqForRecipe(ingredients) {
  const response = await fetch("/api/generate-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Server error");
  }
  const data = await response.json();
  return data.recipe;
}

// =============================================================
//  RENDER RECIPE CARD
// =============================================================
function renderRecipe(r) {
  el("recipeTitle").textContent       = r.title      || "Unnamed Recipe";
  el("cookTime").textContent          = r.cookTime   || "—";
  el("difficulty").textContent        = r.difficulty || "—";
  el("servings").textContent          = r.servings   || "—";
  el("cuisineBadge").textContent      = r.cuisine    || "World";
  el("imageTitlePreview").textContent = r.title      || "";

  // Ingredients
  const ingList = el("ingredientList");
  ingList.innerHTML = "";
  (r.ingredients || []).forEach(ing => {
    const li = document.createElement("li");
    li.textContent = ing;
    ingList.appendChild(li);
  });

  // Steps — detailed
  const stepsList = el("stepsList");
  stepsList.innerHTML = "";
  (r.steps || []).forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsList.appendChild(li);
  });

  // Substitutes
  const grid = el("substitutesGrid");
  grid.innerHTML = "";
  (r.substitutes || []).forEach(sub => {
    const div = document.createElement("div");
    div.className = "substitute-item";
    div.innerHTML = `
      <span class="sub-from">${escHtml(sub.from)}</span>
      <span class="sub-arrow">→</span>
      <span class="sub-to">${escHtml(sub.to)}</span>
    `;
    grid.appendChild(div);
  });

  // Chef tip
  if (r.chefTip) {
    el("chefTip").style.display = "flex";
    el("chefTipText").textContent = r.chefTip;
  } else {
    el("chefTip").style.display = "none";
  }

  lucide.createIcons();

  // Difficulty color
  el("difficulty").style.color =
    r.difficulty === "Easy" ? "var(--green)"  :
    r.difficulty === "Hard" ? "var(--accent)" :
    "var(--text)";
}

// =============================================================
//  FOOD IMAGE — Pollinations AI
// =============================================================
function loadFoodImage(title, cuisine) {
  el("imagePlaceholder").style.display = "flex";
  el("recipeImage").style.display      = "none";

  const prompt = encodeURIComponent(
    `${title} ${cuisine || ""} food dish, ultra realistic professional food photography, ` +
    `beautifully plated, gourmet restaurant, cinematic lighting, 8k, high detail, ` +
    `shallow depth of field, warm golden tones, appetizing`
  );

  const url = `https://image.pollinations.ai/prompt/${prompt}?width=900&height=500&nologo=true&enhance=true&seed=${Date.now()}`;

  const img = el("recipeImage");

  img.onload = () => {
    el("imagePlaceholder").style.display = "none";
    img.style.display = "block";
  };

  img.onerror = () => {
    // Fallback: TheMealDB
    fetch("https://www.themealdb.com/api/json/v1/1/random.php")
      .then(r => r.json())
      .then(data => {
        img.onload = () => {
          el("imagePlaceholder").style.display = "none";
          img.style.display = "block";
        };
        img.onerror = () => {
          el("imagePlaceholder").innerHTML =
            "<span style='font-size:4rem'>🍽️</span><span style='color:rgba(255,255,255,0.5)'>Image unavailable</span>";
        };
        img.src = data.meals[0].strMealThumb;
      })
      .catch(() => {
        el("imagePlaceholder").innerHTML =
          "<span style='font-size:4rem'>🍽️</span><span style='color:rgba(255,255,255,0.5)'>Image unavailable</span>";
      });
  };

  img.src = url;
  img.alt = title;
}

// =============================================================
//  PDF DOWNLOAD
// =============================================================
function downloadPDF() {
  if (!currentRecipe) { showToast("Generate a recipe first!", "error"); return; }
  const win = window.open("", "_blank");
  win.document.write(buildPrintHTML(currentRecipe));
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 600);
}

function buildPrintHTML(r) {
  const steps = (r.steps || []).map((s, i) => `<li><strong>Step ${i+1}:</strong> ${s}</li>`).join("");
  const ings  = (r.ingredients || []).map(i => `<li>${i}</li>`).join("");
  const subs  = (r.substitutes || []).map(s => `<li><b>${s.from}</b> → ${s.to}</li>`).join("");
  return `<!DOCTYPE html><html><head>
    <meta charset="UTF-8"/><title>${r.title}</title>
    <style>
      body{font-family:Georgia,serif;max-width:680px;margin:40px auto;color:#1a120b;line-height:1.8}
      h1{color:#d4420f;font-size:2rem;margin-bottom:6px}
      h2{color:#5c2d08;font-size:1.05rem;border-bottom:2px solid #edd8c0;padding-bottom:6px;margin:24px 0 12px;text-transform:uppercase;letter-spacing:.06em}
      .meta{display:flex;gap:24px;background:#fdf8f3;padding:14px 18px;border-radius:8px;margin-bottom:24px;font-size:.875rem}
      .meta span b{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;color:#8a6245;margin-bottom:2px}
      ul,ol{padding-left:22px} li{margin-bottom:8px;font-size:.9rem}
      ol li{padding:6px 0;border-bottom:1px solid #f5e8d8}
      .tip{background:#fffae8;border-left:4px solid #c9972a;padding:12px 18px;border-radius:4px;margin-top:20px;font-size:.9rem}
      .footer{margin-top:40px;padding-top:16px;border-top:1px solid #edd8c0;font-size:.75rem;color:#aaa;text-align:center}
      @media print{body{margin:20px}}
    </style></head><body>
    <h1>${r.title}</h1>
    <div class="meta">
      <span><b>Cuisine</b>${r.cuisine||'—'}</span>
      <span><b>Cook Time</b>${r.cookTime||'—'}</span>
      <span><b>Difficulty</b>${r.difficulty||'—'}</span>
      <span><b>Serves</b>${r.servings||'—'}</span>
    </div>
    <h2>Ingredients</h2><ul>${ings}</ul>
    <h2>Instructions</h2><ol>${steps}</ol>
    <h2>Substitutions</h2><ul>${subs}</ul>
    ${r.chefTip ? `<div class="tip">👨‍🍳 <strong>Chef's Tip:</strong> ${r.chefTip}</div>` : ""}
    <div class="footer">Generated by Smart AI Recipe Generator &mdash; Crafted by Sindhu Gandi</div>
  </body></html>`;
}

// =============================================================
//  RESET
// =============================================================
function resetApp() {
  el("resultSection").style.display = "none";
  el("ingredientInput").value = "";
  el("ingredientInput").focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
  currentRecipe = null;
}

// =============================================================
//  LOADER
// =============================================================
function showLoader() {
  el("loaderOverlay").style.display = "grid";
  let i = 0;
  el("loaderText").textContent = loaderMessages[0];
  loaderInterval = setInterval(() => {
    i = (i + 1) % loaderMessages.length;
    el("loaderText").textContent = loaderMessages[i];
  }, 2000);
}
function hideLoader() {
  el("loaderOverlay").style.display = "none";
  clearInterval(loaderInterval);
}

// =============================================================
//  TOAST
// =============================================================
function showToast(msg, type = "info") {
  const toast = el("toast");
  toast.textContent = msg;
  toast.className   = "toast show" + (type === "error" ? " error" : "");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.className = "toast"; }, 4000);
}

// =============================================================
//  UTILITY
// =============================================================
function escHtml(str) {
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
