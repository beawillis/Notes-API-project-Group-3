const express = require("express");

// Import analytics controller functions
const {
  getMostUsedCategories,
  getMostActiveUsers,
  getCategoryStats,
  getMostUsedTags,
} = require("../controllers/analytics.controller");

// Import authentication and authorization middleware
const protect = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

const router = express.Router();

// All analytics routes require authentication
// GET /api/analytics/categories - Most used categories
router.get("/categories", protect, getMostUsedCategories);

// GET /api/analytics/active-users - Most active users (Admin only)
router.get("/active-users", protect, authorize("Admin"), getMostActiveUsers);

// GET /api/analytics/category-stats - Category statistics with breakdown
router.get("/category-stats", protect, getCategoryStats);

// GET /api/analytics/tags - Most used tags
router.get("/tags", protect, getMostUsedTags);

module.exports = router;
