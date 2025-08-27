// controllers/mentorController.js
import Mentor from "../models/Mentor.js";
import User from "../models/User.js";

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
export const getMentors = async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, search } = req.query;

    let query = {};

    if (subject) query.subjects = new RegExp(subject, "i");

    if (search) {
      query.$or = [
        { bio: new RegExp(search, "i") },
        { subjects: new RegExp(search, "i") }
      ];
    }

    const mentors = await Mentor.find(query)
      .populate("user", "name email college year avatar")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1, createdAt: -1 });

    const total = await Mentor.countDocuments(query);

    res.json({
      mentors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single mentor
// @route   GET /api/mentors/:id
// @access  Public
export const getMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate(
      "user",
      "name email college year phone avatar"
    );

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.json(mentor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create mentor profile
// @route   POST /api/mentors
// @access  Private
export const createMentor = async (req, res) => {
  try {
    const existingMentor = await Mentor.findOne({ user: req.user.id });
    if (existingMentor) {
      return res
        .status(400)
        .json({ message: "Mentor profile already exists" });
    }

    await User.findByIdAndUpdate(req.user.id, { role: "mentor" });

    req.body.user = req.user.id;
    const mentor = await Mentor.create(req.body);

    res.status(201).json(mentor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update mentor profile
// @route   PUT /api/mentors/:id
// @access  Private
export const updateMentor = async (req, res) => {
  try {
    let mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    if (mentor.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    mentor = await Mentor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("user", "name email college year avatar");

    res.json(mentor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete mentor profile
// @route   DELETE /api/mentors/:id
// @access  Private
export const deleteMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    if (mentor.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    await User.findByIdAndUpdate(req.user.id, { role: "student" });

    await Mentor.findByIdAndDelete(req.params.id);

    res.json({ message: "Mentor profile removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Rate a mentor
// @route   PUT /api/mentors/:id/rate
// @access  Private
export const rateMentor = async (req, res) => {
  try {
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const newTotalRatings = mentor.totalRatings + 1;
    const newRating =
      (mentor.rating * mentor.totalRatings + rating) / newTotalRatings;

    mentor.rating = newRating;
    mentor.totalRatings = newTotalRatings;

    await mentor.save();

    res.json(mentor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
