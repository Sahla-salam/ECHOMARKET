
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const itemRoutes = require("./routes/itemRoutes");
const exchangeRequestRoutes = require("./routes/exchangeRequestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// --- 1. MONGODB CONNECTION ---
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://sahlasalamak:wHwRwv3Cf8S4gE4V@cluster0.5kena9z.mongodb.net/EchoMarket";

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- 2. MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());

// Serve public assets (images, etc.)
app.use("/public", express.static(path.join(__dirname, "../frontend/public")));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// --- 3. MODELS ---
const User = require("./models/User");

// --- 4. API ROUTES ---
app.use("/api/items", itemRoutes);

// ✅ FIXED ROUTE (Correct URL)
app.use("/api/exchange-requests", exchangeRequestRoutes);
app.use("/api/notifications", notificationRoutes);

// --- USER ROUTES ---
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
    console.log("🔐 Login attempt:", req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await User.findOne({ email, password });
    console.log("👤 User found:", user ? "Yes" : "No");
    
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", name: user.name, userId: user._id });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
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

// --- 5. FALLBACK FOR FRONTEND ---
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// --- 6. START SERVER ---
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
