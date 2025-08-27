import express from "express";
import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  deleteComment,
  getUserBlogs
} from "../controllers/blogController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.route("/")
  .get(getBlogs)
  .post(protect, upload.single("blogImage"), createBlog);

router.route("/:id")
  .get(getBlog)
  .put(protect, upload.single("blogImage"), updateBlog)
  .delete(protect, deleteBlog);

router.put("/:id/like", protect, likeBlog);
router.post("/:id/comment", protect, addComment);
router.delete("/:id/comment/:commentId", protect, deleteComment);
router.get("/user/:userId", getUserBlogs);

export default router;
