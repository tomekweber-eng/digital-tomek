import fs from "fs";
import path from "path";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function detectLanguage(text) {
  const polishChars = /[ąćęłńóśźż]/i;
  return polishChars.test(text) ? "pl" : "en";
}

function loadKnowledgeFiles() {
  const knowledgeDir = path.join(process.cwd(), "knowledge");
  const files = fs.readdirSync(knowledgeDir);
  let context = [];

  files.forEach((file) => {
    const filePath = path.join(knowledgeDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (data.content) {
      context.push(`${data.title}:\n${data.content}`);
    } else if (data.style) {
      context.push(`Style:\n${data.style}`);
    } else if (data.persona) {
      context.push(`Persona:\n${data.persona}`);
    }
  });

  return context.join("\n\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { message } = req.body;
  const lang = detectLanguage(message);
  const calendly = "https://calendly.com/tomek-weber/30min";
  const knowledge = loadKnowledgeFiles();

  const systemPrompt = `
You are Digital Tomek – AI version of Tomasz Weber, a seasoned marketing and AI consultant.
You ONLY answer questions about his experience, services, style, projects, and expertise.

Respond in the language of the user (Polish or English).

Always:
- Keep the answers short but precise
- Format key points with bullet points and **bold**
- Highlight key phrases with 🔮 or use purple where markdown is supported
- End with: "Want to chat live? Book here 👉 ${calendly}"

If you don’t know the answer, say so – don’t make it up.

Knowledge base:
${knowledge}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    });

    const reply = response.choices?.[0]?.message?.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ reply: "Server error – try again later." });
  }
}
