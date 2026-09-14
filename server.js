require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Database connection
const connectMongoDB = require("./config/mongo");

// Routes
const sqlRoutes = require("./routes/sqlRoutes");
const authRoutes = require("./routes/authRoutes");
const progressRoutes = require("./routes/progressRoutes");
const app = express();

const PORT = process.env.PORT || 5000;

/*
=========================================================
MIDDLEWARE
=========================================================
*/

// Allow frontend requests
const allowedOrigins = [
  "http://localhost:5173",
  "https://sqlforge-frontend-i25x.vercel.app",
  "https://sqlforge-frontend-i25x-6wsrnh3fp-joerenalds-projects.vercel.app",
  "https://sqlforge-frontend-i25x-hebh8w8ty-joerenalds-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());


/*
=========================================================
ROOT ROUTE
=========================================================
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SQLForge backend is running",
  });
});


/*
=========================================================
API ROUTES
=========================================================
*/

// SQL practice
app.use("/api/sql", sqlRoutes);

// Authentication
app.use("/api/auth", authRoutes);
// User progress
app.use("/api/progress", progressRoutes);


/*
=========================================================
START SERVER
=========================================================
*/

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas first
    await connectMongoDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log("-----------------------------------");
      console.log("SQLForge backend running");
      console.log(`Server: http://localhost:${PORT}`);
      console.log("MongoDB Atlas: Connected");
      console.log("-----------------------------------");
    });
  } catch (error) {
    console.error(
      "Failed to start SQLForge backend:",
      error.message
    );

    process.exit(1);
  }
};

startServer();