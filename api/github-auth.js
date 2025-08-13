export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://tomaszweber.com");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { code, action } = req.query;

  try {
    if (action === 'login') {
      // Step 1: Redirect to GitHub OAuth
      const clientId = process.env.GITHUB_CLIENT_ID;
      const redirectUri = `${process.env.VERCEL_URL || 'https://digital-tomek.vercel.app'}/api/github-auth`;
      const scope = 'read:user,repo';
      
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
      
      return res.redirect(302, githubAuthUrl);
    }

    if (code) {
      // Step 2: Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.access_token) {
        // Step 3: Get user info
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        const userData = await userResponse.json();
        
        // Step 4: Store user session and redirect back to main site
        const userInfo = {
          login: userData.login,
          name: userData.name,
          avatar_url: userData.avatar_url,
          isAdmin: userData.login === 'tomekweber-eng'
        };

        // Create a simple session token (in production, use proper JWT)
        const sessionToken = Buffer.from(JSON.stringify(userInfo)).toString('base64');
        
        // Redirect back to main site with session info
        res.setHeader('Set-Cookie', `github_session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400`);
        return res.redirect(302, '/?github_auth=success');
      }
    }

    res.status(400).json({ error: 'Authentication failed' });
  } catch (error) {
    console.error('GitHub Auth Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
