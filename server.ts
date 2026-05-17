import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { PLAYERS } from "./src/data/players";
import { QUESTIONS } from "./src/data/questions";

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// Advanced Guessing Engine Logic
app.post("/api/game/next-step", async (req, res) => {
  const { history, askedQuestionIds } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Gemini API key not configured" });
  }

  try {
    // 1. Strict Filtering based on history attributes
    let remainingPlayers = [...PLAYERS];
    const knownFacts: string[] = [];

    for (const h of history) {
      if (!h.attribute) continue;
      knownFacts.push(`${h.attribute}: ${h.answer}`);

      if (h.answer === 'yes') {
        remainingPlayers = remainingPlayers.filter(p => p[h.attribute as keyof typeof p] === true);
      } else if (h.answer === 'no') {
        remainingPlayers = remainingPlayers.filter(p => p[h.attribute as keyof typeof p] === false);
      }
    }

    // 2. Available attributes for the next question
    const askedAttributes = history.map(h => h.attribute);
    const availableQuestions = QUESTIONS.filter(q => !askedAttributes.includes(q.attribute));

    const playerSummaries = remainingPlayers.slice(0, 15).map(p => ({
      name: p.name,
      franchises: p.franchises,
      indian: p.indian,
      batsman: p.batsman,
      bowler: p.bowler,
      all_rounder: p.all_rounder,
      wicketkeeper: p.wicketkeeper,
      captain: p.captain,
      age: p.under_25 ? '<25' : p.above_35 ? '>35' : '25-35'
    }));

    const systemPrompt = `You are an advanced IPL Player Guessing AI.
The user is thinking of an IPL player. Your goal is to identify them in <12 questions.

==================================================
CURRENT STATE
==================================================
Question Count: ${history.length}
Remaining Players: ${remainingPlayers.length}
Known Facts: ${JSON.stringify(knownFacts)}
Top Candidates: ${JSON.stringify(playerSummaries, null, 2)}

AVAILABLE ATTRIBUTES & DEFAULT TEXTS:
${availableQuestions.map(q => `- ${q.attribute}: "${q.text}"`).join('\n')}

==================================================
ATTRIBUTE DEPENDENCY RULES (MANDATORY)
==================================================
1. NATIONALITY: 
   - IF Overseas: NEVER ask if Indian or nationality again. Ask country, role, team.
   - IF Indian: NEVER ask overseas-related questions.
2. ROLE:
   - IF Batsman: NO bowling type/arm questions. Ask batting style, position, WK, captain.
   - IF Bowler: Ask Fast or Spin? THEN arm. Avoid batting specific questions.
   - IF All-rounder: Ask both styles.
   - IF Wicketkeeper: Ask batting style, captain. Avoid bowling questions.

==================================================
SMART QUESTION SELECTION
==================================================
1. Filter players strictly.
2. Analyze remaining attributes and choose the MOST informative one (aim for ~50/50 split).
3. Rephrase the "DEFAULT TEXT" into a natural, human-sounding, expert question.
4. If remaining players <= 3 OR confidence is very high, GUESS the player.

==================================================
OUTPUT FORMAT (JSON ONLY)
==================================================
If asking a question:
{
  "type": "question",
  "question_number": ${history.length + 1},
  "attribute": "attribute_name",
  "question": "Natural rephrased question",
  "reason": "Expert reasoning",
  "remaining_players_count": ${remainingPlayers.length}
}

If guessing:
{
  "type": "guess",
  "guess": "Full Player Name",
  "confidence": "95%",
  "reason": "Summary of evidence"
}

If finished or no players left, provide a final state.`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.text;
    res.json(JSON.parse(responseText || "{}"));
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("429") || error.status === 429) {
      return res.status(429).json({ error: "Quotas exceeded. Please try again in a few seconds." });
    }
    res.status(500).json({ error: "Failed to process game step" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
