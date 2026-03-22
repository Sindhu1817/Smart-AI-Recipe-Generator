require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const app     = express();
const PORT    = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/generate-recipe", async (req, res) => {
  const { ingredients } = req.body;
  if (!ingredients) return res.status(400).json({ error: "No ingredients provided." });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Groq API key not set in .env file." });

  const prompt = `You are a world-class professional chef with 20 years of experience. A user has these ingredients: ${ingredients}.

Create a detailed, restaurant-quality recipe. Respond ONLY with a valid JSON object. No markdown, no backticks, no explanation outside the JSON.

Use EXACTLY this structure:
{
  "title": "Creative recipe name",
  "cuisine": "Cuisine type (e.g. Italian, Indian, Mexican, Mediterranean)",
  "cookTime": "Total time (e.g. 35 minutes)",
  "difficulty": "Easy or Medium or Hard",
  "servings": "Number of servings (e.g. 2-3 people)",
  "ingredients": [
    "200g boneless chicken breast, cut into 2cm cubes",
    "3 cloves garlic, finely minced",
    "2 tbsp extra virgin olive oil",
    "1 tsp smoked paprika",
    "Salt and freshly ground black pepper to taste"
  ],
  "steps": [
    "Prepare your ingredients: Pat the chicken dry with paper towels and season generously with salt, pepper, and smoked paprika on all sides. This helps build a flavourful crust when searing.",
    "Heat the olive oil in a large heavy-bottomed pan or cast iron skillet over medium-high heat until it shimmers. This usually takes about 2 minutes — a hot pan ensures the chicken sears rather than steams.",
    "Add the chicken pieces in a single layer, being careful not to overcrowd the pan. Sear undisturbed for 3-4 minutes until a golden-brown crust forms. Flip and cook another 3 minutes.",
    "Reduce heat to medium, add the minced garlic to the pan and stir constantly for 30 seconds until fragrant. Be careful not to burn the garlic as it will turn bitter.",
    "Add any sauce or liquid ingredients, scraping up the browned bits from the bottom of the pan — this is where the flavour lives. Simmer for 5-7 minutes until the sauce thickens slightly.",
    "Taste and adjust seasoning. Rest the dish for 2 minutes off the heat before serving to let the flavours settle and juices redistribute."
  ],
  "substitutes": [
    {"from": "chicken breast", "to": "tofu or paneer for vegetarian version"},
    {"from": "olive oil", "to": "avocado oil or unsalted butter"},
    {"from": "garlic", "to": "1/2 tsp garlic powder or shallots"},
    {"from": "smoked paprika", "to": "regular paprika + 1/4 tsp cumin"}
  ],
  "chefTip": "A specific, expert cooking tip relevant to this dish that improves the result significantly."
}

IMPORTANT RULES:
- ingredients: 6-10 items with exact quantities and prep notes
- steps: EXACTLY 5-7 steps, each 2-4 sentences long with detailed technique explanations, timing, and WHY each step matters
- substitutes: 3-5 practical swaps
- chefTip: one genuinely useful professional tip specific to this dish
- Be specific, technical, and educational in the steps`;

  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "You are a professional chef AI. Always respond with valid JSON only. No markdown, no backticks, no text outside the JSON object."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Groq API error" });
    }

    const text  = data.choices[0].message.content;
    const clean = text.replace(/```json|```/gi, "").trim();
    const recipe = JSON.parse(clean);
    res.json({ recipe });

  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Failed to generate recipe. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅  Smart Recipe Generator running at http://localhost:${PORT}\n`);
});
