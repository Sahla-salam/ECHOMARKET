const Item = require("../models/Item");

// Change to const/function declaration instead of exports.functionName
const createItem = async (req, res) => {
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
      // Get the server URL from the request
      const protocol = req.protocol; // http or https
      const host = req.get('host'); // localhost:5000 or IP:5000
      const baseUrl = `${protocol}://${host}`;
      
      imageUrls = req.files.map(
        (file) => `${baseUrl}/public/uploads/items/${file.filename}`
      );
      
      console.log(`📸 Uploaded ${imageUrls.length} images with URLs:`, imageUrls);
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
    let statusCode = 500;

    if (error.name === "ValidationError") {
      statusCode = 400;
      errorMessage = Object.values(error.errors)
        .map((val) => val.message)
        .join(", ");
    }

    if (!res.headersSent) {
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }
};

const getMyListings = async (req, res) => {
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

const getAllItems = async (req, res) => {
  // ... (Your filtering logic remains the same here)
  try {
    const { userId, search, category, type, condition, locality, community } =
      req.query;

    const filter = {};
    // Only hide claimed items, show available and items without status (old items)
    filter.status = { $ne: 'claimed' };
    
    console.log("🔍 Filter for getAllItems:", JSON.stringify(filter));
    
    if (userId) {
      filter.owner = { $ne: userId };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (type) {
      const typesArray = Array.isArray(type) ? type : type.split(",");
      filter.listingType = { $in: typesArray };
    }

    if (condition) {
      const conditionsArray = Array.isArray(condition)
        ? condition
        : condition.split(",");
      filter.itemCondition = { $in: conditionsArray };
    }

    if (category) {
      filter.category = category;
    }

    if (locality) {
      filter.location = { $regex: locality, $options: "i" };
    }

    if (community) {
      filter.community = community;
    }

    const items = await Item.find(filter).lean();
    
    console.log(`📦 Found ${items.length} items after filter`);
    console.log(`   Items with claimed status: ${items.filter(i => i.status === 'claimed').length}`);
    console.log(`   Items without status field: ${items.filter(i => !i.status).length}`);
    console.log(`   Items with available status: ${items.filter(i => i.status === 'available').length}`);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
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

const getItemDetails = async (req, res) => {
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

// All functions are now defined and exported in one block
module.exports = {
  createItem,
  getMyListings,
  getAllItems,
  getItemDetails,
};
