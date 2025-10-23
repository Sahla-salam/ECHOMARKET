const express = require("express");
const router = express.Router();
const ExchangeRequest = require("../models/exchangerequests");

// ✅ Get all exchange requests
router.get("/requests", async (req, res) => {
  try {
    const requests = await ExchangeRequest.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

// ✅ Add new request
router.post("/requests", async (req, res) => {
  try {
    const newReq = new ExchangeRequest(req.body);
    await newReq.save();
    res.status(201).json({ message: "Request added", id: newReq._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update status (Accept/Decline)
router.patch("/requests/:id", async (req, res) => {
  try {
    const updated = await ExchangeRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ message: "Status updated", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
