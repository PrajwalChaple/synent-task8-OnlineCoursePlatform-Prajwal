import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, BookOpen, DollarSign, ShoppingBag, Plus, Trash2, Edit2, 
  Check, UserCheck, ShieldAlert, Award, FileText, CheckSquare 
} from 'lucide-react';
import Toast from '../components/Toast';

const Categories = ['Web Development', 'Data Science', 'Design'];

const AdminDashboard = () => {
  const { token, user } = useAuth();
  
  // Navigation active tab: 'stats', 'courses', 'users', 'enrollments'
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // Modal / Form state for course Add/Edit
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    price: 0,
    thumbnail: '',
    modules: []
  });

  // Notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const handleToastClose = () => setToastMessage('');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
  };

  // Fetch metrics/analytics
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard metrics:', err);
    }
  };

  // Fetch course list
  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Error fetching courses list:', err);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch all completed transactions
  const fetchEnrollments = async () => {
    try {
      const res = await fetch('/api/admin/enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchCourses(),
      fetchUsers(),
      fetchEnrollments()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Promote / Demote User Role toggler
  const handleToggleUserRole = async (targetUserId) => {
    try {
      const res = await fetch(`/api/admin/users/${targetUserId}/role`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message, 'success');
        fetchUsers();
        fetchStats(); // Update totals if role count changes
      } else {
        showToast(data.message || 'Error changing role', 'error');
      }
    } catch (err) {
      showToast('Error sending role update.', 'error');
    }
  };

  // Delete Course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this course? This will remove all associated modules, lessons, and student enrollment records!')) {
      return;
    }

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        showToast('Course successfully deleted!', 'success');
        loadData(); // Reload everything
      } else {
        showToast(data.message || 'Error deleting course', 'error');
      }
    } catch (err) {
      showToast('Error connecting to backend server', 'error');
    }
  };

  // Trigger Create/Add Course Modal
  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: '',
      description: '',
      category: 'Web Development',
      price: 0,
      thumbnail: '',
      modules: []
    });
    setShowCourseModal(true);
  };

  // Trigger Edit Course Modal (fetches course with full curriculum modules first)
  const handleOpenEditCourse = async (courseId) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setEditingCourseId(courseId);
        setCourseForm({
          title: data.title,
          description: data.description,
          category: data.category,
          price: data.price,
          thumbnail: data.thumbnail,
          modules: data.modules || []
        });
        setShowCourseModal(true);
      } else {
        showToast('Error loading course modules', 'error');
      }
    } catch (err) {
      showToast('Error connecting to backend API', 'error');
    }
  };

  // Handle nested module / lesson modifications inside course form
  const handleAddModule = () => {
    setCourseForm({
      ...courseForm,
      modules: [...courseForm.modules, { title: `Module ${courseForm.modules.length + 1}: `, lessons: [] }]
    });
  };

  const handleRemoveModule = (modIdx) => {
    const updatedMods = [...courseForm.modules];
    updatedMods.splice(modIdx, 1);
    setCourseForm({ ...courseForm, modules: updatedMods });
  };

  const handleModuleTitleChange = (modIdx, val) => {
    const updatedMods = [...courseForm.modules];
    updatedMods[modIdx].title = val;
    setCourseForm({ ...courseForm, modules: updatedMods });
  };

  const handleAddLesson = (modIdx) => {
    const updatedMods = [...courseForm.modules];
    updatedMods[modIdx].lessons = [
      ...updatedMods[modIdx].lessons,
      { title: '', videoUrl: '', duration: '0:00' }
    ];
    setCourseForm({ ...courseForm, modules: updatedMods });
  };

  const handleRemoveLesson = (modIdx, lesIdx) => {
    const updatedMods = [...courseForm.modules];
    updatedMods[modIdx].lessons.splice(lesIdx, 1);
    setCourseForm({ ...courseForm, modules: updatedMods });
  };

  const handleLessonChange = (modIdx, lesIdx, field, val) => {
    const updatedMods = [...courseForm.modules];
    updatedMods[modIdx].lessons[lesIdx][field] = val;
    setCourseForm({ ...courseForm, modules: updatedMods });
  };

  // Submit Course additions/edits
  const handleCourseSubmit = async (e) => {
    e.preventDefault();

    if (!courseForm.title || !courseForm.description || !courseForm.thumbnail) {
      showToast('Please fill out all primary course details', 'error');
      return;
    }

    // Validate that modules/lessons have data
    let isValidCurriculum = true;
    courseForm.modules.forEach(mod => {
      if (!mod.title) isValidCurriculum = false;
      mod.lessons?.forEach(les => {
        if (!les.title || !les.videoUrl) isValidCurriculum = false;
      });
    });

    if (!isValidCurriculum) {
      showToast('Please specify valid titles and streaming paths for all modules and lessons', 'error');
      return;
    }

    try {
      const url = editingCourseId 
        ? `/api/courses/${editingCourseId}`
        : '/api/courses';

      const method = editingCourseId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(courseForm)
      });

      const data = await res.json();

      if (res.ok) {
        showToast(
          editingCourseId ? 'Course specifications modified successfully!' : 'New course successfully created!',
          'success'
        );
        setShowCourseModal(false);
        loadData(); // Refresh everything
      } else {
        showToast(data.message || 'Error saving course data', 'error');
      }
    } catch (err) {
      showToast('Error connecting to backend API', 'error');
    }
  };

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

      <div className="flex justify-between align-center mb-24">
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginTop: '2px' }}>
            Curate course catalogs, manage user authorizations, and monitor earnings.
          </p>
        </div>

        {activeTab === 'courses' && (
          <button 
            onClick={handleOpenAddCourse} 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
          >
            <Plus size={16} />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {/* Tabs list navigation */}
      <div className="tabs">
        <button 
          onClick={() => setActiveTab('stats')} 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
        >
          Overview Statistics
        </button>
        <button 
          onClick={() => setActiveTab('courses')} 
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
        >
          Manage Catalog
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          Manage Users
        </button>
        <button 
          onClick={() => setActiveTab('enrollments')} 
          className={`tab-btn ${activeTab === 'enrollments' ? 'active' : ''}`}
        >
          Completed Enrollments
        </button>
      </div>

      {/* 1. STATS TAB */}
      {activeTab === 'stats' && stats && (
        <div className="flex flex-col gap-24">
          {/* Stats Cards Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            <div className="card" style={{ padding: '24px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '12px', borderRadius: '10px' }}>
                <Users size={24} />
              </div>
              <div>
                <p style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL USERS</p>
                <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.totalUsers}</p>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#fffbeb', color: '#d97706', padding: '12px', borderRadius: '10px' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <p style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL COURSES</p>
                <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.totalCourses}</p>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '12px', borderRadius: '10px' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <p style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL REVENUE</p>
                <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>₹{stats.totalRevenue}</p>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: '#fdf2f8', color: '#db2777', padding: '12px', borderRadius: '10px' }}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <p style={{ color: 'var(--text-light)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL SALES</p>
                <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.totalSalesCount}</p>
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="card" style={{ padding: '24px', backgroundColor: 'white' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: 'var(--text-light)' }} />
              <span>Recent Sales Activity</span>
            </h3>

            {stats.recentEnrollments?.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: '14px', textAlign: 'center', padding: '24px' }}>No sales logged yet.</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Buyer Details</th>
                      <th>Purchased Course</th>
                      <th>Amount Paid</th>
                      <th>Order ID</th>
                      <th>Checkout Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentEnrollments.map((enr) => (
                      <tr key={enr._id}>
                        <td>
                          <p style={{ fontWeight: '600' }}>{enr.userId?.name || 'Deleted Account'}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{enr.userId?.email || 'N/A'}</p>
                        </td>
                        <td style={{ fontWeight: '500' }}>{enr.courseId?.title || 'Deleted Course'}</td>
                        <td style={{ fontWeight: '700', color: 'var(--success)' }}>₹{enr.amount}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>{enr.razorpayOrderId}</td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {new Date(enr.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. COURSES CATALOG TAB */}
      {activeTab === 'courses' && (
        <div className="card" style={{ padding: '24px', backgroundColor: 'white' }}>
          {courses.length === 0 ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <BookOpen size={40} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No courses present. Click "Add Course" above to create one.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Course Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td style={{ width: '100px' }}>
                        <img 
                          src={course.thumbnail} 
                          alt={course.title} 
                          style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                        />
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{course.title}</td>
                      <td>
                        <span className="badge badge-student">{course.category}</span>
                      </td>
                      <td style={{ fontWeight: '700' }}>{course.price === 0 ? 'FREE' : `₹${course.price}`}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleOpenEditCourse(course._id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px', minWidth: '32px' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCourse(course._id)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '6px', minWidth: '32px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. MANAGE USERS TAB */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '24px', backgroundColor: 'white' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Assigned Role</th>
                  <th>Status</th>
                  <th>Enrollments</th>
                  <th>Join Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <p style={{ fontWeight: '600' }}>{u.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.email}</p>
                    </td>
                    <td>
                      <span className={`badge badge-${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      {u.isVerified ? (
                        <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} /> Verified
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '500' }}>Pending</span>
                      )}
                    </td>
                    <td style={{ fontWeight: '600' }}>{u.enrolledCourses?.length || 0}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleUserRole(u._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        disabled={user?._id === u._id} // Prevent demoting yourself
                      >
                        <UserCheck size={14} />
                        <span>Toggle Role</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ENROLLMENTS LOGS TAB */}
      {activeTab === 'enrollments' && (
        <div className="card" style={{ padding: '24px', backgroundColor: 'white' }}>
          {enrollments.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '20px' }}>No transactions recorded.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order Details</th>
                    <th>Buyer Identity</th>
                    <th>Course Title</th>
                    <th>Price Paid</th>
                    <th>Payment Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enr) => (
                    <tr key={enr._id}>
                      <td>
                        <p style={{ fontWeight: '600', fontFamily: 'monospace', fontSize: '13px' }}>{enr.razorpayOrderId}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-light)', fontFamily: 'monospace' }}>
                          Pay ID: {enr.razorpayPaymentId || 'N/A'}
                        </p>
                      </td>
                      <td>
                        <p style={{ fontWeight: '500' }}>{enr.userId?.name || 'Deleted Account'}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{enr.userId?.email || 'N/A'}</p>
                      </td>
                      <td style={{ fontWeight: '500' }}>{enr.courseId?.title || 'Deleted Course'}</td>
                      <td style={{ fontWeight: '700' }}>₹{enr.amount}</td>
                      <td>
                        <span className={`badge`} style={{
                          backgroundColor: enr.status === 'completed' ? 'var(--success-light)' : enr.status === 'pending' ? '#fffbeb' : '#fef2f2',
                          color: enr.status === 'completed' ? 'var(--success-hover)' : enr.status === 'pending' ? '#d97706' : 'var(--danger-hover)'
                        }}>
                          {enr.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {new Date(enr.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. ADD/EDIT COURSE MODAL OVERLAY */}
      {showCourseModal && (
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
          padding: '24px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            boxShadow: 'var(--shadow-lg)',
            animation: 'modalScale 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                {editingCourseId ? 'Edit Course Specifications' : 'Create New Course Catalog'}
              </h3>
              <button 
                onClick={() => setShowCourseModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body Form */}
            <form onSubmit={handleCourseSubmit} style={{ overflowY: 'auto', padding: '24px', flexGrow: 1 }}>
              {/* Primary info details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="cTitle">Course Title</label>
                  <input
                    id="cTitle"
                    type="text"
                    className="form-input"
                    placeholder="Full-Stack Web Development Bootcamp"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cCategory">Course Category</label>
                  <select
                    id="cCategory"
                    className="form-input"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  >
                    {Categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="cPrice">Price (INR)</label>
                  <input
                    id="cPrice"
                    type="number"
                    min={0}
                    className="form-input"
                    placeholder="1999"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cThumb">Thumbnail Image URL</label>
                  <input
                    id="cThumb"
                    type="text"
                    className="form-input"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={courseForm.thumbnail}
                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label className="form-label" htmlFor="cDesc">Course Description</label>
                <textarea
                  id="cDesc"
                  className="form-input"
                  rows={3}
                  placeholder="Provide an overview of what students will accomplish in this course bootcamp..."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              {/* Syllabus builder section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                <div className="flex justify-between align-center mb-24">
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Course Syllabus Curriculum</h4>
                    <p style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '2px' }}>
                      Construct course modules and en-route streaming video lessons.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} />
                    <span>Add Module</span>
                  </button>
                </div>

                {courseForm.modules.length === 0 ? (
                  <p style={{ color: 'var(--text-light)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                    Syllabus empty. Click "Add Module" to start compiling lectures.
                  </p>
                ) : (
                  <div className="flex flex-col gap-24">
                    {courseForm.modules.map((module, mIdx) => (
                      <div key={mIdx} style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '20px',
                        backgroundColor: '#f8fafc'
                      }}>
                        {/* Module header title */}
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                          <input
                            type="text"
                            placeholder="Module Title (e.g. Module 1: Basics)"
                            className="form-input"
                            value={module.title}
                            onChange={(e) => handleModuleTitleChange(mIdx, e.target.value)}
                            style={{ flexGrow: 1, backgroundColor: 'white', fontWeight: '600' }}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveModule(mIdx)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '10px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Module lessons mapping */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '24px' }}>
                          {module.lessons?.map((lesson, lIdx) => (
                            <div key={lIdx} style={{
                              display: 'grid',
                              gridTemplateColumns: '1.5fr 2fr 80px 40px',
                              gap: '10px',
                              alignItems: 'center'
                            }}>
                              <input
                                type="text"
                                placeholder="Lesson Title"
                                className="form-input"
                                value={lesson.title}
                                onChange={(e) => handleLessonChange(mIdx, lIdx, 'title', e.target.value)}
                                style={{ backgroundColor: 'white', fontSize: '13px' }}
                                required
                              />
                              <input
                                type="text"
                                placeholder="Video MP4 Stream URL"
                                className="form-input"
                                value={lesson.videoUrl}
                                onChange={(e) => handleLessonChange(mIdx, lIdx, 'videoUrl', e.target.value)}
                                style={{ backgroundColor: 'white', fontSize: '13px' }}
                                required
                              />
                              <input
                                type="text"
                                placeholder="09:45"
                                className="form-input"
                                value={lesson.duration}
                                onChange={(e) => handleLessonChange(mIdx, lIdx, 'duration', e.target.value)}
                                style={{ backgroundColor: 'white', fontSize: '13px', textAlign: 'center' }}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveLesson(mIdx, lIdx)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--danger)',
                                  display: 'flex',
                                  justifyContent: 'center'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleAddLesson(mIdx)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              alignSelf: 'flex-start',
                              fontSize: '12px',
                              padding: '4px 10px',
                              marginTop: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Plus size={12} />
                            <span>Add Lesson</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{
                marginTop: '32px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '20px',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCourseModal(false)}
                >
                  Cancel Workspace
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                >
                  <Check size={16} />
                  <span>Save Catalog Specifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
