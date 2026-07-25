import React from 'react';
import { Users, Building2, Briefcase, TrendingUp } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      id: 'students',
      value: '500+',
      label: 'Students Enrolled',
      icon: Users,
      color: 'blue',
    },
    {
      id: 'companies',
      value: '50+',
      label: 'Partner Companies',
      icon: Building2,
      color: 'purple',
    },
    {
      id: 'opportunities',
      value: '100+',
      label: 'Opportunities Posted',
      icon: Briefcase,
      color: 'cyan',
    },
    {
      id: 'placement-rate',
      value: '85%',
      label: 'Placement Rate',
      icon: TrendingUp,
      color: 'emerald',
    },
  ];

  return (
    <section className="stats-section">
      <div className="stats-container">
        <div className="stats-grid">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.id} className="stat-card">
                <div className={`stat-icon-wrapper icon-${stat.color}`}>
                  <IconComponent size={28} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
