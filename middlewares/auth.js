const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]; // Extract the token from the Authorization header

      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token and decode it to get the user ID

      req.user = await User.findById(decoded.id).select("-password"); // Fetch the user from the database using the decoded ID and exclude the password field

      next(); // Call the next middleware or route handler
    } else {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }
  } catch (error) {
    next(error);  } 
};

module.exports = protect;