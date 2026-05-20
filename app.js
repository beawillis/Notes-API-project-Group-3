const express = require("express");// Import Express to create the main application
const cors = require("cors");
const helmet = require("helmet");

const logger = require("./middlewares/logger"); 
const errorHandler = require("./middlewares/errorHandler");
const { generalLimiter, noteLimiter } = require("./middlewares/rateLimiter");

const authRoutes = require("./routes/auth.routes");// Import authentication routes
const noteRoutes = require("./routes/note.routes");// Import note-related routes
const analyticsRoutes = require("./routes/analytics.routes");// Import analytics routes

const app = express();

// Middleware setup
app.use(express.json()); 
app.use(cors());
app.use(helmet());
app.use(logger);
app.use(generalLimiter); // Apply general rate limiting to all routes

// Route setup
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteLimiter, noteRoutes); // Apply specific rate limiting for notes
app.use("/api/analytics", noteLimiter, analyticsRoutes); // Analytics endpoints with rate limiting

// Error handling middleware
app.use(errorHandler);

module.exports = app;

