// routes/books.js
import express from "express";
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  rentBook,
  returnBook,
  getUserBooks,
} from "../controllers/bookController.js";

import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.route("/")
  .get(getBooks)
  .post(protect, upload.array("bookImages", 5), createBook);

router.route("/:id")
  .get(getBook)
  .put(protect, upload.array("bookImages", 5), updateBook)
  .delete(protect, deleteBook);

router.put("/:id/rent", protect, rentBook);
router.put("/:id/return", protect, returnBook);
router.get("/user/:userId", getUserBooks);

export default router;
