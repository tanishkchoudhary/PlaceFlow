import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand">
              <div className="brand-icon-wrapper">
                <GraduationCap className="brand-logo-icon" size={22} />
              </div>
              <span className="brand-logo-text">
                Place<span className="brand-accent">Flow</span>
              </span>
            </Link>
            <p className="footer-tagline">
              Making campus placements simpler, smarter, and more transparent.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="footer-nav-col">
            <h4 className="footer-col-heading">Quick Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/#jobs">Jobs</Link></li>
              <li><Link to="/#about">About</Link></li>
            </ul>
          </div>

          {/* For Students Column */}
          <div className="footer-nav-col">
            <h4 className="footer-col-heading">For Students</h4>
            <ul className="footer-links-list">
              <li><Link to="/#jobs">Find Jobs</Link></li>
              <li><Link to="/#applications">Applications</Link></li>
              <li><Link to="/#profile">Profile</Link></li>
            </ul>
          </div>

          {/* For Recruiters Column */}
          <div className="footer-nav-col">
            <h4 className="footer-col-heading">For Recruiters</h4>
            <ul className="footer-links-list">
              <li><Link to="/#post-job">Post a Job</Link></li>
              <li><Link to="/#applicants">Applicants</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 PlaceFlow. College Placement & Recruitment Management System.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
