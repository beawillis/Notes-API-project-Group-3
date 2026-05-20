const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
 
    console.log(`Database Connected: ${conn.connection.host}`); // Log the host of the connected MongoDB instance
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;