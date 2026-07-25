import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <GraduationCap className="brand-logo-icon" size={24} />
          </div>
          <span className="brand-logo-text">
            Place<span className="brand-accent">Flow</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar-nav desktop-nav">
          <Link to="/" className="nav-link active">Home</Link>
          <Link to="/#jobs" className="nav-link">Jobs</Link>
          <Link to="/#about" className="nav-link">About</Link>
          <Link to="/login" className="nav-link nav-link-login">Login</Link>
          <Link to="/register" className="btn btn-primary nav-btn-register">Register</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-dropdown">
          <Link to="/" className="mobile-nav-link" onClick={toggleMobileMenu}>Home</Link>
          <Link to="/#jobs" className="mobile-nav-link" onClick={toggleMobileMenu}>Jobs</Link>
          <Link to="/#about" className="mobile-nav-link" onClick={toggleMobileMenu}>About</Link>
          <Link to="/login" className="mobile-nav-link" onClick={toggleMobileMenu}>Login</Link>
          <Link to="/register" className="btn btn-primary mobile-btn-register" onClick={toggleMobileMenu}>Register</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
