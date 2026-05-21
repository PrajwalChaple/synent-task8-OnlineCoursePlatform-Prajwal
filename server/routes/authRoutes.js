const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { protect } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

// Helper to generate 6 digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Determine the role: if it's explicitly 'admin' we can assign it,
    // or let it be 'student' by default. For testing, we allow role assignment.
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
    });

    if (user) {
      // Send verification email (will fallback to console logging)
      await sendVerificationEmail(user.email, user.name, otp);

      res.status(201).json({
        message: 'Registration successful. Verification OTP sent to email.',
        email: user.email,
        requiresVerification: true,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify email using OTP
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Check if OTP matches and has not expired
    if (user.verificationOtp !== otp || user.verificationOtpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.verificationOtp = null;
    user.verificationOtpExpires = null;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id),
      message: 'Email verified successfully. You are now logged in.',
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Select password field explicitly
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      // Re-trigger OTP
      const otp = generateOTP();
      user.verificationOtp = otp;
      user.verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      await sendVerificationEmail(user.email, user.name, otp);

      return res.status(403).json({
        message: 'Account not verified. New OTP sent to email.',
        requiresVerification: true,
        email: user.email,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Forgot password - send reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account with that email found' });
    }

    const otp = generateOTP();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    await sendPasswordResetEmail(user.email, user.name, otp);

    res.status(200).json({
      message: 'Password reset OTP sent to email.',
      email: user.email,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.resetPasswordOtp !== otp || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset OTP' });
    }

    // Assign new password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    
    // Auto-verify if they reset password successfully
    user.isVerified = true;
    
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses', 'title category price thumbnail');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
