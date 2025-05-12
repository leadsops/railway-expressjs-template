const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

// ✅ Allow CORS requests from Lovable.dev (your frontend dev environment)
app.use(cors({
  origin: "https://lovable.dev",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

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
