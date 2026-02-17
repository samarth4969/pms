import {asyncHandler} from "../middlewares/asyncHandler.js";
import {ErrorHandler} from "../middlewares/error.js";
import { User } from "../models/user.js";
import { sendEmail } from "../services/emailService.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import { generateToken } from "../utils/generateToken.js";
import crypto from "crypto";

// Register New User Controller
export const registerUser = asyncHandler(async (req, res, next) => {

  const { name, email, password, role, department } = req.body;

  // Check required fields
  if (!name || !email || !password || !role || !department) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("User already exists", 400));
  }

  user = await User.create({
    name,
    email,
    password,
    role,
    department   // ✅ added department
  });

  generateToken(user, 201, "User registered successfully", res);
});





// Login User Controller
export const login = asyncHandler(async (req, res, next) => {

    // Extract email, password, and role from request body
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Find user by email and role
    // Explicitly select password because it is usually excluded in schema (select: false)
    const user = await User.findOne({ email, role }).select("+password");

    // If user does not exist
    if (!user) {
        return next(new ErrorHandler("Invalid email, password, or role", 401));
    }

    // Compare entered password with hashed password in database
    const isPasswordMatch = await user.comparePassword(password);

    // If password does not match
    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email, password, or role", 401));
    }

    // Generate JWT token and send success response
    generateToken(user, 200, "Logged in successfully", res);
});



// Logout User Controller
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,       // ✅ MUST MATCH LOGIN
    sameSite: "None",   // ✅ MUST MATCH LOGIN
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};




// Get Logged-in User Controller
export const getUser = asyncHandler(async (req, res, next) => {

  // Find user by ID (ID comes from authentication middleware -> req.user)
  // Populate related fields to fetch referenced documents
  const user = await User.findById(req.user._id)
    .populate("supervisor", "name email")         // Fetch supervisor's name and email
    .populate("assignedStudents", "name email");  // Fetch assigned students' name and email

  // If user not found in database
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Send success response with user data
  res.status(200).json({
    success: true,
    data: { user },
  });
});



// Forgot Password Controller
export const forgotPassword = asyncHandler(async (req, res, next) => {

    // Find user by email
    const user = await User.findOne({ email: req.body.email });

    // If user does not exist
    if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
    }

    // Generate password reset token (custom method in User model)
    // This usually:
    // 1. Creates random token
    // 2. Hashes it
    // 3. Stores hashed token in DB
    // 4. Sets expiry time
    const resetToken = user.getResetPasswordToken();

    // Save user without triggering validations
    await user.save({ validateBeforeSave: false });

    // Create reset password URL (sent to user's email)
    const resetPasswordUrl =
        `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Generate email template
    const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

    try {
        // Send reset password email
        await sendEmail({
            to: user.email,
            subject: "FYP System - Password reset request",
            message,
        });

        // Success response
        return res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });

    } catch (error) {

        // If email fails, remove reset token fields from DB
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(
            new ErrorHandler(error.message || "Cannot send email", 500)
        );
    }
});


// Reset Password Controller
export const resetPassword = asyncHandler(async (req, res, next) => {

  // Extract token and passwords from request body
  const { token, password, confirmPassword } = req.body;

  // Check if token exists
  if (!token) {
    return next(new ErrorHandler("Token missing", 400));
  }

  // Hash the received token (because token stored in DB is hashed)
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Find user with matching token and valid (non-expired) reset time
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }, // Check expiry
  });

  // If no user found or token expired
  if (!user) {
    return next(new ErrorHandler("Invalid or expired reset link", 400));
  }

  // Validate password fields
  if (!password || !confirmPassword) {
    return next(new ErrorHandler("Password fields missing", 400));
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  // Update password (will be hashed automatically if pre-save middleware exists)
  user.password = password;

  // Remove reset token fields after successful reset
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // Save updated user
  await user.save();

  // Send success response
  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

