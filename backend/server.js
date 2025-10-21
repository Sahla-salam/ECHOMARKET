// backend/server.js (CORRECTED)

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser"); // Retained for consistency with your existing code
const path = require("path");

const itemRoutes = require("./routes/itemRoutes");

const app = express();
const PORT = 5000;

// --- 1. MONGODB CONNECTION ---
mongoose
  .connect(
    "mongodb+srv://sahlasalamak:wHwRwv3Cf8S4gE4V@cluster0.5kena9z.mongodb.net/EchoMarket",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- 2. MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());

// 🟢 CRITICAL FIX: Explicitly serve the public directory under the /public URL path
// This ensures images saved to /frontend/public/uploads/... are accessible via /public/uploads/...
app.use("/public", express.static(path.join(__dirname, "../frontend/public")));

// Serve other frontend static files (CSS, JS, index.html etc.)
app.use(express.static(path.join(__dirname, "../frontend")));

// --- 3. IMPORT MODELS ---
const User = require("./models/User");

// --- 4. API ROUTES ---
app.use("/api/items", itemRoutes);

// ... User Routes (No changes) ...

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/reset", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Password found", password: user.password });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- 5. FALLBACK & SERVER START ---
// ...
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
