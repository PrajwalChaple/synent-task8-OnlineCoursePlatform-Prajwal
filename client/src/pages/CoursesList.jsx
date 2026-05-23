import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, GraduationCap, ChevronRight } from 'lucide-react';
import Toast from '../components/Toast';

const Categories = ['All', 'Web Development', 'Data Science', 'Design'];

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const handleToastClose = () => setToastMessage('');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/courses', window.location.origin);
      if (search) {
        url.searchParams.append('search', search);
      }
      if (selectedCategory && selectedCategory !== 'All') {
        url.searchParams.append('category', selectedCategory);
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      } else {
        showToast('Error loading courses catalog', 'error');
      }
    } catch (err) {
      console.error('Error fetching courses list:', err);
      showToast('Backend server is not connected.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when category or search query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 300); // 300ms debounce for search query

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedCategory]);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <Toast message={toastMessage} type={toastType} onClose={handleToastClose} />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        padding: '80px 0 60px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated accent gradient blobs */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '10%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.15)',
          filter: 'blur(60px)',
          animation: 'floatSlow 8s ease-in-out infinite alternate'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.12)',
          filter: 'blur(60px)',
          animation: 'floatSlow 10s ease-in-out infinite alternate-reverse'
        }} />

        <style>{`
          @keyframes floatSlow {
            from { transform: translateY(0) scale(1); }
            to { transform: translateY(15px) scale(1.05); }
          }
        `}</style>

        <div className="container">
          <div className="flex align-center justify-between" style={{ display: 'inline-flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'white',
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--primary)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid #dbeafe'
            }}>
              <GraduationCap size={16} />
              EduSphere Courses
            </span>
          </div>

          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            lineHeight: '1.2',
            letterSpacing: '-1px',
            color: 'var(--text-primary)',
            maxWidth: '650px',
            margin: '0 auto 16px'
          }}>
            Master New Skills with Premium Video Curriculums
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            maxWidth: '550px',
            margin: '0 auto 36px',
            lineHeight: '1.6'
          }}>
            Learn from industry specialists in web engineering, statistics, graphic designs, and product planning. Enlist now and unlock lifetime support.
          </p>

          {/* Catalog Interactive Search */}
          <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            position: 'relative',
            boxShadow: 'var(--shadow-md)',
            borderRadius: '10px'
          }}>
            <input
              type="text"
              placeholder="What do you want to learn today?"
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '16px 20px 16px 48px',
                fontSize: '15px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1'
              }}
            />
            <Search size={20} style={{
              position: 'absolute',
              left: '18px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-light)'
            }} />
          </div>
        </div>
      </section>

      {/* Catalog Grid Section */}
      <section className="container section">
        {/* Category filtering Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '36px',
          flexWrap: 'wrap'
        }}>
          {Categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '10px 20px',
                borderRadius: '99px',
                border: '1px solid transparent',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'var(--transition)',
                backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'white',
                color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                boxShadow: selectedCategory === cat ? '0 4px 10px rgba(37, 99, 235, 0.15)' : 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat) {
                  e.target.style.backgroundColor = '#f1f5f9';
                  e.target.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat) {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content loader state */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : courses.length === 0 ? (
          <div className="card text-center" style={{ padding: '60px 40px', backgroundColor: 'white' }}>
            <BookOpen size={48} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No courses matched</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px' }}>
              We couldn't find any course matching your current criteria. Try adjusting your query or category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-3">
            {courses.map((course) => (
              <div key={course._id} className="card card-hover flex flex-col" style={{ backgroundColor: 'white', minHeight: '410px' }}>
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  style={{ width: '100%', height: '190px', objectFit: 'cover' }}
                />

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  {/* Category */}
                  <span className="badge badge-student" style={{ alignSelf: 'flex-start', marginBottom: '12px' }}>
                    {course.category}
                  </span>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    lineHeight: '1.4',
                    marginBottom: '10px',
                    color: 'var(--text-primary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '50px'
                  }}>
                    {course.title}
                  </h3>

                  {/* Short Description */}
                  <p style={{
                    fontSize: '13.5px',
                    color: 'var(--text-secondary)',
                    marginBottom: '20px',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '40px'
                  }}>
                    {course.description}
                  </p>

                  {/* Pricing and Details trigger CTA */}
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRICE</p>
                      <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {course.price === 0 ? 'FREE' : `₹${course.price}`}
                      </p>
                    </div>

                    <Link
                      to={`/courses/${course._id}`}
                      className="btn btn-primary"
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Explore</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CoursesList;
