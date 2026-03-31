const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

// Get logged-in user's info
router.get("/me", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT id, firstName, lastName, email, profile_image FROM users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.length === 0) return res.status(404).json({ message: "User not found" });

      res.json(result[0]);
    }
  );
});

// Get all users except the current logged-in user
router.get("/", authenticateToken, (req, res) => {
  const currentUserId = req.user.id;

  const query = `
    SELECT id, firstName, lastName, profile_image 
    FROM users 
    WHERE id != ?
  `;

  db.query(query, [currentUserId], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.status(200).json(results);

  });
});

// Get a single user( Logged in user)
router.get("/:id", authenticateToken, (req, res) => {
  const userId = req.params.id;

  const query = `
    SELECT id, firstName, lastName, profile_image 
    FROM users 
    WHERE id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    res.status(200).json(results[0]);
  });
});

module.exports = router;
