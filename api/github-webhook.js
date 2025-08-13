export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://tomaszweber.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-GitHub-Event, X-GitHub-Delivery, X-Hub-Signature-256");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST requests allowed" });

  try {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    // Log all GitHub events for chat administration
    console.log('GitHub Webhook:', {
      event: event,
      timestamp: new Date().toISOString(),
      repository: payload.repository?.full_name,
      sender: payload.sender?.login
    });

    // Handle specific events for chat administration
    switch (event) {
      case 'issues':
        if (payload.action === 'opened' && payload.issue.title.startsWith('[CHAT LOG]')) {
          // Handle chat log creation
          console.log('Chat log issue created:', payload.issue.number);
        }
        break;
        
      case 'push':
        // Handle repository updates - could trigger knowledge base refresh
        if (payload.ref === 'refs/heads/main') {
          console.log('Main branch updated - consider refreshing knowledge base');
        }
        break;
        
      case 'repository':
        // Handle repository events
        console.log('Repository event:', payload.action);
        break;
    }

    res.status(200).json({ message: 'Webhook received successfully' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
