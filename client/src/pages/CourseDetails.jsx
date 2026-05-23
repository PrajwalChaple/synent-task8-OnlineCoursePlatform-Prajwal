import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, GraduationCap, ChevronRight, Lock, PlayCircle, ShieldCheck, Check } from 'lucide-react';
import Toast from '../components/Toast';

const CourseDetails = () => {
  const { id } = useParams();
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const handleToastClose = () => setToastMessage('');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`/api/courses/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      } else {
        showToast('Error loading course specifications.', 'error');
      }
    } catch (err) {
      console.error('Error fetching course detail specs:', err);
      showToast('Error connecting to backend API.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [id, token]);

  const handleEnrollNow = async () => {
    if (!user) {
      showToast('Please sign in to register for courses', 'error');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    setEnrolling(true);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: id })
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.message || 'Error initiating order creation');
      }

      // 1. FREE Course enrollment bypass
      if (orderData.isFree) {
        showToast('Successfully enrolled in this free course!', 'success');
        await refreshUser();
        setTimeout(() => {
          navigate(`/courses/${id}/learn`);
        }, 1500);
        return;
      }

      // 2. Developer Bypass Mode (Mock razorpay orders)
      if (orderData.isBypassMode) {
        showToast('Bypass Mode Active: Processing mock payment checkout...', 'success');
        
        // Wait 1.5 seconds to simulate a payment screen
        setTimeout(async () => {
          try {
            const verifyRes = await fetch('/api/payments/verify-signature', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                courseId: id,
                razorpay_order_id: orderData.id,
                razorpay_payment_id: 'mock_pay_' + Math.random().toString(36).substring(2, 9),
                razorpay_signature: 'mock_signature_data'
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              showToast('Payment verified successfully! Welcome to the course.', 'success');
              await refreshUser();
              setTimeout(() => {
                navigate(`/courses/${id}/learn`);
              }, 1500);
            } else {
              showToast(verifyData.message || 'Signature verification failed', 'error');
            }
          } catch (verifyErr) {
            showToast('Error validating bypass signature.', 'error');
          } finally {
            setEnrolling(false);
          }
        }, 1500);
        return;
      }

      // 3. Real Razorpay Standard Checkout Popup
      if (window.Razorpay) {
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'EduSphere',
          description: `Enroll in ${orderData.courseName}`,
          order_id: orderData.id,
          prefill: {
            name: orderData.userName,
            email: orderData.userEmail
          },
          theme: {
            color: '#2563eb'
          },
          handler: async function (response) {
            setEnrolling(true);
            try {
              const verifyRes = await fetch('/api/payments/verify-signature', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  courseId: id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok) {
                showToast('Payment successfully processed! Redirecting to study desk...', 'success');
                await refreshUser();
                setTimeout(() => {
                  navigate(`/courses/${id}/learn`);
                }, 1500);
              } else {
                showToast(verifyData.message || 'Payment signature mismatch', 'error');
              }
            } catch (err) {
              showToast('Error processing signature verification', 'error');
            } finally {
              setEnrolling(false);
            }
          },
          modal: {
            ondismiss: function () {
              setEnrolling(false);
              showToast('Transaction cancelled by user.', 'error');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error('Razorpay Checkout SDK failed to load. Please refresh the page.');
      }

    } catch (error) {
      showToast(error.message || 'Payment failed', 'error');
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container section text-center">
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Course Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>The course you requested does not exist.</p>
        <Link to="/" className="btn btn-primary mt-24">Back to Catalog</Link>
      </div>
    );
  }

  // Calculate stats
  let totalLessons = 0;
  course.modules?.forEach(mod => {
    totalLessons += mod.lessons?.length || 0;
  });

  return (
    <div className="container section" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Toast message={toastMessage} type={toastType} onClose={handleToastClose} />

      {/* Grid split view */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 360px',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Left Side: Detail specifications */}
        <div>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
            <Link to="/" style={{ color: 'var(--text-light)', textDecoration: 'none' }}>Courses</Link>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--text-secondary)' }}>{course.category}</span>
          </div>

          <h1 style={{
            fontSize: '36px',
            fontWeight: '800',
            lineHeight: '1.2',
            letterSpacing: '-0.5px',
            marginBottom: '16px',
            color: 'var(--text-primary)'
          }}>
            {course.title}
          </h1>

          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '36px'
          }}>
            {course.description}
          </p>

          {/* Key Selling Features */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>What you will learn</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              backgroundColor: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <Check size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
                <span>Industry-ready practical curriculum and code repos</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <Check size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
                <span>Step-by-step video lessons with source guides</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <Check size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
                <span>Lifetime unlimited access to study modules</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <Check size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
                <span>Interactive self-paced progress dashboard tools</span>
              </div>
            </div>
          </div>

          {/* Curriculum Index */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Course Syllabus</h3>
            
            {course.modules?.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>No modules added yet.</p>
            ) : (
              <div className="flex flex-col gap-24">
                {course.modules.map((module, mIdx) => (
                  <div key={module._id || mIdx} style={{
                    backgroundColor: 'white',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    {/* Module title header */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: '16px 24px',
                      borderBottom: '1px solid var(--border-color)',
                      fontWeight: '600',
                      fontSize: '15px'
                    }}>
                      {module.title}
                    </div>

                    {/* Module lessons list */}
                    <div style={{ padding: '8px 0' }}>
                      {module.lessons?.map((lesson, lIdx) => (
                        <div key={lesson._id || lIdx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 24px',
                          borderBottom: lIdx === module.lessons.length - 1 ? 'none' : '1px solid #f1f5f9',
                          fontSize: '14px',
                          color: 'var(--text-secondary)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {course.isEnrolled || course.isAdmin ? (
                              <PlayCircle size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            ) : (
                              <Lock size={15} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                            )}
                            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                              {lesson.title}
                            </span>
                          </div>
                          
                          <span style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '500' }}>
                            {lesson.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Order checkout purchase desk */}
        <div style={{
          position: 'sticky',
          top: '90px'
        }}>
          <div className="card" style={{
            backgroundColor: 'white',
            padding: '24px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <img
              src={course.thumbnail}
              alt={course.title}
              style={{
                width: '100%',
                height: '180px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '20px'
              }}
            />

            {/* Price desk */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-light)', textTransform: 'uppercase' }}>COURSE PRICE</span>
              <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                {course.price === 0 ? 'FREE' : `₹${course.price}`}
              </p>
            </div>

            {/* Checkouts triggers */}
            {course.isEnrolled ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--success-light)',
                  padding: '12px',
                  borderRadius: '8px',
                  color: 'var(--success-hover)',
                  fontSize: '13.5px',
                  fontWeight: '600'
                }}>
                  <ShieldCheck size={18} />
                  <span>You are enrolled in this course!</span>
                </div>
                <Link
                  to={`/courses/${course._id}/learn`}
                  className="btn btn-success w-full"
                  style={{ padding: '12px', fontWeight: '600' }}
                >
                  Start Learning Room
                </Link>
              </div>
            ) : course.isAdmin ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#fffbeb',
                  padding: '12px',
                  borderRadius: '8px',
                  color: '#d97706',
                  fontSize: '13.5px',
                  fontWeight: '600'
                }}>
                  <ShieldCheck size={18} />
                  <span>Admin access override active</span>
                </div>
                <Link
                  to={`/courses/${course._id}/learn`}
                  className="btn btn-primary w-full"
                  style={{ padding: '12px', fontWeight: '600' }}
                >
                  Start Learning Room
                </Link>
              </div>
            ) : (
              <button
                onClick={handleEnrollNow}
                className="btn btn-primary w-full"
                style={{
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                disabled={enrolling}
              >
                {enrolling ? (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <>
                    <span>Enroll Now</span>
                  </>
                )}
              </button>
            )}

            {/* Quick overview bullet stats */}
            <div style={{
              marginTop: '24px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '13.5px',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)' }}>Lectures Count</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{totalLessons} lessons</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)' }}>Access Terms</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Lifetime access</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)' }}>Certifications</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
