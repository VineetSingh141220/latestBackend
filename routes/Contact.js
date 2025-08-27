// routes/contact.js
import express from "express";
import nodemailer from "nodemailer";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Rate limiting for contact form (more restrictive)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { 
    success: false,
    message: "Too many contact requests from this IP, please try again later." 
  }
});

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER, // your email
      pass: process.env.EMAIL_PASS  // your email password or app password
    }
  });
};

// -------------------- GET CONTACT INFO --------------------
// Get contact information
router.get("/info", (req, res) => {
  try {
    const contactInfo = {
      success: true,
      data: {
        email: "Krishjain9030@gmail.com",
        phone: "+91 7052388485",
        address: {
          street: "123 Book Street",
          city: "Ghaziabad",
          state: "Uttar Pradesh",
          country: "India",
          pincode: "201001"
        },
        businessHours: {
          monday: "9:00 AM - 6:00 PM",
          tuesday: "9:00 AM - 6:00 PM",
          wednesday: "9:00 AM - 6:00 PM",
          thursday: "9:00 AM - 6:00 PM",
          friday: "9:00 AM - 6:00 PM",
          saturday: "10:00 AM - 4:00 PM",
          sunday: "Closed"
        }
      }
    };
    
    res.status(200).json(contactInfo);
  } catch (error) {
    console.error("Error fetching contact info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact information"
    });
  }
});

// -------------------- GET SOCIAL LINKS --------------------
// Get social media links
router.get("/social", (req, res) => {
  try {
    const socialLinks = {
      success: true,
      data: [
        { 
          platform: "facebook", 
          link: "https://facebook.com/bookhive",
          icon: "fab fa-facebook-f"
        },
        { 
          platform: "twitter", 
          link: "https://twitter.com/bookhive",
          icon: "fab fa-twitter"
        },
        { 
          platform: "instagram", 
          link: "https://instagram.com/bookhive",
          icon: "fab fa-instagram"
        },
        { 
          platform: "linkedin", 
          link: "https://linkedin.com/company/bookhive",
          icon: "fab fa-linkedin-in"
        },
        { 
          platform: "youtube", 
          link: "https://youtube.com/bookhive",
          icon: "fab fa-youtube"
        }
      ]
    };
    
    res.status(200).json(socialLinks);
  } catch (error) {
    console.error("Error fetching social links:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch social links"
    });
  }
});

// -------------------- POST CONTACT FORM --------------------
// Validation rules for contact form
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Subject must be between 5 and 100 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number')
];

// Submit contact form
router.post("/submit", contactLimiter, contactValidation, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    const { name, email, subject, message, phone } = req.body;

    // Create email transporter
    const transporter = createEmailTransporter();

    // Email to admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `BookHive Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #555;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #666;">
            <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>IP Address:</strong> ${req.ip}</p>
          </div>
        </div>
      `
    };

    // Confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Thank you for contacting BookHive - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff; text-align: center;">
            Thank You for Contacting BookHive!
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p>Dear ${name},</p>
            <p>We have received your message and will get back to you within 24-48 hours.</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
            <h3 style="color: #333; margin-top: 0;">Your Message Summary:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>Best regards,<br>The BookHive Team</p>
            <p style="font-size: 12px;">
              If you need immediate assistance, please call us at +91 5555
            </p>
          </div>
        </div>
      `
    };

    // Send emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    // Log the contact submission
    console.log(`📧 Contact form submitted by: ${name} (${email}) - Subject: ${subject}`);

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully! We'll get back to you soon."
    });

  } catch (error) {
    console.error("Error sending contact form:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send your message. Please try again later."
    });
  }
});

// -------------------- GET FAQ --------------------
// Get frequently asked questions
router.get("/faq", (req, res) => {
  try {
    const faqData = {
      success: true,
      data: [
        {
          id: 1,
          question: "How do I create an account on BookHive?",
          answer: "You can create an account by clicking the 'Sign Up' button on our homepage and filling out the registration form with your email and password."
        },
        {
          id: 2,
          question: "How can I find books for my specific course?",
          answer: "Use our search functionality or browse by category. You can filter books by subject, course, university, or year to find exactly what you need."
        },
        {
          id: 3,
          question: "Are the books on BookHive free?",
          answer: "Many resources on BookHive are free, but some premium content may require a subscription or one-time payment."
        },
        {
          id: 4,
          question: "How do I contact customer support?",
          answer: "You can reach us through this contact form, email us at support@bookhive.com, or call us at +91 9876543210 during business hours."
        },
        {
          id: 5,
          question: "Can I contribute my own study materials?",
          answer: "Yes! We welcome contributions from students and educators. Please contact us to learn about our content submission process."
        }
      ]
    };
    
    res.status(200).json(faqData);
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch FAQ data"
    });
  }
});

// -------------------- GET OFFICE LOCATIONS --------------------
// Get office locations
router.get("/locations", (req, res) => {
  try {
    const locations = {
      success: true,
      data: [
        {
          id: 1,
          name: "Main Office - Ghaziabad",
          address: "123 Book Street, Ghaziabad, UP 201001, India",
          phone: "+91 9876543210",
          email: "ghaziabad@bookhive.com",
          coordinates: {
            latitude: 28.6692,
            longitude: 77.4538
          },
          hours: "Monday - Friday: 9:00 AM - 6:00 PM"
        },
        {
          id: 2,
          name: "Delhi Branch",
          address: "456 Education Hub, New Delhi, DL 110001, India",
          phone: "+91 9876543211",
          email: "delhi@bookhive.com",
          coordinates: {
            latitude: 28.7041,
            longitude: 77.1025
          },
          hours: "Monday - Saturday: 10:00 AM - 7:00 PM"
        }
      ]
    };
    
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch location data"
    });
  }
});

export default router;