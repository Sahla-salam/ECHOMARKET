const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notification content
  type: {
    type: String,
    enum: ['request_accepted', 'request_declined', 'new_request'],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // Related data
  exchangeRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExchangeRequest'
  },
  
  itemName: String,
  
  // Status
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);

