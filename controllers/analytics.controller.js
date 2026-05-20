const Note = require("../models/note.model");
const {
  getCacheData,
  setCacheData,
} = require("../config/redis");

const buildUserScope = (req) => {
  // Keep per-user analytics cache keys separate from admin-wide keys.
  return req.user.role === "Admin" ? "all" : `user:${req.user._id}`;
};

const cacheAnalyticsResponse = async (cacheKey, responseData) => {
  // Store the final response object so cache hits can return immediately.
  await setCacheData(cacheKey, responseData, 300);
};

// Get most used categories with note count
const getMostUsedCategories = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const cacheKey = `analytics:categories:${buildUserScope(req)}:limit:${limit}`;

    // Fast path: serve the cached aggregation result when available.
    const cachedCategories = await getCacheData(cacheKey);
    if (cachedCategories) {
      return res.status(200).json(cachedCategories);
    }

    // Aggregate notes into category buckets ordered by usage.
    const categories = await Note.aggregate([
      // Only get notes owned by current user (unless Admin)
      req.user.role !== "Admin" 
        ? { $match: { user: req.user._id } }
        : { $match: {} },
      
      // Group by category and count matching notes.
      {
        $group: {
          _id: "$category",
          noteCount: { $sum: 1 },
          notes: { $push: "$title" }, // Include note titles for reference
        },
      },
      
      // Return the most used categories first.
      { $sort: { noteCount: -1 } },
      
      // Keep the payload small for clients.
      { $limit: limit },
      
      // Rename _id to category for a cleaner API response.
      {
        $project: {
          category: "$_id",
          noteCount: 1,
          notes: { $slice: ["$notes", 5] }, // Show only first 5 note titles
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: categories,
      total: categories.length,
    });

    await cacheAnalyticsResponse(cacheKey, {
      success: true,
      data: categories,
      total: categories.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get most active users (who created most notes)
const getMostActiveUsers = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const cacheKey = `analytics:active-users:limit:${limit}`;

    // Serve cached active-user stats when they are still valid.
    const cachedUsers = await getCacheData(cacheKey);
    if (cachedUsers) {
      return res.status(200).json(cachedUsers);
    }

    // Only Admins can view user activity statistics.
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can view user activity statistics",
      });
    }

    // Aggregate notes by user to find the most active contributors.
    const activeUsers = await Note.aggregate([
      // Group by user and count their notes.
      {
        $group: {
          _id: "$user",
          noteCount: { $sum: 1 },
          categories: { $push: "$category" },
          lastNoteDate: { $max: "$createdAt" },
        },
      },
      
      // Rank the most active users first.
      { $sort: { noteCount: -1 } },
      
      // Keep the response concise.
      { $limit: limit },
      
      // Join the user record so the response includes identity fields.
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      
      // Flatten the lookup result into a single object.
      { $unwind: "$userDetails" },
      
      // Return only the fields the client needs.
      {
        $project: {
          userId: "$_id",
          userName: "$userDetails.name",
          userEmail: "$userDetails.email",
          userRole: "$userDetails.role",
          noteCount: 1,
          uniqueCategories: {
            $size: { $setUnion: ["$categories", []] },
          },
          lastNoteDate: 1,
          _id: 0,
        },
      },
    ]);

    const response = {
      success: true,
      data: activeUsers,
      total: activeUsers.length,
    };

    await cacheAnalyticsResponse(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get category statistics with detailed breakdown
const getCategoryStats = async (req, res, next) => {
  try {
    const cacheKey = `analytics:category-stats:${buildUserScope(req)}`;

    // Category stats are cached per user scope to avoid repeated aggregation.
    const cachedStats = await getCacheData(cacheKey);
    if (cachedStats) {
      return res.status(200).json(cachedStats);
    }

    const categoryStats = await Note.aggregate([
      // Only get notes owned by current user (unless Admin)
      req.user.role !== "Admin" 
        ? { $match: { user: req.user._id } }
        : { $match: {} },
      
      // Group note metrics by category.
      {
        $group: {
          _id: "$category",
          totalNotes: { $sum: 1 },
          avgTitleLength: { $avg: { $strLenCP: "$title" } },
          avgContentLength: { $avg: { $strLenCP: "$content" } },
          totalTags: { $push: "$tags" },
          createdDates: { $push: "$createdAt" },
        },
      },
      
      // Derive extra statistics for each category bucket.
      {
        $project: {
          category: "$_id",
          totalNotes: 1,
          avgTitleLength: { $round: ["$avgTitleLength", 2] },
          avgContentLength: { $round: ["$avgContentLength", 2] },
          uniqueTagCount: {
            $size: {
              $setUnion: [
                {
                  $reduce: {
                    input: "$totalTags",
                    initialValue: [],
                    in: { $concatArrays: ["$$value", "$$this"] },
                  },
                },
                [],
              ],
            },
          },
          newestNote: { $max: "$createdDates" },
          oldestNote: { $min: "$createdDates" },
          _id: 0,
        },
      },
      
      // Sort the most populated categories first.
      { $sort: { totalNotes: -1 } },
    ]);

    const response = {
      success: true,
      data: categoryStats,
      total: categoryStats.length,
    };

    await cacheAnalyticsResponse(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Get most used tags across all notes
const getMostUsedTags = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 15;
    const cacheKey = `analytics:tags:${buildUserScope(req)}:limit:${limit}`;

    // Return cached tag stats when the same query is requested repeatedly.
    const cachedTags = await getCacheData(cacheKey);
    if (cachedTags) {
      return res.status(200).json(cachedTags);
    }

    // Aggregate tag usage across the accessible notes.
    const tags = await Note.aggregate([
      // Only get notes owned by current user (unless Admin)
      req.user.role !== "Admin" 
        ? { $match: { user: req.user._id } }
        : { $match: {} },
      
      // Unwind the tag array so each tag can be counted individually.
      { $unwind: "$tags" },
      
      // Count how often each tag appears.
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
          categories: { $push: "$category" },
        },
      },
      
      // Put the most common tags first.
      { $sort: { count: -1 } },
      
      // Keep the response small and useful.
      { $limit: limit },
      
      // Shape the response for the client.
      {
        $project: {
          tag: "$_id",
          usageCount: "$count",
          categories: { $setUnion: ["$categories", []] },
          _id: 0,
        },
      },
    ]);

    const response = {
      success: true,
      data: tags,
      total: tags.length,
    };

    await cacheAnalyticsResponse(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMostUsedCategories,
  getMostActiveUsers,
  getCategoryStats,
  getMostUsedTags,
};
