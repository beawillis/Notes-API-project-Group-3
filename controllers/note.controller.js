const Note = require("../models/note.model"); // Import the Note model
const noteValidation = require("../validators/note.validator"); // Import the note validation function
const {
  deleteCacheByPattern,
} = require("../config/redis");

const invalidateAnalyticsCache = async () => {
  try {
    // Any note write can change the analytics output, so clear those keys.
    await deleteCacheByPattern("analytics:*");
  } catch (error) {
    console.error("Redis cache invalidation error:", error.message);
  }
};

// Create a new note
const createNote = async (req, res, next) => {
  try {
    const { error } = noteValidation(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const note = await Note.create({
      ...req.body,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: note,
    });

    // Fire-and-forget invalidation so the create response stays fast.
    void invalidateAnalyticsCache();
  } catch (error) {
    next(error);
  }
};

// Get all notes - Only return notes owned by the user (or all notes if Admin)
const getNotes = async (req, res, next) => {
  try {
    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting and filtering
    const sort = req.query.sort || "-createdAt";
    const search = req.query.q || "";
    const category = req.query.category;
    const tags = req.query.tags; // Comma-separated tags or array
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const isPinned = req.query.pinned;

    const query = {};

    // If user is not an Admin, only show their own notes
    if (req.user && req.user.role !== "Admin") {
      query.user = req.user._id;
    }

    // Text search
    if (search) {
      query.$text = {
        $search: search,
      };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Tags filter - supports comma-separated values: tags=node,javascript
    if (tags) {
      const tagArray = typeof tags === "string" ? tags.split(",").map(tag => tag.trim()) : tags;
      // Use $in to match notes that contain ANY of the specified tags
      query.tags = { $in: tagArray };
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Pinned notes filter (if model supports it)
    if (isPinned !== undefined) {
      query.isPinned = isPinned === "true" || isPinned === true;
    }

    const notes = await Note.find(query)
      .populate("user", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get the total count of notes matching the query for pagination purposes
    const total = await Note.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalNotes: total,
      filters: {
        search,
        category,
        tags: tags ? tags.split(",").map(t => t.trim()) : [],
        dateRange: startDate || endDate ? { startDate, endDate } : null,
        pinned: isPinned !== undefined ? isPinned : null,
      },
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single note by ID - Check ownership unless user is Admin
const getSingleNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Check ownership: allow if user is the owner or is an Admin
    if (req.user && note.user.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this note.",
      });
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// Update a note by ID - Only owner or Admin can update
const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Check ownership: only allow if user is the owner or is an Admin
    if (note.user.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this note. Only the owner or an admin can update it.",
      });
    }

    // Prevent users from changing the owner of the note
    if (req.body.user && req.body.user !== note.user.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change the owner of a note",
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: updatedNote,
    });

    // Fire-and-forget invalidation so the update response stays fast.
    void invalidateAnalyticsCache();
  } catch (error) {
    next(error);
  }
};

// Delete a note by ID - Only owner or Admin can delete
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Check ownership: only allow if user is the owner or is an Admin
    if (note.user.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this note. Only the owner or an admin can delete it.",
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });

    // Fire-and-forget invalidation so the delete response stays fast.
    void invalidateAnalyticsCache();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getNotes,
  getSingleNote,
  updateNote,
  deleteNote,
};
