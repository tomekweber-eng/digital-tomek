import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  // 🔐 CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://tomaszweber.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔄 Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { message } = req.body;

  try {
    // ✅ poprawiona ścieżka
    const knowledgePath = path.join(process.cwd(), "knowledge");

    const personaData = JSON.parse(await fs.readFile(path.join(knowledgePath, "persona.json"), "utf-8"));
    const styleData = JSON.parse(await fs.readFile(path.join(knowledgePath, "style.json"), "utf-8"));

    const systemPrompt = `
Jesteś Digital Tomkiem – cyfrowym asystentem Tomasza Webera.

Twoim zadaniem jest odpowiadać tylko i wyłącznie na pytania dotyczące jego doświadczenia, projektów, umiejętności i oferty interim marketingowej, komunikacyjnej i AI.

Nie odpowiadaj na inne pytania – w takim przypadku napisz: "Jestem cyfrowym sobowtórem Tomasza Webera – mogę pomóc w tematach marketingu, AI, komunikacji i interim managementu".

---

${personaData.persona}

---

${styleData.style}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error.message, error.stack);
    res.status(500).json({ reply: "Wystąpił błąd po stronie serwera." });
  }
}
