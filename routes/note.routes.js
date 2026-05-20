const express = require("express"); // Import Express to create a router for note-related routes

// Import controller functions for note operations
const {
  createNote,
  getNotes,
  getSingleNote,
  updateNote,
  deleteNote,
} = require("../controllers/note.controller");

// Import authentication middleware to protect certain routes
const protect = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

 
const router = express.Router();


// All routes that access specific notes require authentication for ownership checks
router.post("/", protect, createNote);
router.get("/", getNotes); 
router.get("/:id", protect, getSingleNote);
router.put("/:id", protect, updateNote); // Require auth for ownership check

// Only Admin and Editor roles can delete notes (plus ownership check in controller)
router.delete("/:id", protect, authorize("Admin", "Editor"), deleteNote); 

module.exports = router;