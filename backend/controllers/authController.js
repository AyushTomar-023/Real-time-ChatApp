const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

// Check E-mail 
exports.checkEmail = (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ 
      success: false,
      message: "Email parameter is required" 
    });
  }

  db.query("SELECT email FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }
    
    res.status(200).json({
      success: true,
      exists: results.length > 0
    });
  });
};

// SignUp Controller
exports.signup = (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const profile_image = req.file ? req.file.filename : null;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: "All fields are required" 
    });
  }

  bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      return res.status(500).json({
        success: false,
        message: "Error hashing password"
      });
    }

    const insertQuery = "INSERT INTO users (firstName, lastName, email, password, profile_image) VALUES (?, ?, ?, ?, ?)";
    db.query(insertQuery, 
      [firstName, lastName, email, hashedPassword, profile_image],
      (insertErr, result) => {
        if (insertErr) {
          if (insertErr.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
              success: false,
              message: "Email already exists"
            });
          }
          return res.status(500).json({
            success: false,
            message: "Error creating user"
          });
        }

        return res.status(201).json({
          success: true,
          message: "User registered successfully",
          user: {
            id: result.insertId,
            firstName,
            lastName,
            email,
            profile_image
          }
        });
      }
    );
  });
};

// Login Controller
exports.login = (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (compareErr, isMatch) => {
      if (compareErr) {
        console.error(compareErr);
        return res.status(500).json({ message: "Error comparing passwords" });
      }

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profile_image: user.profile_image
        }
      });
    });
  });
};