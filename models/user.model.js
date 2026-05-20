const mongoose = require("mongoose");

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["User", "Editor", "Admin"],
      default: "User",
    },
  },
  {
    timestamps: true,
  }
);

 module.exports = mongoose.model("User", userSchema);