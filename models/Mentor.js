import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjects: [
      {
        type: String,
        required: true,
      },
    ],
    bio: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
    },
    availability: {
      type: String,
      enum: ["Available", "Busy", "Away"],
      default: "Available",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
    },
    education: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Mentor = mongoose.model("Mentor", mentorSchema);

export default Mentor;
