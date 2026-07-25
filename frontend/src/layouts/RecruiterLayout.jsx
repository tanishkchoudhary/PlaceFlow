import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Briefcase, PlusCircle, Building2, LogOut, Menu, X, Sparkles, UserCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RecruiterLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'My Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Post a Job', path: '/recruiter/jobs/create', icon: PlusCircle },
    { label: 'Company Profile', path: '/recruiter/profile', icon: Building2 },
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
          <span className="role-tag recruiter">Recruiter Portal</span>
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
            <div className="avatar-circle recruiter">
              {user?.recruiter_profile?.full_name?.charAt(0) || 'R'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.recruiter_profile?.full_name || 'Recruiter'}</p>
              <p className="user-email">{user?.recruiter_profile?.company_name || user?.email}</p>
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

export default RecruiterLayout;
