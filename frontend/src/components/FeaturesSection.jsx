import React from 'react';
import { Compass, ShieldCheck, FileCheck, BarChart3 } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      id: 'discover',
      title: 'Discover Opportunities',
      description: 'Explore internships and job opportunities from companies recruiting from your campus.',
      icon: Compass,
      accent: 'blue',
    },
    {
      id: 'eligibility',
      title: 'Smart Eligibility',
      description: 'Quickly identify opportunities you are eligible for based on academic and placement criteria.',
      icon: ShieldCheck,
      accent: 'emerald',
    },
    {
      id: 'track',
      title: 'Track Applications',
      description: 'Follow your applications from submission through shortlisting, interviews, and final selection.',
      icon: FileCheck,
      accent: 'purple',
    },
    {
      id: 'analytics',
      title: 'Placement Analytics',
      description: 'View useful placement statistics and insights through an interactive dashboard.',
      icon: BarChart3,
      accent: 'amber',
    },
  ];

  return (
    <section className="features-section" id="about">
      <div className="features-container">
        <div className="section-header">
          <span className="section-subtitle">Platform Highlights</span>
          <h2 className="section-title">Everything You Need for Campus Placements</h2>
          <p className="section-description">
            Streamlining campus recruitment for students, recruiters, and placement officers in one unified ecosystem.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="feature-card">
                <div className={`feature-icon-box accent-${feature.accent}`}>
                  <Icon size={26} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
