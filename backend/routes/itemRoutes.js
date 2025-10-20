// backend/routes/itemRoutes.js
const express = require("express");
const multer = require("multer"); // Must be imported
const path = require("path"); // Must be imported
const { createItem, getMyListings } = require("../controllers/itemController");

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

router.get("/my-listings", getMyListings);

module.exports = router;
