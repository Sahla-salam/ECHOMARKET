const mongoose = require("mongoose");

const exchangeRequestSchema = new mongoose.Schema({
  // User who made the request
  requesterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  requesterName: { 
    type: String, 
    required: true 
  },
  requesterEmail: { 
    type: String 
  },
  
  // Item being requested
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Item',
    required: true 
  },
  itemName: { 
    type: String, 
    required: true 
  },
  
  // Owner of the item
  itemOwnerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  
  // Request details
  requestType: {
    type: String,
    enum: ['Claim', 'Contact'],
    required: true
  },
  message: { 
    type: String,
    required: true
  },
  offeredItemName: { 
    type: String 
  },
  
  // Status
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined'],
    default: "Pending"
  },
}, { timestamps: true });

module.exports = mongoose.model("ExchangeRequest", exchangeRequestSchema);
