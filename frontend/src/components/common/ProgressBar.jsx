import React from 'react';

const ProgressBar = ({ percentage, label, showLabel = true }) => {
  const percent = Math.min(Math.max(percentage || 0, 0), 100);

  return (
    <div className="progress-bar-container">
      {showLabel && (
        <div className="progress-bar-header">
          <span className="progress-bar-label">{label || 'Profile Completion'}</span>
          <span className="progress-bar-percentage">{percent}%</span>
        </div>
      )}
      <div className="progress-bar-track">
        <div 
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
