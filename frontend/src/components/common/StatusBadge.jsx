import React from 'react';

const StatusBadge = ({ status }) => {
  const normalizedStatus = status ? status.toLowerCase() : 'unknown';
  
  let label = status;
  if (status === 'IN_PROGRESS') {
    label = 'In Progress';
  } else if (status) {
    label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  const badgeClass = `badge badge-${normalizedStatus.replace('_', '')}`;
  
  return (
    <span className={badgeClass}>
      {label}
    </span>
  );
};

export default StatusBadge;
