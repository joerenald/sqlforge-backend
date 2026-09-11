const express = require("express");

const {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

/*
=========================================================
REGISTER
POST /api/auth/register
=========================================================
*/
router.post("/register", registerUser);

/*
=========================================================
EMAIL / PASSWORD LOGIN
POST /api/auth/login
=========================================================
*/
router.post("/login", loginUser);

/*
=========================================================
GOOGLE LOGIN
POST /api/auth/google
=========================================================
*/
router.post("/google", googleLogin);

/*
=========================================================
FORGOT PASSWORD
POST /api/auth/forgot-password
=========================================================
*/
router.post(
  "/forgot-password",
  forgotPassword
);

/*
=========================================================
RESET PASSWORD
POST /api/auth/reset-password
=========================================================
*/
router.post(
  "/reset-password",
  resetPassword
);

module.exports = router;