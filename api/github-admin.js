export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://tomaszweber.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-GitHub-User");

  if (req.method === "OPTIONS") return res.status(200).end();

  const githubUser = req.headers['x-github-user'];
  const isAdmin = githubUser === 'tomekweber-eng';

  // Only allow admin access
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { action, data } = req.body;

    switch (action) {
      case 'create_chat_log':
        // Create an issue in your GitHub repository for chat logging
        const logResponse = await createGitHubChatLog(data);
        return res.status(200).json(logResponse);

      case 'get_chat_stats':
        // Get chat statistics from GitHub issues
        const stats = await getChatStats();
        return res.status(200).json(stats);

      case 'update_knowledge':
        // Update knowledge base files in the repository
        const updateResponse = await updateKnowledgeBase(data);
        return res.status(200).json(updateResponse);

      case 'get_repository_info':
        // Get repository information
        const repoInfo = await getRepositoryInfo();
        return res.status(200).json(repoInfo);

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('GitHub Admin Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createGitHubChatLog(chatData) {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  const repo = 'tomekweber-eng/digital-tomek';

  const issueBody = `
## Chat Log Entry

**Timestamp:** ${chatData.timestamp}
**User:** ${chatData.user}
**Message:** ${chatData.message}
**Response:** ${chatData.response}

---
*This is an automated chat log entry.*
  `;

  const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
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

  return await response.json();
}

async function getChatStats() {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  const repo = 'tomekweber-eng/digital-tomek';

  // Get issues with chat-log label
  const response = await fetch(`https://api.github.com/repos/${repo}/issues?labels=chat-log&state=all&per_page=100`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const issues = await response.json();
  
  const stats = {
    totalChats: issues.length,
    thisWeek: 0,
    thisMonth: 0,
    uniqueUsers: new Set(),
  };

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  issues.forEach(issue => {
    const createdAt = new Date(issue.created_at);
    if (createdAt > weekAgo) stats.thisWeek++;
    if (createdAt > monthAgo) stats.thisMonth++;
    
    // Extract user from title
    const userMatch = issue.title.match(/- (.+)$/);
    if (userMatch) stats.uniqueUsers.add(userMatch[1]);
  });

  stats.uniqueUsers = stats.uniqueUsers.size;

  return stats;
}

async function updateKnowledgeBase(data) {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  const repo = 'tomekweber-eng/digital-tomek';
  const { file, content, message } = data;

  // Get file SHA if it exists
  let sha = null;
  try {
    const getResponse = await fetch(`https://api.github.com/repos/${repo}/contents/knowledge/${file}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }
  } catch (e) {
    // File doesn't exist, will create new
  }

  // Update or create file
  const response = await fetch(`https://api.github.com/repos/${repo}/contents/knowledge/${file}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message || `Update ${file} via chat admin`,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
      sha: sha
    }),
  });

  return await response.json();
}

async function getRepositoryInfo() {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  const repo = 'tomekweber-eng/digital-tomek';

  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  const repoData = await response.json();
  
  return {
    name: repoData.name,
    fullName: repoData.full_name,
    description: repoData.description,
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    lastUpdate: repoData.updated_at,
    defaultBranch: repoData.default_branch,
    url: repoData.html_url
  };
}
