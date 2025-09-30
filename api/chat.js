import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://tomaszweber.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST requests allowed" });

  const { message } = req.body;

  // Język detekcji
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
    const files = await fs.readdir(knowledgeDir);
    let context = "";

    for (const file of files) {
      if (file.endsWith(".json")) {
        const content = await fs.readFile(path.join(knowledgeDir, file), "utf-8");
        context += `\n\n---\n📁 ${file}\n${content}`;
      }
    }

    const systemPrompt = `
You are Lucy – Tomek's AI assistant.

You help people understand who Tomek is, what he's worked on, and how he supports businesses with marketing, communication, and AI.

Be natural, helpful, and talk like someone close to Tomek – warm but to the point. Do NOT invite users to book meetings unless they ask for it.

IMPORTANT: When discussing these projects, ALWAYS include their website links as plain URLs in your text:
- MathEddie: https://matheddie.com
- Replugged: https://replugged.pl

DO NOT use markdown formatting or brackets around links. Just write the URL directly in the text.

CORRECT examples:
- "You can explore MathEddie at https://matheddie.com to see more"
- "Learn more about Replugged at https://replugged.pl"
- "Visit https://matheddie.com for details"

INCORRECT examples (DO NOT do this):
- "[https://matheddie.com]" 
- "(https://matheddie.com)"
- "[link](https://matheddie.com)"

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

    // Zapisz konwersację do GitHub (asynchronicznie, bez blokowania odpowiedzi)
    const conversationData = {
      timestamp: new Date().toISOString(),
      question: message,
      answer: reply,
      language: lang
    };

    // Zapisz bezpośrednio do GitHub (bez dodatkowego endpointu)
    try {
      const date = new Date().toISOString().split("T")[0];
      const fileName = `conversations/${date}.json`;
      
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
      const REPO_OWNER = 'tomekweber-eng';
      const REPO_NAME = 'digital-tomek';
      
      if (GITHUB_TOKEN) {
        // Pobierz istniejący plik
        let existingContent = [];
        let sha = null;
        
        try {
          const getResponse = await fetch(
            `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`,
            {
              headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            }
          );
          
          if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            existingContent = JSON.parse(content);
          }
        } catch (e) {
          console.log("File doesn't exist yet, creating new one");
        }

        // Dodaj nową konwersację
        existingContent.push(conversationData);

        // Zapisz do GitHub
        const updatedContent = JSON.stringify(existingContent, null, 2);
        const encodedContent = Buffer.from(updatedContent).toString('base64');

        await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `Add conversation - ${conversationData.timestamp}`,
              content: encodedContent,
              sha: sha || undefined
            })
          }
        );
        
        console.log("✅ Conversation saved to GitHub:", fileName);
      } else {
        console.warn("⚠️ GITHUB_TOKEN not found - conversation not saved");
      }
    } catch (saveError) {
      console.error("❌ Failed to save conversation to GitHub:", saveError);
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error.message, error.stack);
    res.status(500).json({ reply: "Server error occurred." });
  }
}
