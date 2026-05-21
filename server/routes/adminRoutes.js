const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const { protect, admin } = require('../middleware/auth');

// @desc    Get dashboard metrics / analytics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
router.get('/dashboard-stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalCourses = await Course.countDocuments({});
    const completedEnrollments = await Enrollment.find({ status: 'completed' });
    
    const totalRevenue = completedEnrollments.reduce((acc, current) => acc + current.amount, 0);
    const totalSalesCount = completedEnrollments.length;

    // Fetch the 5 most recent enrollment records with populated details
    const recentEnrollments = await Enrollment.find({ status: 'completed' })
      .populate('userId', 'name email')
      .populate('courseId', 'title price')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalCourses,
      totalRevenue,
      totalSalesCount,
      recentEnrollments
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users with enrollment counts
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('name email role isVerified enrolledCourses createdAt');
    res.json(users);
  } catch (error) {
    console.error('Fetch users list error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all enrollments/transactions
// @route   GET /api/admin/enrollments
// @access  Private/Admin
router.get('/enrollments', protect, admin, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({})
      .populate('userId', 'name email')
      .populate('courseId', 'title category price')
      .sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (error) {
    console.error('Fetch enrollments error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle user role between admin and student
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
router.put('/users/:id/role', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from demoting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    user.role = user.role === 'admin' ? 'student' : 'admin';
    await user.save();

    res.json({ message: `User role updated to ${user.role} successfully`, user });
  } catch (error) {
    console.error('Toggle role error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
