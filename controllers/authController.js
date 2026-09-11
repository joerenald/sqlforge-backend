const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");

// Firebase Admin
require("../config/firebaseAdmin");
const { getAuth } = require("firebase-admin/auth");

const sendResetEmail = require("../utils/sendResetEmail");
/*
=========================================================
REGISTER USER
POST /api/auth/register
=========================================================
*/

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Normalize input
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate name
    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty.",
      });
    }

    // Validate email
    if (!normalizedEmail.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Check whether user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    console.log("-----------------------------------");
    console.log("User created successfully");
    console.log("User ID:", user._id.toString());
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("MongoDB database:", User.db.name);
    console.log("MongoDB collection:", User.collection.name);
    console.log("-----------------------------------");

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate email safely
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the account.",
    });
  }
};


/*
=========================================================
LOGIN USER
POST /api/auth/login
=========================================================
*/

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Create SQLForge JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    console.log("-----------------------------------");
    console.log("Email/password login successful");
    console.log("User ID:", user._id.toString());
    console.log("Email:", user.email);
    console.log("-----------------------------------");

    // Send response
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in.",
    });
  }
};


/*
=========================================================
GOOGLE LOGIN
POST /api/auth/google

Flow:

React
  ↓
Firebase Google Login
  ↓
Firebase ID Token
  ↓
Express Backend
  ↓
Firebase Admin verifies token
  ↓
MongoDB Atlas
  ↓
SQLForge JWT
  ↓
React Dashboard
=========================================================
*/

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    // =====================================================
    // 1. Validate Firebase ID token
    // =====================================================

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required.",
      });
    }

    // =====================================================
    // 2. Verify Firebase ID token
    // =====================================================

    const decodedToken = await getAuth().verifyIdToken(idToken);

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    const name =
      decodedToken.name ||
      decodedToken.email?.split("@")[0] ||
      "SQLForge User";

    // =====================================================
    // 3. Validate Google account
    // =====================================================

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account does not contain an email.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // =====================================================
    // 4. Find existing SQLForge user
    // =====================================================

    let user = await User.findOne({
      email: normalizedEmail,
    });

    // =====================================================
    // 5. Create MongoDB user if not found
    // =====================================================

    if (!user) {
      /*
       * Google users do not provide a SQLForge password.
       *
       * Our current User model requires a password,
       * so we create a random hashed password.
       *
       * The user will authenticate through Google.
       */

      const randomPassword =
        `${firebaseUid}-${Date.now()}-${Math.random()}`;

      const hashedPassword = await bcrypt.hash(
        randomPassword,
        10
      );

      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      });

      console.log("-----------------------------------");
      console.log("Google user created successfully");
      console.log("User ID:", user._id.toString());
      console.log("Name:", user.name);
      console.log("Email:", user.email);
      console.log("Firebase UID:", firebaseUid);
      console.log("MongoDB database:", User.db.name);
      console.log("MongoDB collection:", User.collection.name);
      console.log("-----------------------------------");
    } else {
      console.log("-----------------------------------");
      console.log("Existing SQLForge Google user found");
      console.log("User ID:", user._id.toString());
      console.log("Email:", user.email);
      console.log("-----------------------------------");
    }

    // =====================================================
    // 6. Create SQLForge JWT
    // =====================================================

    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    // =====================================================
    // 7. Return SQLForge authentication data
    // =====================================================

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed.",
    });
  }
};


/*
=========================================================
FORGOT PASSWORD
POST /api/auth/forgot-password

Flow:

React
  ↓
Enter email
  ↓
Express Backend
  ↓
Find MongoDB user
  ↓
Generate secure reset token
  ↓
Save token + expiry
  ↓
TEMPORARY: Return token for testing

Later:

  ↓
Send reset link through email
=========================================================
*/

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Don't reveal whether an account exists.
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store token + 15 minute expiry
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    // Development URL for the frontend
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Send reset link to the registered email
    await sendResetEmail({
      email: user.email,
      name: user.name,
      resetUrl,
    });

    console.log("Password reset email sent to:", user.email);

    return res.status(200).json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
 } catch (error) {
  console.error("=================================");
  console.error("FORGOT PASSWORD ERROR");
  console.error("Message:", error.message);
  console.error("Full error:", error);
  console.error("=================================");

  return res.status(500).json({
    message: "Unable to process password reset request.",
  });
}
};
/*
=========================================================
RESET PASSWORD
POST /api/auth/reset-password
=========================================================
*/

const resetPassword = async (req, res) => {
  try {
    const {
      resetToken,
      newPassword,
    } = req.body;

    /*
    -------------------------------------------------------
    Validate input
    -------------------------------------------------------
    */

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Reset token and new password are required.",
      });
    }

    /*
    -------------------------------------------------------
    Validate password length
    -------------------------------------------------------
    */

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters long.",
      });
    }

    /*
    -------------------------------------------------------
    Find user using reset token
    -------------------------------------------------------
    */

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: {
        $gt: new Date(),
      },
    });

    /*
    -------------------------------------------------------
    Invalid or expired token
    -------------------------------------------------------
    */

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired password reset token.",
      });
    }

    /*
    -------------------------------------------------------
    Hash new password
    -------------------------------------------------------
    */

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    /*
    -------------------------------------------------------
    Update password
    -------------------------------------------------------
    */

    user.password = hashedPassword;

    /*
    -------------------------------------------------------
    Invalidate reset token
    -------------------------------------------------------
    */

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log("-----------------------------------");
    console.log("Password reset successful");
    console.log("User ID:", user._id.toString());
    console.log("Email:", user.email);
    console.log("-----------------------------------");

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while resetting the password.",
    });
  }
};
/*
=========================================================
EXPORT CONTROLLERS
=========================================================
*/

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
};