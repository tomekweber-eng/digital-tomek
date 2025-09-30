export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const { timestamp, question, answer, language } = req.body;

  try {
    const date = new Date(timestamp).toISOString().split("T")[0];
    const fileName = `conversations/${date}.json`;
    
    // GitHub API credentials
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'tomekweber-eng';
    const REPO_NAME = 'digital-tomek';
    
    if (!GITHUB_TOKEN) {
      console.error("Missing GITHUB_TOKEN");
      return res.status(500).json({ error: "GitHub token not configured" });
    }

    // 1. Pobierz istniejący plik (jeśli istnieje)
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

    // 2. Dodaj nową konwersację
    existingContent.push({
      timestamp,
      question,
      answer,
      language
    });

    // 3. Zapisz do GitHub
    const updatedContent = JSON.stringify(existingContent, null, 2);
    const encodedContent = Buffer.from(updatedContent).toString('base64');

    const updateResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${fileName}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Add conversation - ${timestamp}`,
          content: encodedContent,
          sha: sha || undefined
        })
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error("GitHub API error:", errorText);
      throw new Error(`GitHub API error: ${errorText}`);
    }

    const result = await updateResponse.json();
    
    res.status(200).json({ 
      success: true, 
      message: "Conversation saved to GitHub",
      file: fileName
    });

  } catch (error) {
    console.error("Save to GitHub error:", error);
    res.status(500).json({ 
      error: "Failed to save conversation", 
      details: error.message 
    });
  }
}
