// controllers/bookController.js
import Book from "../models/Book.js";

// @desc    Get all books
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, location, search } = req.query;

    let query = {};

    if (subject) query.subject = new RegExp(subject, "i");
    if (location) query.location = new RegExp(location, "i");
    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { author: new RegExp(search, "i") },
        { subject: new RegExp(search, "i") },
      ];
    }

    const books = await Book.find(query)
      .populate("owner", "name email college")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    res.json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
export const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("owner", "name email college phone")
      .populate("renter", "name email college");

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create book
// @route   POST /api/books
// @access  Private
export const createBook = async (req, res) => {
  try {
    req.body.owner = req.user.id;

    // Handle file uploads
    if (req.files && req.files.bookImages) {
      req.body.images = req.files.bookImages.map((file) => file.path);
    }

    const book = await Book.create(req.body);

    res.status(201).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
export const updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check ownership
    if (book.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Handle file uploads
    if (req.files && req.files.bookImages) {
      req.body.images = req.files.bookImages.map((file) => file.path);
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check ownership
    if (book.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.json({ message: "Book removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Rent a book
// @route   PUT /api/books/:id/rent
// @access  Private
export const rentBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.status !== "Available") {
      return res.status(400).json({ message: "Book is not available for rent" });
    }

    if (book.owner.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot rent your own book" });
    }

    book.renter = req.user.id;
    book.status = "Rented Out";
    book.rentalStartDate = new Date();

    // Set rental end date (default 30 days)
    const rentalPeriod = req.body.rentalPeriod || 30;
    book.rentalEndDate = new Date();
    book.rentalEndDate.setDate(book.rentalEndDate.getDate() + rentalPeriod);

    await book.save();

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Return a book
// @route   PUT /api/books/:id/return
// @access  Private
export const returnBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if user is the renter or owner
    if (
      book.renter.toString() !== req.user.id &&
      book.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    book.renter = null;
    book.status = "Available";
    book.rentalStartDate = null;
    book.rentalEndDate = null;

    await book.save();

    res.json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user's books
// @route   GET /api/books/user/:userId
// @access  Public
export const getUserBooks = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.params.userId })
      .populate("owner", "name email college")
      .populate("renter", "name email college")
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
