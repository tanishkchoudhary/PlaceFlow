import React from 'react';
import { User, Building, Shield } from 'lucide-react';

const roleDetails = {
  student: {
    label: 'Student',
    icon: User,
    color: 'blue',
  },
  recruiter: {
    label: 'Recruiter',
    icon: Building,
    color: 'purple',
  },
  admin: {
    label: 'Placement Admin',
    icon: Shield,
    color: 'emerald',
  },
};

const RoleSelector = ({ roles = ['student', 'recruiter', 'admin'], selectedRole, onSelectRole }) => {
  return (
    <div className="role-selector-container">
      <label className="role-selector-label">Select Your Role</label>
      <div className={`role-selector-grid grid-cols-${roles.length}`}>
        {roles.map((roleKey) => {
          const config = roleDetails[roleKey];
          if (!config) return null;
          const Icon = config.icon;
          const isSelected = selectedRole === roleKey;

          return (
            <button
              key={roleKey}
              type="button"
              className={`role-select-btn ${isSelected ? 'active' : ''} role-btn-${config.color}`}
              onClick={() => onSelectRole(roleKey)}
            >
              <Icon size={18} className="role-btn-icon" />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
