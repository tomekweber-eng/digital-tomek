import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  // 🔐 CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://tomaszweber.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🔄 Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { message } = req.body;

try {
  console.log("✅ Test API działa. Odebrano wiadomość:", message);
  res.status(200).json({ reply: `Test działa! Twoja wiadomość to: "${message}"` });
} catch (error) {
  console.error("API Error:", error.message, error.stack);
  res.status(500).json({ reply: "Wystąpił błąd po stronie serwera." });
}
