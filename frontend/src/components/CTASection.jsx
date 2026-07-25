import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <div className="cta-card">
          <div className="cta-glow"></div>
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Placement Journey?</h2>
            <p className="cta-description">
              Connect with top hiring companies and accelerate your career path with PlaceFlow today.
            </p>
            <div className="cta-actions">
              <Link to="/#jobs" className="btn btn-primary btn-cta">
                Explore Jobs
                <ArrowRight size={18} />
              </Link>
              <Link to="/#register" className="btn btn-secondary btn-cta">
                <UserPlus size={18} />
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
