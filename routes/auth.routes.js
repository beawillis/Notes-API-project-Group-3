const express = require("express"); // Import Express to create a router for authentication routes
 
// Import controller functions for user registration and login
const {
  registerUser,
  loginUser,
} = require("../controllers/auth.controller");

// Import rate limiting middleware
const { authLimiter } = require("../middlewares/rateLimiter");

// Create a new router instance
const router = express.Router();

// Define routes for user registration and login with rate limiting
// Protects against brute force and spam attacks
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

module.exports = router;