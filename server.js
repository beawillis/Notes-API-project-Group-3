require("dotenv").config(); // Load environment variables from .env file

const app = require("./app"); 
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

const startServer = async () => {
  await connectDB();
  await connectRedis();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();