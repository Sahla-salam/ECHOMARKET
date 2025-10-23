const express = require("express");
const multer = require("multer");
const path = require("path");
// 🟢 Import all necessary functions from the controller
const {
  createItem,
  getMyListings,
  getItemDetails,
  getAllItems,
} = require("../controllers/itemController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../frontend/public/uploads/items/"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// Apply Multer middleware to the POST route
router.post("/", upload.array("images", 5), createItem);

router.get("/", getAllItems);
// 🟢 FIX 1: The specific routes MUST come first!
router.get("/my-listings", getMyListings);

// 🟢 FIX 2: The parameterized route comes last.
router.get("/:id", getItemDetails);

module.exports = router;
