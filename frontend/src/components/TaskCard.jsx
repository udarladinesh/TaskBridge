import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Camera, ArrowRight, User } from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';

const TaskCard = ({ task }) => {
  const {
    _id,
    title,
    category,
    location,
    rewardAmount,
    currency,
    deadline,
    proofRequirement,
    status,
    requester
  } = task;

  const formattedCategory = category
    ? category.replace('_', ' ').toUpperCase()
    : 'GENERAL';

  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        height: '100%'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <span
            style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--cyan)',
              background: 'rgba(6, 182, 212, 0.1)',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px'
            }}
          >
            {formattedCategory}
          </span>
          <TaskStatusBadge status={status} />
        </div>

        <h3
          style={{
            fontSize: '1.1rem',
            lineHeight: '1.4',
            marginBottom: '0.75rem',
            color: 'var(--text-main)'
          }}
        >
          {title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--text-sub)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} color="var(--primary)" />
            <span>
              {location?.city}, {location?.locality}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} color="var(--amber)" />
            <span>Deadline: {formatDeadline(deadline)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Camera size={16} color="var(--purple)" />
            <span>Proof: {proofRequirement?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto'
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>REWARD</span>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--emerald)' }}>
            ₹{rewardAmount}
          </span>
        </div>

        <Link to={`/tasks/${_id}`} className="btn btn-secondary btn-sm">
          View Task <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default TaskCard;
