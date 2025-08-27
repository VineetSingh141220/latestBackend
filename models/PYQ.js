import mongoose from "mongoose";

const pyqSchema = new mongoose.Schema({
  course: { type: String, required: true },
  subject: { type: String, required: true },
  semester: { type: String, required: true },
  examType: {
    type: String,
    enum: ["Midterm", "Final", "Quiz"],
    required: true,
  },
  examTerm: { type: String, required: true },
  year: { type: Number, required: true },
  file: { type: String, required: true },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  downloads: { type: Number, default: 0 },
  college: { type: String, required: true },
}, {
  timestamps: true
});

const PYQ = mongoose.model("PYQ", pyqSchema);

export default PYQ;
