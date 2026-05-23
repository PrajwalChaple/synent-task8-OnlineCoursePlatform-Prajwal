import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, KeyRound, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Toast from '../components/Toast';

const ForgotPassword = () => {
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Wizard state: 1 = Enter Email, 2 = Enter OTP and New Password, 3 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleToastClose = () => setToastMessage('');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      showToast('Password reset OTP sent! Please check your email inbox.', 'success');
      setStep(2);
    } catch (err) {
      showToast(err.message || 'Email address not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      showToast('Please enter the OTP and your new password', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      showToast('Password updated successfully!', 'success');
      setStep(3);
    } catch (err) {
      showToast(err.message || 'Invalid or expired reset OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      fontFamily: 'Inter, sans-serif',
      padding: '24px 0'
    }}>
      <Toast message={toastMessage} type={toastType} onClose={handleToastClose} />

      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '36px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Back Link */}
        {step < 3 && (
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '500',
              marginBottom: '24px',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        )}

        {/* STEP 1: Enter email */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Reset Password
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.4' }}>
              Forgot your credentials? Enter your email address below, and we'll transmit a 6-digit recovery code.
            </p>

            <form onSubmit={handleRequestOtp}>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
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
                    <Send size={15} />
                    <span>Send Reset OTP</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Input OTP & new password */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Create New Password
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '24px', lineHeight: '1.4' }}>
              An verification code has been dispatched to <strong>{email}</strong>. Input the code along with your new desired password.
            </p>

            <form onSubmit={handleResetPasswordSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="otp">Reset OTP</label>
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
                    fontSize: '18px',
                    fontWeight: '700',
                    fontFamily: 'monospace'
                  }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="newPassword">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="newPassword"
                    type="password"
                    className="form-input"
                    placeholder="Min. 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Recovery Success */}
        {step === 3 && (
          <div className="text-center" style={{ padding: '12px 0' }}>
            <div style={{
              background: 'var(--success-light)',
              color: 'var(--success)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Success!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.4' }}>
              Your password has been updated successfully. You can now log in using your new credentials.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary w-full"
              style={{ padding: '12px', fontWeight: '600' }}
            >
              Log In Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
