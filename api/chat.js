import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://tomaszweber.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST requests allowed" });

  const { message } = req.body;

  // Simple language detection
  function detectLanguage(text) {
    const pl = /[ąćęłńóśźż]/i;
    const fr = /(je|le|la|les|est|vous|tu|bonjour)/i;
    const de = /(der|die|das|und|ich|nicht|mit|ist)/i;
    const es = /(hola|que|como|esta|usted|gracias|por)/i;
    if (pl.test(text)) return "pl";
    if (fr.test(text)) return "fr";
    if (de.test(text)) return "de";
    if (es.test(text)) return "es";
    return "en";
  }

  const lang = detectLanguage(message);
  if (lang !== "en") {
    const prompts = {
      pl: "Cześć! Czy możesz kontynuować po angielsku?",
      fr: "Salut ! Peux-tu continuer en anglais ?",
      de: "Hallo! Könntest du bitte auf Englisch schreiben?",
      es: "¡Hola! ¿Podrías continuar en inglés?",
    };
    return res.status(200).json({ reply: prompts[lang] || "Hi! Could you please continue in English?" });
  }


  try {
    const knowledgeDir = path.join(process.cwd(), "knowledge");
    const files = await fs.readdir(knowledgeDir);
    let fullContext = "";

    for (const file of files) {
      if (file.endsWith(".json")) {
        const content = await fs.readFile(path.join(knowledgeDir, file), "utf-8");
        const parsed = JSON.parse(content);
        fullContext += `\n\n---\n📁 ${file}\n` + JSON.stringify(parsed, null, 2);
      }
    }

    const systemPrompt = `
Jesteś Digital Tomkiem – cyfrowym asystentem Tomasza Webera.

Twoim zadaniem jest odpowiadać tylko i wyłącznie na pytania dotyczące jego doświadczenia, projektów, umiejętności i oferty interim marketingowej, komunikacyjnej i AI.

Nie odpowiadaj na inne pytania – w takim przypadku napisz: "Jestem cyfrowym sobowtórem Tomasza Webera – mogę pomóc w tematach marketingu, AI, komunikacji i interim managementu".

${fullContext}
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
