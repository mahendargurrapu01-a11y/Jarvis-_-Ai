const express = require("express");

const app = express();

app.use(express.json({ limit: "20kb" }));

// CORS security
const allowedOrigins = (
  process.env.ALLOWED_ORIGIN || "http://localhost:3000"
).split(",").map(origin => origin.trim());

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Home route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    assistant: "Jarvis AI",
    message: "Jarvis server is running!"
  });
});

// AI Chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please enter a valid message."
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key is not configured on the server."
      });
    }

    const aiResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-6.2-astra",
          instructions:
            "You are Jarvis, a helpful personal AI assistant. Respond clearly and politely.",
          input: message.trim()
        })
      }
    );

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error("OpenAI API error:", data);

      return res.status(502).json({
        error: "AI service is temporarily unavailable."
      });
    }

    const reply = (data.output || [])
      .filter(item => item.type === "message")
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    res.json({
      reply: reply || "Sorry, I couldn't generate a response."
    });

  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Something went wrong. Please try again."
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Jarvis AI server running on port ${PORT}`);
});
