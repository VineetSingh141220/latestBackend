import express from "express";
import {
  getPYQs,
  getPYQ,
  createPYQ,
  updatePYQ,
  deletePYQ,
  downloadPYQ,
  getUserPYQs,
} from "../controllers/pyqController.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router
  .route("/")
  .get(getPYQs)
  .post(protect, upload.single("pyqFile"), createPYQ);

router
  .route("/:id")
  .get(getPYQ)
  .put(protect, upload.single("pyqFile"), updatePYQ)
  .delete(protect, deletePYQ);

router.get("/:id/download", downloadPYQ);
router.get("/user/:userId", getUserPYQs);

export default router;
