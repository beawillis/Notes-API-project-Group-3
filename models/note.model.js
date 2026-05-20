const mongoose = require("mongoose");

// Define the Note schema
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      default: "General",// Default category if not provided
    },
    tags: {
        type: [String], // Array of strings for tags
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,// Reference to the User model
      ref: "User",
    },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);

  // Enable text search for q=... queries in the notes controller.
  noteSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Note", noteSchema);
