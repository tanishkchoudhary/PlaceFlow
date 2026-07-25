import React from 'react';
import { User, Building, Shield, CheckCircle } from 'lucide-react';

const UserRolesSection = () => {
  const roles = [
    {
      id: 'student',
      roleTitle: 'STUDENT',
      badgeText: 'Candidates',
      icon: User,
      accentColor: 'blue',
      points: [
        'Discover eligible jobs',
        'Apply for opportunities',
        'Track applications',
        'Manage profile and resume',
      ],
    },
    {
      id: 'recruiter',
      roleTitle: 'RECRUITER',
      badgeText: 'Hiring Partners',
      icon: Building,
      accentColor: 'purple',
      points: [
        'Post job opportunities',
        'Define eligibility criteria',
        'Review applicants',
        'Manage recruitment stages',
      ],
    },
    {
      id: 'admin',
      roleTitle: 'PLACEMENT ADMIN',
      badgeText: 'TPO & Team',
      icon: Shield,
      accentColor: 'emerald',
      points: [
        'Manage students',
        'Manage recruiters and companies',
        'Monitor job postings',
        'View placement analytics',
      ],
    },
  ];

  return (
    <section className="user-roles-section">
      <div className="user-roles-container">
        <div className="section-header">
          <span className="section-subtitle">Tailored Portals</span>
          <h2 className="section-title">Built for Everyone</h2>
          <p className="section-description">
            Dedicated workflows designed for every stakeholder in the campus placement ecosystem.
          </p>
        </div>

        <div className="user-roles-grid">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div key={role.id} className={`role-card role-card-${role.accentColor}`}>
                <div className="role-card-header">
                  <div className="role-icon-wrapper">
                    <Icon size={24} />
                  </div>
                  <span className="role-badge">{role.badgeText}</span>
                </div>
                <h3 className="role-title">{role.roleTitle}</h3>
                <ul className="role-points-list">
                  {role.points.map((point, index) => (
                    <li key={index} className="role-point-item">
                      <CheckCircle size={16} className="point-icon" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UserRolesSection;
