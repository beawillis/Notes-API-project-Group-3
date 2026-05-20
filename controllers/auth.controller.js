const User = require("../models/user.model"); // Import the User model to interact with the users collection in the database
const bcrypt = require("bcryptjs"); // Import bcrypt for hashing passwords and comparing hashed passwords
const jwt = require("jsonwebtoken"); // Import jsonwebtoken for generating and verifying JWT tokens

const {
  registerValidation,
  loginValidation,
} = require("../validators/auth.validator"); // Import validation functions for user registration and login

// Function to generate a JWT token for a user
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Controller function to handle user registration
const registerUser = async (req, res, next) => {
  try {
    const { error } = registerValidation(req.body); 

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Destructure the name, email, password, and optional role from the request body
    const { name, email, password, role } = req.body; 

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Validate role if provided (only Admin can be set by Admin users)
    let userRole = "User"; // Default role
    if (role && ["User", "Editor", "Admin"].includes(role)) {
      
      // Only allow Admin role assignment if requester is an Admin
      if (role === "Admin" && (!req.user || req.user.role !== "Admin")) {
        return res.status(403).json({
          success: false,
          message: "Only admins can create admin users",
        });
      }
      userRole = role;
    }

    // Generate a salt and hash the password before saving it to the database
    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Controller function to handle user login
const loginUser = async (req, res, next) => {
  try {
    const { error } = loginValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};

