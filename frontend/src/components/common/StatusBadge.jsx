import React from 'react';

const StatusBadge = ({ status }) => {
  let badgeClass = 'status-badge-default';
  
  switch (status?.toLowerCase()) {
    case 'applied':
      badgeClass = 'status-applied';
      break;
    case 'under review':
      badgeClass = 'status-review';
      break;
    case 'shortlisted':
      badgeClass = 'status-shortlisted';
      break;
    case 'interview':
      badgeClass = 'status-interview';
      break;
    case 'selected':
      badgeClass = 'status-selected';
      break;
    case 'rejected':
      badgeClass = 'status-rejected';
      break;
    case 'active':
    case 'approved':
      badgeClass = 'status-active';
      break;
    case 'closed':
    case 'pending':
      badgeClass = 'status-pending';
      break;
    default:
      badgeClass = 'status-default';
  }

  return (
    <span className={`status-badge ${badgeClass}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
