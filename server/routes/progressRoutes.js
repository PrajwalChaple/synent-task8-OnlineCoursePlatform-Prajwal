const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { protect } = require('../middleware/auth');

// @desc    Toggle lesson completion status for a student
// @route   POST /api/progress/toggle-lesson
// @access  Private
router.post('/toggle-lesson', protect, async (req, res) => {
  const { courseId, lessonId } = req.body;

  if (!courseId || !lessonId) {
    return res.status(400).json({ message: 'Course ID and Lesson ID are required' });
  }

  try {
    const user = await User.findById(req.user._id);

    // Verify user is enrolled or is admin
    const isEnrolled = user.enrolledCourses.includes(courseId) || user.role === 'admin';
    if (!isEnrolled) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Check if the lesson is already marked as completed
    const existingIndex = user.completedLessons.findIndex(
      (item) => item.courseId.toString() === courseId && item.lessonId === lessonId
    );

    if (existingIndex > -1) {
      // If it exists, remove it (toggle off)
      user.completedLessons.splice(existingIndex, 1);
    } else {
      // If it doesn't exist, add it (toggle on)
      user.completedLessons.push({ courseId, lessonId });
    }

    await user.save();

    // Return completed lessons specifically for this course
    const completedLessonIds = user.completedLessons
      .filter((item) => item.courseId.toString() === courseId)
      .map((item) => item.lessonId);

    res.json({
      message: 'Lesson progress updated successfully',
      completedLessons: completedLessonIds,
    });
  } catch (error) {
    console.error('Toggle progress error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
