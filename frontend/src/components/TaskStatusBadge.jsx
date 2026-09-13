import React from 'react';

const TaskStatusBadge = ({ status }) => {
  const formattedStatus = status ? status.replace('_', ' ') : 'OPEN';
  const badgeClass = `status-badge badge-${status ? status.toLowerCase() : 'open'}`;

  return (
    <span className={badgeClass}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {formattedStatus}
    </span>
  );
};

export default TaskStatusBadge;
