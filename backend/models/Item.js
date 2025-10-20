// backend/models/Item.js (STREAMLINED SCHEMA)

const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    // Core Product Details
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    images: [{ type: String }],
    
    // Condition & Location
    itemCondition: { type: String, required: true },
    
    // SIMPLIFIED LOCATION FIELD: Combines General and Detailed for cleaner UI
    location: { 
        type: String, 
        required: [true, 'Location is required (e.g., Block A, Hostel 2, XYZ City).'] 
    },
    
    // Exchange/Listing Type
    listingType: { 
        type: String, 
        enum: ['Freebie', 'Barter', 'Request'], 
        required: true 
    },
    barterPreferences: { 
        type: String, 
        // Present only if listingType is 'Barter'
    },
    
    // Logistics
    pickupOption: { 
        type: String, 
        enum: ['Self Pickup', 'Delivery'],
        required: [true, 'Pickup option is required.'] 
    },
    community: { type: String }, 
    
    // Metadata
    expiryDate: { type: Date, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);
module.exports = Item;