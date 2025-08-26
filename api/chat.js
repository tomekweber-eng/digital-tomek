import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://tomaszweber.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST requests allowed" });

  const { message } = req.body;

  const lang = /[ąćęłńóśźż]/i.test(message) ? "pl" : "en";
  if (lang !== "en") {
    return res.status(200).json({ reply: "Could you please continue in English?" });
  }

  try {
    const knowledgeDir = path.join(process.cwd(), "knowledge");
    const files = await fs.readdir(knowledgeDir);
    let context = "";

    for (const file of files) {
      if (file.endsWith(".json")) {
        const content = await fs.readFile(path.join(knowledgeDir, file), "utf-8");
        context += "\n" + content;
      }
    }

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
        temperature: 0.4
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I don't know how to answer that.";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ reply: "Server error." });
  }
}
