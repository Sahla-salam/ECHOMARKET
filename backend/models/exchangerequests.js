const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema({
  requesterId: { type: String, required: true }, // Changed to String for flexibility
  requesterName: { type: String, required: true },
  itemId: { type: String, required: true }, // Changed to String for flexibility
  itemName: { type: String, required: true },
  offeredItemId: { type: String, default: null }, // Changed to String for flexibility
  offeredItemName: { type: String, default: null },
  message: { type: String, trim: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' },
}, {
  timestamps: true 
});

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);