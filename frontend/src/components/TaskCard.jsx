import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Camera, ArrowRight } from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';

/* Category accent colors */
const CATEGORY_COLORS = {
  verification:           { color: 'var(--cyan)',         bg: 'rgba(34,211,238,0.1)',   border: 'rgba(34,211,238,0.2)'   },
  photo_collection:       { color: 'var(--purple-light)', bg: 'rgba(168,85,247,0.1)',   border: 'rgba(168,85,247,0.2)'   },
  information_collection: { color: 'var(--primary-light)',bg: 'rgba(99,102,241,0.1)',   border: 'rgba(99,102,241,0.2)'   },
  pickup:                 { color: 'var(--amber-light)',  bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)'   },
  local_assistance:       { color: 'var(--emerald-light)',bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.2)'   },
  inspection:             { color: 'var(--rose-light)',   bg: 'rgba(244,63,94,0.1)',    border: 'rgba(244,63,94,0.2)'    },
  other:                  { color: 'var(--text-sub)',     bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)'  },
};

/* Status top-border accent colors */
const STATUS_ACCENT = {
  OPEN:        'var(--emerald)',
  ACCEPTED:    'var(--cyan)',
  IN_PROGRESS: 'var(--amber)',
  SUBMITTED:   'var(--purple)',
  COMPLETED:   'var(--emerald)',
  DISPUTED:    'var(--rose)',
  CANCELLED:   'var(--text-muted)',
  EXPIRED:     'var(--orange)',
};

const TaskCard = ({ task }) => {
  const { user } = useAuth();
  const { _id, title, category, location, rewardAmount, deadline, proofRequirement, status, requester } = task;

  const cat = category?.toLowerCase().replace(/ /g, '_') || 'other';
  const catStyle = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
  const statusAccent = STATUS_ACCENT[status] || 'var(--border-card)';

  const formattedCategory = category
    ? category.replace(/_/g, ' ')
    : 'General';

  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '0',
        overflow: 'hidden',
      }}
    >
      {/* Colored status accent line */}
      <div
        style={{
          height: '3px',
          background: `linear-gradient(90deg, ${statusAccent}, transparent)`,
          flexShrink: 0,
        }}
      />

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header row: category chip + status badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: catStyle.color,
              background: catStyle.bg,
              border: `1px solid ${catStyle.border}`,
              padding: '0.22rem 0.65rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {formattedCategory}
          </span>
          <TaskStatusBadge status={status} />
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            lineHeight: '1.4',
            marginBottom: '0.9rem',
            color: 'var(--text-main)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            flex: 1,
          }}
        >
          {title}
        </h3>

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            marginBottom: '1.1rem',
            fontSize: '0.835rem',
            color: 'var(--text-sub)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <MapPin size={13} color="var(--primary-light)" />
            <span>{location?.city}{location?.locality ? `, ${location.locality}` : ''}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Clock size={13} color="var(--amber)" />
            <span>Due: {formatDeadline(deadline)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Camera size={13} color="var(--purple-light)" />
            <span>Proof: {proofRequirement?.replace(/_/g, ' ') || 'N/A'}</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
          }}
        >
          {user?.role !== 'admin' ? (
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
                Reward
              </span>
              <span
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: 'linear-gradient(135deg, var(--emerald-light), var(--emerald))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ₹{rewardAmount?.toLocaleString('en-IN') ?? 0}
              </span>
            </div>
          ) : (
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>
                Task ID
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-sub)', fontFamily: 'monospace' }}>
                #{_id.substring(_id.length - 6).toUpperCase()}
              </span>
            </div>
          )}

          <Link
            to={`/tasks/${_id}`}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.35rem' }}
          >
            View <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
