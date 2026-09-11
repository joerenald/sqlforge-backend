const Progress = require("../models/Progress");

/*
=========================================================
DEFAULT PROGRESS
=========================================================
*/

const createDefaultProgress = (userId) => ({
  userId,
  easy: {
    completed: [],
  },
  medium: {
    completed: [],
  },
  advanced: {
    completed: [],
  },
  xp: 0,
  streak: 0,
});


/*
=========================================================
GET USER PROGRESS
GET /api/progress
=========================================================
*/

const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    let progress = await Progress.findOne({ userId });

    // Create progress document automatically
    // if this is the user's first visit.
    if (!progress) {
      progress = await Progress.create(
        createDefaultProgress(userId)
      );
    }

    return res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("Get progress error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load progress.",
    });
  }
};


/*
=========================================================
COMPLETE LEVEL
POST /api/progress/complete
=========================================================
*/

const completeLevel = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      track,
      level,
      xp,
    } = req.body;

    // Validate track
    if (!["easy", "medium", "advanced"].includes(track)) {
      return res.status(400).json({
        success: false,
        message: "Invalid challenge track.",
      });
    }

    // Validate level
    const numericLevel = Number(level);

    if (
      !Number.isInteger(numericLevel) ||
      numericLevel < 1 ||
      numericLevel > 50
    ) {
      return res.status(400).json({
        success: false,
        message: "Level must be between 1 and 50.",
      });
    }

    // Validate XP
    const numericXp = Number(xp) || 0;

    // Find user's progress
    let progress = await Progress.findOne({ userId });

    // Create progress if it doesn't exist
    if (!progress) {
      progress = await Progress.create(
        createDefaultProgress(userId)
      );
    }

    // Prevent duplicate completion
   if (!progress[track].completed.includes(numericLevel)) {
  progress[track].completed.push(numericLevel);

  // Add XP only when the level is completed
  progress.xp += numericXp;

  // ========================================================
  // DAILY STREAK
  // ========================================================

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  if (!progress.lastCompletedDate) {
    // First challenge ever completed
    progress.streak = 1;
  } else {
    const lastCompleted = new Date(
      progress.lastCompletedDate
    );

    lastCompleted.setHours(0, 0, 0, 0);

    const differenceInDays =
      Math.floor(
        (today - lastCompleted) /
          (1000 * 60 * 60 * 24)
      );

    if (differenceInDays === 0) {
      // Already completed a challenge today
      // Keep the same streak
    } else if (differenceInDays === 1) {
      // Continued the streak on the next day
      progress.streak += 1;
    } else {
      // Missed one or more days
      progress.streak = 1;
    }
  }

  progress.lastCompletedDate = new Date();
}

    // Keep completed levels sorted
    progress[track].completed.sort(
      (a, b) => a - b
    );

    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Progress updated successfully.",
      progress,
    });
  } catch (error) {
    console.error("Complete level error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update progress.",
    });
  }
};


/*
=========================================================
EXPORT CONTROLLERS
=========================================================
*/

module.exports = {
  getProgress,
  completeLevel,
};