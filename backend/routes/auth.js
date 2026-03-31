const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../config/db");
const authController = require("../controllers/authController"); // Fixed import
const authenticate = require("../middleware/authMiddleware");

// Multer configuration for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Email availability check
router.get("/check-email", authController.checkEmail);

// User registration
router.post("/signup", upload.single("profile_image"), authController.signup);

// User login
router.post("/login", authController.login);

// Get logged-in user profile
router.get("/me", authenticate, (req, res) => {
  const userId = req.user.id;
  const query = "SELECT id, firstName, lastName, email, profile_image FROM users WHERE id = ?";
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    res.status(200).json(results[0]);
  });
});

module.exports = router;