const Item = require("../models/Item");

exports.createItem = async (req, res) => {
  try {
    const TEMP_OWNER_ID = "60c72b2295d85200155b11d9";

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(
        (file) => "/public/uploads/items/" + file.filename
      );
    }

    const newItemData = {
      ...req.body,
      owner: TEMP_OWNER_ID,
      images: imageUrls, // Overwrite the location string with the parsed object
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
    // NOTE: This is a temporary owner ID until you implement actual authentication
    const TEMP_OWNER_ID = "60c72b2295d85200155b11d9";

    const items = await Item.find({ owner: TEMP_OWNER_ID }).lean();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items, // 'items' are now simple objects, easily converted to JSON
    });
  } catch (error) {
    // 3. Send a clear error response
    console.error("Error fetching my listings:", error);
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
