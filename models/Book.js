import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true },
    isbn: { type: String },
    subject: { type: String, required: true },
    edition: { type: String },
    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair", "Poor"],
      default: "Good",
    },
    price: { type: Number, required: true },
    rentalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Available", "Rented Out", "Unavailable"],
      default: "Available",
    },
    images: [{ type: String }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rentalStartDate: { type: Date },
    rentalEndDate: { type: Date },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book; // 👈 ESM default export
