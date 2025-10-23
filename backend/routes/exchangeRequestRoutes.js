const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ExchangeRequest = require("../models/exchangerequests");
const User = require("../models/User");

// POST - Create a new exchange request
router.post("/", async (req, res) => {
  try {
    const { 
      requesterId, 
      itemId, 
      itemName, 
      itemOwnerId, 
      requestType, 
      message, 
      offeredItemName 
    } = req.body;
    
    // Validation
    if (!requesterId || !itemId || !itemName || !itemOwnerId || !requestType || !message) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["requesterId", "itemId", "itemName", "itemOwnerId", "requestType", "message"]
      });
    }
    
    // Check if user is trying to request their own item
    if (requesterId === itemOwnerId) {
      return res.status(400).json({ 
        message: "You cannot request your own item" 
      });
    }
    
    // Get requester details
    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ message: "Requester not found" });
    }
    
    // Get item owner details
    const itemOwner = await User.findById(itemOwnerId);
    if (!itemOwner) {
      return res.status(404).json({ message: "Item owner not found" });
    }
    
    // Check for duplicate requests
    const existingRequest = await ExchangeRequest.findOne({
      requesterId,
      itemId,
      status: 'Pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({ 
        message: "You already have a pending request for this item" 
      });
    }
    
    // Create new exchange request
    const newRequest = new ExchangeRequest({
      requesterId,
      requesterName: requester.name,
      requesterEmail: requester.email,
      itemId,
      itemName,
      itemOwnerId,
      itemOwnerName: itemOwner.name,
      requestType,
      message,
      offeredItemName: offeredItemName || null,
      status: 'Pending'
    });
    
    await newRequest.save();
    
    res.status(201).json({ 
      message: "Exchange request sent successfully!",
      data: newRequest 
    });
    
  } catch (error) {
    console.error("Error creating exchange request:", error);
    res.status(500).json({ 
      message: "Error creating exchange request", 
      error: error.message 
    });
  }
});

// GET exchange requests for a specific user
// PRIVACY: Only returns requests where the user is directly involved
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    console.log(`📬 Fetching exchange requests for user: ${userId}`);
    
    // IMPORTANT: Find ONLY requests where the user is either:
    // 1. The requester (they want someone else's item)
    // 2. The item owner (someone wants their item)
    // This ensures complete privacy - users cannot see other people's requests
    const requests = await ExchangeRequest.find({
      $or: [
        { requesterId: userId },  // User made the request
        { itemOwnerId: userId }   // User owns the item being requested
      ]
    }).sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`✅ Found ${requests.length} requests for user ${userId}`);
    console.log(`   - Incoming (user owns item): ${requests.filter(r => r.itemOwnerId.toString() === userId).length}`);
    console.log(`   - Outgoing (user requested): ${requests.filter(r => r.requesterId.toString() === userId).length}`);
    
    res.json(requests);
  } catch (error) {
    console.error("Error fetching exchange requests:", error);
    res.status(500).json({ message: "Error fetching exchange requests", error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedRequest = await ExchangeRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true } // returns the updated document
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ message: "Status updated successfully", updatedRequest });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


