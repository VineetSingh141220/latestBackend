import PYQ from "../models/PYQ.js";

// @desc    Get all PYQs
// @route   GET /api/pyqs
// @access  Public
export const getPYQs = async (req, res) => {
  try {
    const { page = 1, limit = 10, course, subject, semester, year, examType } = req.query;

    let query = {};
    if (course) query.course = new RegExp(course, "i");
    if (subject) query.subject = new RegExp(subject, "i");
    if (semester) query.semester = semester;
    if (year) query.year = year;
    if (examType) query.examType = examType;

    const pyqs = await PYQ.find(query)
      .populate("uploadedBy", "name email college")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ year: -1, createdAt: -1 });

    const total = await PYQ.countDocuments(query);

    res.json({
      pyqs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single PYQ
// @route   GET /api/pyqs/:id
// @access  Public
export const getPYQ = async (req, res) => {
  try {
    const pyq = await PYQ.findById(req.params.id).populate("uploadedBy", "name email college");

    if (!pyq) {
      return res.status(404).json({ message: "PYQ not found" });
    }

    res.json(pyq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create PYQ
// @route   POST /api/pyqs
// @access  Private
export const createPYQ = async (req, res) => {
  try {
    req.body.uploadedBy = req.user.id;
    req.body.college = req.user.college;

    if (req.file) {
      req.body.file = req.file.path;
    }

    const pyq = await PYQ.create(req.body);
    res.status(201).json(pyq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update PYQ
// @route   PUT /api/pyqs/:id
// @access  Private
export const updatePYQ = async (req, res) => {
  try {
    let pyq = await PYQ.findById(req.params.id);

    if (!pyq) {
      return res.status(404).json({ message: "PYQ not found" });
    }

    if (pyq.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (req.file) {
      req.body.file = req.file.path;
    }

    pyq = await PYQ.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(pyq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete PYQ
// @route   DELETE /api/pyqs/:id
// @access  Private
export const deletePYQ = async (req, res) => {
  try {
    const pyq = await PYQ.findById(req.params.id);

    if (!pyq) {
      return res.status(404).json({ message: "PYQ not found" });
    }

    if (pyq.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    await PYQ.findByIdAndDelete(req.params.id);
    res.json({ message: "PYQ removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Download PYQ
// @route   GET /api/pyqs/:id/download
// @access  Public
export const downloadPYQ = async (req, res) => {
  try {
    const pyq = await PYQ.findById(req.params.id);

    if (!pyq) {
      return res.status(404).json({ message: "PYQ not found" });
    }

    pyq.downloads += 1;
    await pyq.save();

    res.download(pyq.file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user's PYQs
// @route   GET /api/pyqs/user/:userId
// @access  Public
export const getUserPYQs = async (req, res) => {
  try {
    const pyqs = await PYQ.find({ uploadedBy: req.params.userId })
      .populate("uploadedBy", "name email college")
      .sort({ createdAt: -1 });

    res.json(pyqs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
