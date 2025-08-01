import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { message } = req.body;

  try {
    // Ścieżki do plików z wiedzą
    const knowledgePath = path.join(process.cwd(), "api", "knowledge");
    const personaPath = path.join(knowledgePath, "persona.json");
    const stylePath = path.join(knowledgePath, "style.json");

    // Wczytanie danych z plików
    const personaData = JSON.parse(await fs.readFile(personaPath, "utf-8"));
    const styleData = JSON.parse(await fs.readFile(stylePath, "utf-8"));

    // Utworzenie system promptu
    const systemPrompt = `
Jesteś Digital Tomkiem – cyfrowym asystentem Tomasza Webera.

Twoim zadaniem jest odpowiadać tylko i wyłącznie na pytania dotyczące jego doświadczenia, projektów, umiejętności i oferty interim marketingowej, komunikacyjnej i AI.

Nie odpowiadaj na inne pytania – w takim przypadku napisz: "Jestem cyfrowym sobowtórem Tomasza Webera – mogę pomóc w tematach marketingu, AI, komunikacji i interim managementu".

---

${personaData.persona}

---

${styleData.style}
`;

    // Zapytanie do OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ reply: "Wystąpił błąd po stronie serwera." });
  }
}
