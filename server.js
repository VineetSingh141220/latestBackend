import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/database.js";

import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/books.js";
import mentorRoutes from "./routes/mentors.js";
import pyqRoutes from "./routes/pyqs.js";
import blogRoutes from "./routes/blogs.js";
import contactRoutes from "./routes/Contact.js";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: "Too many requests, please try again later." }
});
app.use(limiter);

// Static files
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    message: "BookHive API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// -------------------- ROUTES --------------------
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/pyqs", pyqRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/contact", contactRoutes);

// -------------------- CONTACT INFO API --------------------
app.get("/api/contact", (req, res) => {
  res.json([
    { type: "email", value: "support@bookhive.com" },
    { type: "phone", value: "+91 9876543210" }
  ]);
});

console.log("📌 Contact routes file loaded");

// Social Links
app.get("/api/social", (req, res) => {
  res.json([
    { platform: "facebook", link: "https://facebook.com/bookhive" },
    { platform: "twitter", link: "https://twitter.com/bookhive" },
    { platform: "instagram", link: "https://instagram.com/bookhive" },
    { platform: "linkedin", link: "https://linkedin.com/bookhive" }
  ]);
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 Global Error Handler:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// ❌ Remove app.listen()
// ✅ Export app for Vercel
export default app;
