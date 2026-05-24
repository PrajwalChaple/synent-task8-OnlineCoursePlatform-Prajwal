import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Page components
import CoursesList from './pages/CoursesList';
import CourseDetails from './pages/CourseDetails';
import CourseViewer from './pages/CourseViewer';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Layout component wrapping all routes (includes navbar & footer)
const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '36px 0',
        borderTop: '1px solid #1e293b',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13.5px'
      }}>
        <div className="container">
          <p style={{ fontWeight: '600', color: 'white', marginBottom: '8px' }}>EduSphere Learning Portal</p>
          <p>© {new Date().getFullYear()} EduSphere Inc. All rights reserved. Self-paced Premium Curriculums.</p>
        </div>
      </footer>
    </div>
  );
};

// Course Viewer layout (hides base navbar/footer to maximize video focus)
const MinimalLayout = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main website layout with navbar */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<CoursesList />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            
            {/* Authenticated Student routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Authenticated Admin only routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Visitor auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Minimal distraction-free study layout */}
          <Route element={<MinimalLayout />}>
            <Route path="/courses/:id/learn" element={
              <ProtectedRoute>
                <CourseViewer />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={
            <div className="text-center" style={{ padding: '80px 0', fontFamily: 'Inter, sans-serif' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>404 - Page Not Found</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>The resource you requested could not be retrieved.</p>
              <a href="/" className="btn btn-primary mt-24">Return to Homepage</a>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
