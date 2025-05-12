const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ Allow CORS requests from Lovable.dev (your frontend dev environment)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://lovable.dev",                      // Dev environment
    "https://your-live-app.lovable.app"         // 🔁 Replace with your real production Lovable domain later
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

// 🔁 Forward all requests to your N8N instance running on Railway
app.all("*", async (req, res) => {
  try {
    const response = await axios({
      url: `https://primary-production-8026.up.railway.app${req.originalUrl}`,
      method: req.method,
      headers: req.headers,
      data: req.body,
    });
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(error.response?.status || 500).send(error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CORS proxy server running on port ${PORT}`);
});
