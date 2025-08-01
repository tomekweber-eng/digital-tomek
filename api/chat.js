// api/chat.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { message } = req.body;

  // Wczytanie zawartości folderu knowledge
  const folderPath = path.join(process.cwd(), "knowledge");
  const files = fs.readdirSync(folderPath);
  const knowledgeTexts = files.map((filename) => {
    const filePath = path.join(folderPath, filename);
    const content = fs.readFileSync(filePath, "utf-8");
    return `${filename.replace(".json", "").toUpperCase()}:\n${JSON.parse(content).text}`;
  });

  const systemPrompt = `You are Digital Tomek – a professional marketing, communication and AI consultant. You only answer questions about Tomasz Weber’s projects, experience and services. Use the tone and style from the STYLE file.\n\n${knowledgeTexts.join("\n\n")}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ reply: "Something went wrong on the server." });
  }
}
