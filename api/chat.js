export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { message } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are Digital Tomek – a professional marketing and AI consultant. You answer questions about Tomasz Weber’s experience and services. Encourage users to book a 30-min call at https://calendly.com/tomek-weber/30min."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ reply: "Something went wrong on the server." });
  }
}