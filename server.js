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
app.use(
  cors({
    origin: "http://localhost:5173",
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