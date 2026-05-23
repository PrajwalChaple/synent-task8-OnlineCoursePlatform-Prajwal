import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, KeyRound, GraduationCap, Shield } from 'lucide-react';
import Toast from '../components/Toast';

const Register = () => {
  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  // Registration Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

  // OTP dialog states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpTargetEmail, setOtpTargetEmail] = useState('');

  // Notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleToastClose = () => setToastMessage('');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('All fields are required', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, role);
      setOtpTargetEmail(res.email);
      setShowOtpModal(true);
      showToast('Registration successful! OTP verification code sent to your email.', 'success');
    } catch (err) {
      showToast(err.message || 'Registration failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      showToast('Please enter the OTP verification code', 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      await verifyEmail(otpTargetEmail, otp);
      showToast('Email verified and logged in successfully!', 'success');
      setShowOtpModal(false);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      showToast(err.message || 'Invalid or expired OTP', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      fontFamily: 'Inter, sans-serif',
      padding: '24px 0'
    }}>
      <Toast message={toastMessage} type={toastType} onClose={handleToastClose} />

      <div className="card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header Logo */}
        <div className="text-center" style={{ marginBottom: '28px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
          }}>
            <GraduationCap size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>Create an account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Start learning or manage your courses today
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleRegisterSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <User size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <Mail size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <KeyRound size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-light)'
              }} />
            </div>
          </div>

          {/* Account Role Selector Tab-Cards */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">I want to register as a</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setRole('student')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 8px',
                  borderRadius: '8px',
                  border: `2px solid ${role === 'student' ? 'var(--primary)' : 'var(--border-color)'}`,
                  backgroundColor: role === 'student' ? 'var(--primary-light)' : 'white',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <GraduationCap size={20} style={{ color: role === 'student' ? 'var(--primary)' : 'var(--text-light)' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: role === 'student' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                  Student
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 8px',
                  borderRadius: '8px',
                  border: `2px solid ${role === 'admin' ? '#d97706' : 'var(--border-color)'}`,
                  backgroundColor: role === 'admin' ? '#fffbeb' : 'white',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                <Shield size={20} style={{ color: role === 'admin' ? '#d97706' : 'var(--text-light)' }} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: role === 'admin' ? '#d97706' : 'var(--text-secondary)' }}>
                  Instructor/Admin
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{
              padding: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            disabled={loading}
          >
            {loading ? (
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Existing login shortcut */}
        <div className="text-center" style={{ marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: '600'
          }}>
            Sign In
          </Link>
        </div>
      </div>

      {/* OTP Verification Modal Overlay */}
      {showOtpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '380px',
            padding: '30px',
            boxShadow: 'var(--shadow-lg)',
            animation: 'modalScale 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Verify Email Address</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '20px', lineHeight: '1.4' }}>
              We sent a 6-digit verification code to <strong>{otpTargetEmail}</strong>. Please enter the OTP below to activate your account.
            </p>

            <form onSubmit={handleOtpSubmit}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="otp">Verification Code (OTP)</label>
                <input
                  id="otp"
                  type="text"
                  className="form-input text-center"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  style={{
                    letterSpacing: '6px',
                    fontSize: '20px',
                    fontWeight: '700',
                    fontFamily: 'monospace'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => setShowOtpModal(false)}
                  disabled={verifyingOtp}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={verifyingOtp}
                >
                  {verifyingOtp ? (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto'
                    }} />
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
