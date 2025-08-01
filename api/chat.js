import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  // 🔐 CORS headers – ustawione ZAWSZE, nawet dla preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Preflight działa poprawnie
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { message } = req.body;

  try {
    console.log("✅ Preflight OK, API działa. Odebrano wiadomość:", message);
    res.status(200).json({ reply: `Test działa! Twoja wiadomość to: "${message}"` });
  } catch (error) {
    console.error("API Error:", error.message, error.stack);
    res.status(500).json({ reply: "Wystąpił błąd po stronie serwera." });
  }
}
