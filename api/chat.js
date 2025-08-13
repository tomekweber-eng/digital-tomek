import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://tomaszweber.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-GitHub-User");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST requests allowed" });

  const { message } = req.body;
  const githubUser = req.headers['x-github-user'];
  const isAdmin = githubUser === 'tomekweber-eng';

  // Log chat interactions for GitHub-based administration
  const logEntry = {
    timestamp: new Date().toISOString(),
    user: githubUser || 'anonymous',
    message: message,
    isAdmin: isAdmin
  };

  try {
    // Log to GitHub (you can implement GitHub Issues API later for chat logs)
    console.log('Chat Log:', JSON.stringify(logEntry));
    
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

${isAdmin ? 'UWAGA: Rozmawiasz z administratorem (Tomasz Weber). Możesz odpowiedzieć na dodatkowe pytania techniczne o stronę internetową i systemy.' : ''}

${githubUser ? `Witaj ${githubUser}! Widzę, że jesteś zalogowany przez GitHub.` : ''}

Nie odpowiadaj na inne pytania – w takim przypadku napisz: "Jestem cyfrowym sobowtórem Tomasza Webera – mogę pomóc w tematach marketingu, AI, komunikacji i interim managementu".

Możesz również wspomnieć o jego profilu GitHub: https://github.com/tomekweber-eng

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
    
    // Auto-log important conversations to GitHub (if admin or notable interactions)
    if (isAdmin || message.length > 100) {
      try {
        await logChatToGitHub({
          timestamp: logEntry.timestamp,
          user: githubUser || 'anonymous',
          message: message,
          response: reply,
          isAdmin: isAdmin
        });
      } catch (logError) {
        console.error('Chat logging error:', logError);
        // Don't fail the request if logging fails
      }
    }
    
    res.status(200).json({ reply });
  } catch (error) {
    console.error("API Error:", error.message, error.stack);
    res.status(500).json({ reply: "Wystąpił błąd po stronie serwera." });
  }
}

async function logChatToGitHub(chatData) {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  if (!token) return; // Skip logging if no token configured
  
  const repo = 'tomekweber-eng/digital-tomek';
  
  const issueBody = `
## Chat Log Entry

**Timestamp:** ${chatData.timestamp}
**User:** ${chatData.user}
**Admin:** ${chatData.isAdmin ? 'Yes' : 'No'}

**Message:**
\`\`\`
${chatData.message}
\`\`\`

**Response:**
\`\`\`
${chatData.response}
\`\`\`

---
*This is an automated chat log entry.*
  `;

  await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `[CHAT LOG] ${new Date().toISOString().split('T')[0]} - ${chatData.user}`,
      body: issueBody,
      labels: ['chat-log', 'automated']
    }),
  });
}