import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, CheckCircle2, ShieldCheck, Award } from 'lucide-react';

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="auth-page-wrapper">
      {/* Background Decorative Glow */}
      <div className="auth-bg-glow"></div>

      <div className="auth-container">
        {/* Left Side: Brand Showcase (Desktop) */}
        <div className="auth-brand-panel">
          <Link to="/" className="auth-brand-logo">
            <div className="brand-icon-wrapper">
              <GraduationCap className="brand-logo-icon" size={26} />
            </div>
            <span className="brand-logo-text">
              Place<span className="brand-accent">Flow</span>
            </span>
          </Link>

          <div className="auth-hero-copy">
            <h2 className="auth-brand-title">
              Empowering Campus Recruitment & Careers
            </h2>
            <p className="auth-brand-subtitle">
              Join thousands of students, top hiring recruiters, and placement officers on India's smart placement ecosystem.
            </p>
          </div>

          {/* Value Highlights */}
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4>Verified Job Opportunities</h4>
                <p>Direct campus listings from verified hiring partners.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4>Automated Eligibility Check</h4>
                <p>Smart filters based on academic criteria and CGPA.</p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <Award size={18} />
              </div>
              <div>
                <h4>Real-Time Application Status</h4>
                <p>Track shortlisting, interview schedules, and offer letters.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="auth-form-panel">
          <div className="auth-card">
            {/* Header with mobile logo fallback */}
            <div className="auth-card-header">
              <Link to="/" className="auth-mobile-logo">
                <div className="brand-icon-wrapper sm">
                  <GraduationCap size={20} />
                </div>
                <span>Place<strong className="brand-accent">Flow</strong></span>
              </Link>

              <h1 className="auth-card-title">{title}</h1>
              {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
            </div>

            {/* Form Content */}
            <div className="auth-card-body">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
