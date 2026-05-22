import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, GraduationCap, LogOut, ShieldAlert, User, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '14px 0',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)'
    }}>
      <div className="container flex justify-between align-center" style={{ width: '100%' }}>
        {/* Logo */}
        <Link to="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          textDecoration: 'none',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
          }}>
            <GraduationCap size={24} />
          </div>
          <span style={{
            fontFamily: 'var(--font-header)',
            fontSize: '22px',
            fontWeight: '800',
            letterSpacing: '-0.5px',
            background: 'linear-gradient(to right, #0f172a, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            EduSphere
          </span>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NavLink 
            to="/" 
            end
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              transition: 'var(--transition)',
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--primary-light)' : 'transparent'
            })}
          >
            <BookOpen size={16} />
            <span>Courses</span>
          </NavLink>

          {user && (
            <NavLink 
              to="/dashboard" 
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'var(--transition)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent'
              })}
            >
              <User size={16} />
              <span>Dashboard</span>
            </NavLink>
          )}

          {user && user.role === 'admin' && (
            <NavLink 
              to="/admin" 
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'var(--transition)',
                color: isActive ? 'var(--danger-hover)' : 'var(--text-secondary)',
                backgroundColor: isActive ? '#fef2f2' : 'transparent'
              })}
            >
              <ShieldAlert size={16} />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        {/* User profile controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {user.name}
                </p>
                <span className={`badge badge-${user.role}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                  {user.role}
                </span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderColor: 'var(--border-color)',
                  padding: '6px 12px',
                  borderRadius: '6px'
                }}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link 
                to="/login" 
                className="btn btn-secondary btn-sm"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  padding: '8px 16px'
                }}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary btn-sm"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  padding: '8px 16px'
                }}
              >
                <UserPlus size={14} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
