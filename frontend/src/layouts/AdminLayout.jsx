import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserCheck, Building2, Briefcase, FileText, BarChart3, LogOut, Menu, X, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Recruiters', path: '/admin/recruiters', icon: UserCheck },
    { label: 'Companies', path: '/admin/companies', icon: Building2 },
    { label: 'Jobs', path: '/admin/jobs', icon: Briefcase },
    { label: 'Applications', path: '/admin/applications', icon: FileText },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="portal-container">
      {/* Mobile Header */}
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
          <span className="role-tag admin">Placement Admin</span>
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
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-card">
            <div className="avatar-circle admin">
              A
            </div>
            <div className="user-details">
              <p className="user-name">Placement Admin</p>
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

export default AdminLayout;
