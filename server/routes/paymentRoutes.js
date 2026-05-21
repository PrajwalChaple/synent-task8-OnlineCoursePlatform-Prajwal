const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Course = require('../models/course');
const User = require('../models/user');
const Enrollment = require('../models/enrollment');
const { protect } = require('../middleware/auth');
const { sendEnrollmentEmail } = require('../services/emailService');

// Check if Razorpay keys are placeholders
const isBypassMode = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return !keyId || !keySecret || keyId === 'rzp_test_placeholder_key_id' || keySecret === 'placeholder_secret';
};

// Initialize Razorpay if not in bypass mode
let razorpay;
if (!isBypassMode()) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log('Razorpay SDK initialized successfully.');
  } catch (error) {
    console.error('Error initializing Razorpay, switching to Payment Bypass Mode.', error);
  }
} else {
  console.log('Running payments in Bypass Mode (Developer Mode). No real payment required.');
}

// @desc    Create a payment order for a course
// @route   POST /api/payments/create-order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is already enrolled
    if (req.user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    const amount = Math.round(course.price * 100); // Razorpay expects amount in paise (1 INR = 100 paise)

    // Free courses enrollment bypass
    if (amount === 0) {
      // Direct enrollment for free courses
      const user = await User.findById(req.user._id);
      user.enrolledCourses.push(courseId);
      await user.save();

      const enrollment = await Enrollment.create({
        userId: req.user._id,
        courseId,
        razorpayOrderId: 'free_course_enrollment',
        razorpayPaymentId: 'free_payment',
        amount: 0,
        status: 'completed',
      });

      await sendEnrollmentEmail(user.email, user.name, course.title, 0);

      return res.status(200).json({
        message: 'Successfully enrolled in free course',
        isFree: true,
      });
    }

    if (isBypassMode() || !razorpay) {
      // Simulate Razorpay order structure
      const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 11)}`;
      
      // Save pending enrollment
      await Enrollment.create({
        userId: req.user._id,
        courseId,
        razorpayOrderId: mockOrderId,
        amount: course.price,
        status: 'pending',
      });

      return res.status(200).json({
        id: mockOrderId,
        amount: amount,
        currency: 'INR',
        isBypassMode: true,
        key: 'rzp_test_bypass_key',
        courseName: course.title,
        userName: req.user.name,
        userEmail: req.user.email,
      });
    }

    // Real Razorpay integration
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_course_${courseId.toString().substring(0, 10)}_${Date.now().toString().substring(5)}`,
    };

    const order = await razorpay.orders.create(options);

    // Save pending enrollment
    await Enrollment.create({
      userId: req.user._id,
      courseId,
      razorpayOrderId: order.id,
      amount: course.price,
      status: 'pending',
    });

    res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      courseName: course.title,
      userName: req.user.name,
      userEmail: req.user.email,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify Razorpay signature & complete enrollment
// @route   POST /api/payments/verify-signature
// @access  Private
router.post('/verify-signature', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId, razorpayOrderId: razorpay_order_id });
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment record not found' });
    }

    let isValid = false;

    // Check if bypass mode
    if (isBypassMode() || razorpay_order_id.startsWith('order_mock_')) {
      isValid = true;
      console.log('Enrollment validated using bypass mode.');
    } else {
      // Validate signature
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature === razorpay_signature) {
        isValid = true;
      }
    }

    if (!isValid) {
      enrollment.status = 'failed';
      await enrollment.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Success transaction
    enrollment.razorpayPaymentId = razorpay_payment_id || 'bypass_payment_id';
    enrollment.status = 'completed';
    await enrollment.save();

    // Add course to user enrolled list
    const user = await User.findById(req.user._id);
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    // Send email notification
    await sendEnrollmentEmail(user.email, user.name, course.title, enrollment.amount);

    res.status(200).json({
      success: true,
      message: 'Payment verified and enrolled successfully',
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
