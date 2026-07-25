import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LogIn, CheckCircle2, Building2, UserCheck, Briefcase } from 'lucide-react';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Left Column - Copy */}
        <div className="hero-content">
          <div className="hero-pill">
            <span className="pill-dot"></span>
            Campus Placement Portal 2026
          </div>
          <h1 className="hero-title">
            Launch Your Career With <span className="title-gradient">PlaceFlow</span>
          </h1>
          <p className="hero-description">
            A centralized platform connecting students, recruiters, and placement teams for a smarter campus recruitment experience.
          </p>

          <div className="hero-actions">
            <Link to="/#jobs" className="btn btn-primary btn-hero">
              Explore Opportunities
              <ArrowRight size={18} />
            </Link>
            <Link to="/login?role=student" className="btn btn-secondary btn-hero">
              <LogIn size={18} />
              Student Login
            </Link>
          </div>

          <div className="hero-trust-badges">
            <div className="trust-item">
              <CheckCircle2 size={16} className="trust-icon" />
              <span>Direct Campus Hiring</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="trust-icon" />
              <span>Automated Eligibility</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="trust-icon" />
              <span>Real-Time Updates</span>
            </div>
          </div>
        </div>

        {/* Right Column - Visual Graphic UI Stack */}
        <div className="hero-visual">
          <div className="visual-card-stack">
            {/* Main Mock Card */}
            <div className="mock-card main-dashboard-mock">
              <div className="mock-header">
                <div className="mock-dots">
                  <span></span><span></span><span></span>
                </div>
                <span className="mock-header-title">Placement Activity Feed</span>
              </div>
              <div className="mock-body">
                <div className="activity-item">
                  <div className="activity-icon bg-blue">
                    <Building2 size={18} />
                  </div>
                  <div className="activity-details">
                    <h4>TechCorp Solutions</h4>
                    <p>Software Engineer (SDE-1) • ₹14 LPA</p>
                  </div>
                  <span className="badge badge-success">Shortlisted</span>
                </div>

                <div className="activity-item">
                  <div className="activity-icon bg-purple">
                    <Briefcase size={18} />
                  </div>
                  <div className="activity-details">
                    <h4>CloudDynamics</h4>
                    <p>DevOps Intern • Stipend ₹45k/mo</p>
                  </div>
                  <span className="badge badge-info">Interview Scheduled</span>
                </div>

                <div className="activity-item">
                  <div className="activity-icon bg-emerald">
                    <UserCheck size={18} />
                  </div>
                  <div className="activity-details">
                    <h4>InnovateX Labs</h4>
                    <p>Frontend Developer • ₹12 LPA</p>
                  </div>
                  <span className="badge badge-success">Offer Released</span>
                </div>
              </div>
            </div>

            {/* Floating Metric Badge 1 */}
            <div className="floating-badge badge-top-right">
              <div className="floating-icon">🎯</div>
              <div>
                <div className="floating-val">98% Match</div>
                <div className="floating-label">Eligibility Verified</div>
              </div>
            </div>

            {/* Floating Metric Badge 2 */}
            <div className="floating-badge badge-bottom-left">
              <div className="floating-icon">🚀</div>
              <div>
                <div className="floating-val">Direct Referral</div>
                <div className="floating-label">Verified Campus Partner</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
