const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter a lesson title'],
    trim: true,
  },
  videoUrl: {
    type: String,
    required: [true, 'Please enter a video URL'],
    trim: true,
  },
  duration: {
    type: String,
    default: '0:00', // e.g. "12:30"
  }
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter a module title'],
    trim: true,
  },
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter a course title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please enter a course description'],
  },
  category: {
    type: String,
    required: [true, 'Please enter a course category'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please enter a course price'],
    min: [0, 'Price must be non-negative'],
  },
  thumbnail: {
    type: String,
    required: [true, 'Please provide a thumbnail image URL'],
  },
  modules: [moduleSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Course', courseSchema);
