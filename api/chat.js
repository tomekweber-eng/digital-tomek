import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://tomaszweber.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST requests allowed" });

  const { message } = req.body;

  function detectLanguage(text) {
    const pl = /[ąćęłńóśźż]/i;
    const fr = /\b(je|le|la|les|est|vous|tu|bonjour)\b/i;
    const de = /\b(der|die|das|und|ich|nicht|mit|ist|was)\b/i;
    const es = /\b(hola|que|como|esta|usted|gracias|por)\b/i;

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

    // ✅ Deklarujemy context poprawnie
    let context = "";

    // ✅ Ładujemy konkretny plik
    const content = await fs.readFile(path.join(knowledgeDir, "digital_tomek_profile.json"), "utf-8");
    context += "\n" + content;

    const systemPrompt = `
You are Lucy – Tomek's AI assistant.

You help people understand who Tomek is, what he's worked on, and how he supports businesses with marketing, communication, and AI.

Be natural, helpful, and talk like someone close to Tomek – warm but to the point. Do NOT invite users to book meetings unless they ask for it.

Use the following context to answer:

${context}
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
    console.log("OPENAI RESPONSE:", data);

    const reply = data.choices?.[0]?.message?.content || "Sorry, I don't know how to answer that.";
    res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error.message, error.stack);
    res.status(500).json({ reply: "Server error occurred." });
  }
}
