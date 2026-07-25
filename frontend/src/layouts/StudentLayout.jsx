import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, User, Briefcase, FileText, Bell, LogOut, Menu, X, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const notifs = await notificationService.getNotifications();
        const unread = notifs.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Failed to load notifications count:', err);
      }
    };
    fetchUnread();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/student/profile', icon: User },
    { label: 'Find Jobs', path: '/student/jobs', icon: Briefcase },
    { label: 'My Applications', path: '/student/applications', icon: FileText },
    { 
      label: 'Notifications', 
      path: '/student/notifications', 
      icon: Bell, 
      badge: unreadCount > 0 ? unreadCount : null 
    },
  ];

  return (
    <div className="portal-container">
      {/* Mobile Header Bar */}
      <header className="portal-mobile-header">
        <div className="portal-brand">
          <Sparkles size={24} className="brand-icon" />
          <span className="brand-text">Place<span className="gradient-text">Flow</span></span>
        </div>
        <button 
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`portal-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="portal-brand">
            <Sparkles size={28} className="brand-icon" />
            <span className="brand-text">Place<span className="gradient-text">Flow</span></span>
          </div>
          <span className="role-tag student">Student Portal</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-card">
            <div className="avatar-circle">
              {user?.student_profile?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.student_profile?.full_name || 'Student'}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
