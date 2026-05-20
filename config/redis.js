const redis = require("redis");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

let redisAvailable = false;

// Surface connection issues without crashing the app.
redisClient.on("error", (err) => {
  console.log("Redis Error:", err.message || err);
});

const connectRedis = async () => {
  // Skip Redis startup if the environment variable is not configured.
  if (!process.env.REDIS_URL) {
    console.log("REDIS_URL is not set. Redis caching is disabled.");
    return null;
  }

  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      redisAvailable = true;
    } catch (error) {
      console.log("Redis connection failed, continuing without cache:", error.message);
      redisAvailable = false;

      if (redisClient.isOpen) {
        await redisClient.quit();
      } else {
        redisClient.destroy();
      }

      return null;
    }
  }

  const redisHost = (() => {
    try {
      return process.env.REDIS_URL ? new URL(process.env.REDIS_URL).hostname : "unknown";
    } catch {
      return "unknown";
    }
  })();

  console.log(`Redis Connected (${redisHost})`);
  return redisClient;
};

const getCacheData = async (key) => {
  try {
    // Return null on cache miss or when Redis is unavailable.
    if (!redisClient.isOpen || !redisAvailable) {
      return null;
    }

    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.log("Redis get cache error:", error.message);
    return null;
  }
};

const setCacheData = async (key, value, ttlInSeconds = 300) => {
  try {
    // Cache JSON responses with a short TTL so analytics stay fresh.
    if (!redisClient.isOpen || !redisAvailable) {
      return null;
    }

    await redisClient.setEx(key, ttlInSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.log("Redis set cache error:", error.message);
    return null;
  }
};

const deleteCacheByPattern = async (pattern) => {
  try {
    // Invalidate groups of cache keys after note mutations.
    if (!redisClient.isOpen || !redisAvailable) {
      return 0;
    }

    let deletedKeys = 0;

    for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      await redisClient.del(key);
      deletedKeys += 1;
    }

    return deletedKeys;
  } catch (error) {
    console.log("Redis delete cache error:", error.message);
    return 0;
  }
};

module.exports = {
  redisClient,
  connectRedis,
  getCacheData,
  setCacheData,
  deleteCacheByPattern,
};