const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Course = require('../models/course');
const User = require('../models/user');
const { protect, admin } = require('../middleware/auth');

// Helper middleware to optionally check authentication
const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch (error) {
      console.log('Optional authentication failed. Proceeding as guest.');
    }
  }
  next();
};

// @desc    Get all courses with optional search/category filters
// @route   GET /api/courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    // Return courses without full curriculum details on general fetch
    const courses = await Course.find(query).select('title description category price thumbnail createdAt');
    res.json(courses);
  } catch (error) {
    console.error('Fetch courses error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single course curriculum and details
// @route   GET /api/courses/:id
// @access  Public (Optionally Authenticated)
router.get('/:id', optionalProtect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let isEnrolled = false;
    let isAdmin = false;

    if (req.user) {
      isAdmin = req.user.role === 'admin';
      isEnrolled = req.user.enrolledCourses.includes(course._id.toString());
    }

    // Convert course mongoose object to plain JSON to edit
    const courseObj = course.toObject();

    // If user is not enrolled and not an admin, hide videoUrls
    if (!isEnrolled && !isAdmin) {
      if (courseObj.modules) {
        courseObj.modules = courseObj.modules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => ({
            _id: lesson._id,
            title: lesson.title,
            duration: lesson.duration,
            videoUrl: '' // Hide video url for non-enrolled students
          }))
        }));
      }
    }

    res.json({
      ...courseObj,
      isEnrolled,
      isAdmin
    });
  } catch (error) {
    console.error('Fetch single course error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { title, description, category, price, thumbnail, modules } = req.body;

  try {
    const course = new Course({
      title,
      description,
      category,
      price: Number(price),
      thumbnail,
      modules: modules || []
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const { title, description, category, price, thumbnail, modules } = req.body;

  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    course.price = price !== undefined ? Number(price) : course.price;
    course.thumbnail = thumbnail || course.thumbnail;
    course.modules = modules || course.modules;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Delete course
    await Course.deleteOne({ _id: req.params.id });

    // Also optionally remove this course from user's enrolledCourses list
    await User.updateMany(
      { enrolledCourses: req.params.id },
      { $pull: { enrolledCourses: req.params.id, completedLessons: { courseId: req.params.id } } }
    );

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
