import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PlayCircle, CheckCircle2, Circle, ArrowLeft, ChevronRight, Lock, BookOpen } from 'lucide-react';
import Toast from '../components/Toast';

const CourseViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, refreshUser } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Player state
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [togglingProgress, setTogglingProgress] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const handleToastClose = () => setToastMessage('');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error loading course details');
      }

      // Check if user is actually enrolled or is an admin.
      // If not, kick them back to details page!
      if (!data.isEnrolled && !data.isAdmin) {
        showToast('You are not enrolled in this course!', 'error');
        setTimeout(() => {
          navigate(`/courses/${id}`);
        }, 1500);
        return;
      }

      setCourse(data);

      // Extract completed lesson ids for this course
      const finishedIds = user?.completedLessons
        ?.filter(item => item.courseId.toString() === id.toString())
        ?.map(item => item.lessonId) || [];
      setCompletedLessons(finishedIds);

      // Default the active lesson to the first lesson of the first module if available
      if (data.modules && data.modules.length > 0 && data.modules[0].lessons && data.modules[0].lessons.length > 0) {
        setActiveLesson(data.modules[0].lessons[0]);
      }
    } catch (err) {
      console.error('Error fetching course player data:', err);
      showToast(err.message || 'Error fetching course curriculum', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCourseData();
    }
  }, [id, token]);

  const handleLessonSelect = (lesson) => {
    setActiveLesson(lesson);
  };

  const handleToggleCompletion = async () => {
    if (!activeLesson || togglingProgress) return;

    setTogglingProgress(true);
    try {
      const res = await fetch('/api/progress/toggle-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: id,
          lessonId: activeLesson._id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error updating lesson progress');
      }

      // Update state checklist
      setCompletedLessons(data.completedLessons);
      showToast(
        completedLessons.includes(activeLesson._id) 
          ? 'Marked lesson incomplete' 
          : 'Lesson marked as completed! Excellent work.', 
        'success'
      );
      
      // Sync user context data
      await refreshUser();
    } catch (err) {
      showToast(err.message || 'Error updating progress checklist', 'error');
    } finally {
      setTogglingProgress(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!course) return null;

  // Calculate overall metrics
  let totalLessons = 0;
  course.modules?.forEach(mod => {
    totalLessons += mod.lessons?.length || 0;
  });

  const progressPercent = totalLessons > 0 
    ? Math.round((completedLessons.length / totalLessons) * 100) 
    : 0;

  return (
    <div style={{
      fontFamily: 'Inter, sans-serif',
      backgroundColor: '#0f172a', // Dark theme study background for maximum video contrast
      color: '#e2e8f0',
      minHeight: '92vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Toast message={toastMessage} type={toastType} onClose={handleToastClose} />

      {/* Top sticky room bar */}
      <div style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              backgroundColor: '#334155',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              transition: 'all 0.2s',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#475569'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#334155'}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'white', letterSpacing: '-0.3px' }}>
              {course.title}
            </h2>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
              {course.category}
            </span>
          </div>
        </div>

        {/* Dynamic overall course progress indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13.5px', fontWeight: '700', color: 'white' }}>{progressPercent}% Complete</p>
            <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
              {completedLessons.length} of {totalLessons} Lessons Finished
            </p>
          </div>
          <div className="progress-bar-container" style={{ width: '120px', height: '6px', backgroundColor: '#334155' }}>
            <div className="progress-bar" style={{ width: `${progressPercent}%`, backgroundColor: '#10b981' }} />
          </div>
        </div>
      </div>

      {/* Main split workarea */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 360px',
        flexGrow: 1,
        height: 'calc(92vh - 58px)',
        overflow: 'hidden'
      }}>
        {/* Left pane: Video stream and checkpoints */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto',
          padding: '24px'
        }}>
          {activeLesson ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* HTML5 video wrapper */}
              <div style={{
                width: '100%',
                aspectRatio: '16/9',
                backgroundColor: 'black',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                border: '1px solid #334155'
              }}>
                <video
                  key={activeLesson._id}
                  src={activeLesson.videoUrl}
                  controls
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              {/* Title & mark complete controllers */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#1e293b',
                padding: '20px 24px',
                borderRadius: '12px',
                border: '1px solid #334155'
              }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    NOW PLAYING
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginTop: '4px' }}>
                    {activeLesson.title}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px' }}>
                    Duration: {activeLesson.duration || '00:00'}
                  </p>
                </div>

                <button
                  onClick={handleToggleCompletion}
                  className={`btn ${completedLessons.includes(activeLesson._id) ? 'btn-success' : 'btn-secondary'}`}
                  style={{
                    padding: '10px 20px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderColor: completedLessons.includes(activeLesson._id) ? 'transparent' : '#475569',
                    color: completedLessons.includes(activeLesson._id) ? 'white' : '#e2e8f0',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  disabled={togglingProgress}
                >
                  {completedLessons.includes(activeLesson._id) ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle size={16} />
                      <span>Mark Completed</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '80%',
              color: '#94a3b8'
            }}>
              <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '15px' }}>No active lesson selected. Click on a lesson in the curriculum drawer to play.</p>
            </div>
          )}
        </div>

        {/* Right pane: Module sidebar navigation */}
        <div style={{
          backgroundColor: '#1e293b',
          borderLeft: '1px solid #334155',
          height: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #334155',
            backgroundColor: '#0f172a'
          }}>
            <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Course Syllabus
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Select a lecture to stream the lesson
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {course.modules?.map((module, mIdx) => (
              <div key={module._id || mIdx} style={{ borderBottom: '1px solid #334155' }}>
                {/* Module title */}
                <div style={{
                  backgroundColor: 'rgba(15,23,42,0.3)',
                  padding: '12px 20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#94a3b8',
                  borderBottom: '1px solid rgba(51,65,85,0.5)'
                }}>
                  {module.title}
                </div>

                {/* Lessons mapping */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {module.lessons?.map((lesson, lIdx) => {
                    const isSelected = activeLesson?._id === lesson._id;
                    const isFinished = completedLessons.includes(lesson._id);

                    return (
                      <button
                        key={lesson._id || lIdx}
                        onClick={() => handleLessonSelect(lesson)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 20px',
                          border: 'none',
                          background: isSelected ? 'rgba(59,130,246,0.1)' : 'transparent',
                          borderLeft: `3px solid ${isSelected ? 'var(--primary)' : 'transparent'}`,
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'var(--transition)',
                          fontFamily: 'Inter, sans-serif'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          {isFinished ? (
                            <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                          ) : (
                            <PlayCircle size={15} style={{ color: isSelected ? 'var(--primary)' : '#64748b', flexShrink: 0 }} />
                          )}
                          <span style={{
                            fontSize: '13px',
                            fontWeight: isSelected ? '700' : '500',
                            color: isSelected ? 'white' : '#cbd5e1',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {lesson.title}
                          </span>
                        </div>

                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginLeft: '8px' }}>
                          {lesson.duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
