import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, BookOpen, PlayCircle, Trophy, ArrowRight, Clock } from 'lucide-react';
import Toast from '../components/Toast';

const Dashboard = () => {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [coursesWithProgress, setCoursesWithProgress] = useState([]);

  // Notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const handleToastClose = () => setToastMessage('');

  useEffect(() => {
    const fetchDashboardDetails = async () => {
      setLoading(true);
      try {
        // Refresh the user session info to get latest enrolled courses
        await refreshUser();
      } catch (err) {
        console.error('Error refreshing dashboard user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardDetails();
  }, []);

  // Sync enrolled courses and calculate approximate completions
  useEffect(() => {
    if (!user || !user.enrolledCourses) return;

    const calculateCourseProgress = async () => {
      try {
        const enrichedList = await Promise.all(
          user.enrolledCourses.map(async (course) => {
            try {
              // Fetch each course detail to get full lesson count
              const res = await fetch(`/api/courses/${course._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.ok) {
                const fullCourse = await res.json();
                
                // Count total lessons
                let totalLessons = 0;
                fullCourse.modules?.forEach(mod => {
                  totalLessons += mod.lessons?.length || 0;
                });

                // Count completed lessons matching this courseId
                const completedInCourse = user.completedLessons?.filter(
                  (item) => item.courseId.toString() === course._id.toString()
                ) || [];

                const percent = totalLessons > 0 
                  ? Math.round((completedInCourse.length / totalLessons) * 100) 
                  : 0;

                return {
                  ...course,
                  totalLessons,
                  completedCount: completedInCourse.length,
                  progressPercent: percent
                };
              }
            } catch (err) {
              console.error(`Error loading course details for ${course._id}:`, err);
            }
            return {
              ...course,
              totalLessons: 0,
              completedCount: 0,
              progressPercent: 0
            };
          })
        );
        setCoursesWithProgress(enrichedList);
      } catch (error) {
        console.error('Error calculating progresses:', error);
      }
    };

    if (user.enrolledCourses.length > 0) {
      calculateCourseProgress();
    } else {
      setCoursesWithProgress([]);
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container section" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Toast message={toastMessage} type={toastType} onClose={handleToastClose} />

      {/* Header Banner Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        borderRadius: '16px',
        padding: '40px',
        color: 'white',
        marginBottom: '40px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract background graphics */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.1)',
          filter: 'blur(40px)'
        }} />

        <div className="flex align-center gap-12" style={{ marginBottom: '12px' }}>
          <GraduationCap size={28} style={{ color: '#3b82f6' }} />
          <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', color: '#94a3b8', fontWeight: '700' }}>
            STUDENT DASHBOARD
          </span>
        </div>
        <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          Welcome back, {user?.name}!
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '8px', maxWidth: '500px', fontSize: '15px' }}>
          Continue where you left off or find new skills to master today.
        </p>

        {/* Dashboard stats panel */}
        <div style={{
          display: 'flex',
          gap: '24px',
          marginTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '24px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '10px', borderRadius: '8px' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>ENROLLED COURSES</p>
              <p style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>{user?.enrolledCourses?.length || 0}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '10px', borderRadius: '8px' }}>
              <Trophy size={20} />
            </div>
            <div>
              <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>COMPLETED LESSONS</p>
              <p style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>{user?.completedLessons?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '24px', letterSpacing: '-0.5px' }}>
          My Enrolled Courses
        </h2>

        {coursesWithProgress.length === 0 ? (
          <div className="card text-center" style={{ padding: '60px 40px', backgroundColor: 'white' }}>
            <BookOpen size={48} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No enrollments yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              You are not registered in any course. Explore our premium catalog and kickstart your learning journey!
            </p>
            <Link to="/" className="btn btn-primary" style={{ padding: '12px 24px', fontWeight: '600' }}>
              Browse Course Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-3">
            {coursesWithProgress.map((course) => (
              <div key={course._id} className="card card-hover flex flex-col" style={{ backgroundColor: 'white', minHeight: '380px' }}>
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
                
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  {/* Category */}
                  <span className="badge badge-student" style={{ alignSelf: 'flex-start', marginBottom: '12px' }}>
                    {course.category}
                  </span>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '17px',
                    fontWeight: '700',
                    lineHeight: '1.4',
                    marginBottom: '16px',
                    color: 'var(--text-primary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '48px'
                  }}>
                    {course.title}
                  </h3>

                  {/* Progress Info */}
                  <div style={{ marginTop: 'auto' }}>
                    <div className="flex justify-between align-center" style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                      <span className="flex align-center gap-12" style={{ fontWeight: '500' }}>
                        <Clock size={14} style={{ color: 'var(--text-light)' }} />
                        {course.progressPercent}% Complete
                      </span>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {course.completedCount}/{course.totalLessons} Lessons
                      </span>
                    </div>

                    <div className="progress-bar-container" style={{ marginBottom: '20px' }}>
                      <div className="progress-bar" style={{ width: `${course.progressPercent}%` }} />
                    </div>

                    {/* Resume learning CTA */}
                    <Link
                      to={`/courses/${course._id}/learn`}
                      className="btn btn-primary w-full"
                      style={{
                        padding: '10px',
                        fontWeight: '600',
                        fontSize: '13.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <PlayCircle size={16} />
                      <span>Resume Learning</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
