// routes/mentor.js
import express from "express";
import {
  getMentors,
  getMentor,
  createMentor,
  updateMentor,
  deleteMentor,
  rateMentor
} from "../controllers/mentorController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.route("/")
  .get(getMentors)
  .post(protect, createMentor);

router.route("/:id")
  .get(getMentor)
  .put(protect, updateMentor)
  .delete(protect, deleteMentor);

router.put("/:id/rate", protect, rateMentor);

export default router;
