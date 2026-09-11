const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getProgress,
  completeLevel,
} = require("../controllers/progressController");

const router = express.Router();

/*
=========================================================
GET USER PROGRESS
GET /api/progress
=========================================================
*/

router.get("/", protect, getProgress);


/*
=========================================================
COMPLETE LEVEL
POST /api/progress/complete
=========================================================
*/

router.post("/complete", protect, completeLevel);

module.exports = router;