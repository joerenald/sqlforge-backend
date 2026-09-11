const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    // Every progress document belongs to exactly one user.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // EASY: 50 levels
    easy: {
      completed: {
        type: [Number],
        default: [],
      },
    },

    // MEDIUM: 50 levels
    medium: {
      completed: {
        type: [Number],
        default: [],
      },
    },

    // ADVANCED: 50 levels
    advanced: {
      completed: {
        type: [Number],
        default: [],
      },
    },

    // Total XP earned by this user
    xp: {
      type: Number,
      default: 0,
    },

    // Current streak
   streak: {
  type: Number,
  default: 0,
},

lastCompletedDate: {
  type: Date,
  default: null,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Progress", progressSchema);