const Item = require("../models/Item");

exports.createItem = async (req, res) => {
  try {
    const userId = req.body.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(
        (file) => "/public/uploads/items/" + file.filename
      );
    }

    const newItemData = {
      ...req.body,
      owner: userId,
      images: imageUrls,
    };

    const item = await Item.create(newItemData);

    res.status(201).json({
      success: true,
      message: "Item listed successfully!",
      data: item,
    });
  } catch (error) {
    // --- CRITICAL FIX: Complete Error Handling ---
    console.error("Error creating item:", error);

    let errorMessage = "Internal Server Error. Could not process item.";
    let statusCode = 500; // Handle Mongoose Validation Errors (e.g., required field missing)

    if (error.name === "ValidationError") {
      statusCode = 400; // Bad Request // Extract all validation messages
      errorMessage = Object.values(error.errors)
        .map((val) => val.message)
        .join(", ");
    } // Ensure a response is sent to the client

    if (!res.headersSent) {
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const items = await Item.find({ owner: userId }).lean();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching my listings:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: error.message,
    });
  }
};

// Get all items EXCEPT the current user's items
exports.getAllItems = async (req, res) => {
  try {
    const userId = req.query.userId;
    
    // Build query to exclude current user's items
    // Convert userId to string for comparison since MongoDB stores ObjectId
    const query = userId ? { owner: { $ne: userId } } : {};
    
    const items = await Item.find(query).lean();
    
    // Filter out current user's items in JavaScript as well (extra safety)
    const filteredItems = userId 
      ? items.filter(item => item.owner.toString() !== userId.toString())
      : items;

    res.status(200).json({
      success: true,
      count: filteredItems.length,
      data: filteredItems,
    });
  } catch (error) {
    console.error("Error fetching all items:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: error.message,
    });
  }
};

// 🟢 NEW EXPORT: Function to get details of a single item
exports.getItemDetails = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error fetching item details:", error);

    let errorMessage = "Server Error fetching item details.";
    let statusCode = 500;

    // Handle case where ID format is invalid (e.g., too short, non-hex)
    if (error.name === "CastError") {
      statusCode = 404;
      errorMessage = "Item not found (Invalid ID format).";
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      message: error.message,
    });
  }
};
