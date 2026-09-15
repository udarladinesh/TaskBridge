import React from 'react';

const PULSE_STATUSES = new Set(['OPEN', 'IN_PROGRESS']);

const TaskStatusBadge = ({ status }) => {
  const key = status || 'OPEN';
  const formattedStatus = key.replace(/_/g, ' ');
  const badgeClass = `status-badge badge-${key.toLowerCase()}`;
  const showPulse = PULSE_STATUSES.has(key);

  return (
    <span className={badgeClass}>
      {showPulse ? (
        <span className="pulse-dot" />
      ) : (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'currentColor',
            opacity: 0.7,
            flexShrink: 0,
          }}
        />
      )}
      {formattedStatus}
    </span>
  );
};

export default TaskStatusBadge;
