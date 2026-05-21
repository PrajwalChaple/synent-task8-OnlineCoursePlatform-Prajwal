const Course = require('./models/course');
const User = require('./models/user');

const sampleCourses = [
  {
    title: 'Full-Stack Web Development Bootcamp',
    description: 'Learn modern web development from absolute scratch. This course covers HTML, CSS, JavaScript, Node.js, Express, MongoDB, and React. Build and deploy multiple real-world full-stack applications with beautiful UI.',
    category: 'Web Development',
    price: 1999,
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
    modules: [
      {
        title: 'Module 1: Getting Started with HTML & CSS',
        lessons: [
          {
            title: '1.1 Introduction to Web & HTML5 Basics',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            duration: '08:45'
          },
          {
            title: '1.2 CSS Flexbox & Responsive Styling',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            duration: '12:10'
          }
        ]
      },
      {
        title: 'Module 2: Javascript Essentials & DOM',
        lessons: [
          {
            title: '2.1 Async Javascript, Promises & Fetch API',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            duration: '15:30'
          },
          {
            title: '2.2 DOM manipulation & Event listeners',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            duration: '10:50'
          }
        ]
      }
    ]
  },
  {
    title: 'React & Redux - The Complete Guide',
    description: 'Master React.js from fundamentals to advanced state management. Build highly performant, responsive web components, handle complex application state using Redux Toolkit, and deploy custom apps.',
    category: 'Web Development',
    price: 1499,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
    modules: [
      {
        title: 'Module 1: React Basics & State Management',
        lessons: [
          {
            title: '1.1 React Components & Props Hierarchy',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            duration: '14:20'
          },
          {
            title: '1.2 Handling State with useState Hook',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            duration: '09:40'
          }
        ]
      },
      {
        title: 'Module 2: Advanced React & Context API',
        lessons: [
          {
            title: '2.1 React Router DOM Navigation',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
            duration: '11:15'
          },
          {
            title: '2.2 State Sharing using Context API',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            duration: '16:05'
          }
        ]
      }
    ]
  },
  {
    title: 'Mastering Python for Data Science',
    description: 'Dive deep into Data Science and Machine Learning. Clean and visualize dataset tables with Pandas and Matplotlib, work with Numpy vectors, and build modern predictive models using Scikit-Learn.',
    category: 'Data Science',
    price: 2499,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
    modules: [
      {
        title: 'Module 1: NumPy & Pandas Foundations',
        lessons: [
          {
            title: '1.1 NumPy Arrays & Vector Operations',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            duration: '13:00'
          },
          {
            title: '1.2 Data cleaning & Wrangling with Pandas',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            duration: '18:50'
          }
        ]
      }
    ]
  },
  {
    title: 'UI/UX Design Essentials',
    description: 'Learn modern product design frameworks. Explore wireframing, high-fidelity prototypes, user research interviews, typographic grids, harmonious color theories, and build sleek design systems in Figma.',
    category: 'Design',
    price: 1299,
    thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=60',
    modules: [
      {
        title: 'Module 1: UX Foundations & User Research',
        lessons: [
          {
            title: '1.1 Principles of UX and Design Thinking',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            duration: '15:45'
          }
        ]
      }
    ]
  }
];

const autoSeedIfEmpty = async () => {
  try {
    const courseCount = await Course.countDocuments({});
    if (courseCount === 0) {
      console.log('[Auto-Seed] Database is empty. Seeding catalog in progress...');
      await Course.insertMany(sampleCourses);
      console.log('[Auto-Seed] Seeded 4 premium catalog courses.');

      // Seed Admin
      const adminEmail = 'admin@platform.com';
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        await User.create({
          name: 'Super Admin',
          email: adminEmail,
          password: 'adminpassword123',
          role: 'admin',
          isVerified: true
        });
        console.log('[Auto-Seed] Seeded default admin account.');
      }

      // Seed Student
      const studentEmail = 'student@platform.com';
      const studentExists = await User.findOne({ email: studentEmail });
      if (!studentExists) {
        await User.create({
          name: 'John Doe',
          email: studentEmail,
          password: 'studentpassword123',
          role: 'student',
          isVerified: true
        });
        console.log('[Auto-Seed] Seeded default student account.');
      }
    } else {
      console.log(`[Auto-Seed] DB contains ${courseCount} courses. Seeding skipped.`);
    }
  } catch (error) {
    console.error('[Auto-Seed] Error seeding database:', error.message);
  }
};

module.exports = { autoSeedIfEmpty };
