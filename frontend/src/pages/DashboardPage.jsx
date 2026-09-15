import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Layers,
  LayoutDashboard,
} from 'lucide-react';

const STATUS_CONFIG = [
  { key: 'OPEN',        label: 'Open',        color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',   border: 'rgba(34,211,238,0.25)',  desc: 'Tasks open for taskers' },
  { key: 'ACCEPTED',    label: 'Accepted',    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.25)',  desc: 'Accepted by a tasker' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#fcd34d', bg: 'rgba(252,211,77,0.1)',   border: 'rgba(252,211,77,0.25)',  desc: 'Currently being worked on' },
  { key: 'SUBMITTED',   label: 'Submitted',   color: '#c084fc', bg: 'rgba(192,132,252,0.1)',  border: 'rgba(192,132,252,0.25)', desc: 'Awaiting your review' },
  { key: 'COMPLETED',   label: 'Completed',   color: '#34d399', bg: 'rgba(52,211,153,0.1)',   border: 'rgba(52,211,153,0.25)',  desc: 'Successfully completed' },
  { key: 'CANCELLED',   label: 'Cancelled',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)',  desc: 'Cancelled tasks' },
  { key: 'DISPUTED',    label: 'Disputed',    color: '#fb7185', bg: 'rgba(251,113,133,0.1)',  border: 'rgba(251,113,133,0.25)', desc: 'Under admin review' },
  { key: 'EXPIRED',     label: 'Expired',     color: '#fb923c', bg: 'rgba(251,146,60,0.1)',   border: 'rgba(251,146,60,0.25)',  desc: 'Passed deadline' },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, activeMode, setActiveMode } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin', { replace: true });
  }, [user, navigate]);

  const [postedTasks, setPostedTasks] = useState([]);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(activeMode === 'tasker' ? 'accepted' : 'posted');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    setActiveTab(activeMode === 'tasker' ? 'accepted' : 'posted');
  }, [activeMode]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [postedRes, acceptedRes] = await Promise.all([
          api.get('/tasks/my-posted'),
          api.get('/tasks/my-accepted'),
        ]);
        if (postedRes.data.success) setPostedTasks(postedRes.data.tasks);
        if (acceptedRes.data.success) setAcceptedTasks(acceptedRes.data.tasks);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statusCounts = STATUS_CONFIG.reduce((acc, st) => {
    acc[st.key] = postedTasks.filter((t) => t.status === st.key).length;
    return acc;
  }, {});

  if (loading) return <LoadingSpinner fullPage text="Loading your dashboard..." />;

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* ── Welcome Header ───────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <h1
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: 800,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}
              >
                Welcome,{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, var(--cyan), var(--primary-light))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {user?.name?.split(' ')[0]}
                </span>
              </h1>

              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.28rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: activeMode === 'requester'
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(16, 185, 129, 0.15)',
                  color: activeMode === 'requester' ? 'var(--primary-light)' : 'var(--emerald-light)',
                  border: activeMode === 'requester'
                    ? '1px solid rgba(99, 102, 241, 0.35)'
                    : '1px solid rgba(16, 185, 129, 0.35)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {activeMode === 'requester' ? 'Requester View' : 'Tasker View'}
              </span>
            </div>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem', maxWidth: '520px' }}>
              {activeMode === 'requester'
                ? 'Manage your posted tasks, track progress, and review submitted proof.'
                : 'Browse available tasks, track accepted work, and submit completion proof.'}
            </p>
          </div>

          <div>
            {activeMode === 'requester' ? (
              <Link to="/create-task" className="btn btn-primary">
                <PlusCircle size={17} /> Post New Task
              </Link>
            ) : (
              <Link to="/browse" className="btn btn-cyan">
                <Search size={17} /> Browse Tasks
              </Link>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Tab Navigation ───────────────────────── */}
        <div className="tab-nav">
          <button
            onClick={() => setActiveTab('posted')}
            className={`tab-btn ${activeTab === 'posted' ? 'active-cyan' : ''}`}
          >
            <Layers size={16} />
            My Posted Tasks
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                background: activeTab === 'posted' ? 'rgba(34,211,238,0.15)' : 'rgba(148,163,184,0.1)',
                color: activeTab === 'posted' ? 'var(--cyan)' : 'var(--text-muted)',
              }}
            >
              {postedTasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`tab-btn ${activeTab === 'accepted' ? 'active-emerald' : ''}`}
          >
            <CheckCircle2 size={16} />
            Tasks I'm Fulfilling
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                background: activeTab === 'accepted' ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.1)',
                color: activeTab === 'accepted' ? 'var(--emerald-light)' : 'var(--text-muted)',
              }}
            >
              {acceptedTasks.length}
            </span>
          </button>
        </div>

        {/* ── MY POSTED TASKS ──────────────────────── */}
        {activeTab === 'posted' && (
          <div>
            {/* Status Overview Grid */}
            <div style={{ marginBottom: '2.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-sub)',
                    fontWeight: 700,
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                  }}
                >
                  <LayoutDashboard size={15} color="var(--primary-light)" />
                  Status Overview — {postedTasks.length} Total Posted
                </h3>
                {statusFilter !== 'ALL' && (
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--cyan)',
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    ✕ Clear Filter
                  </button>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))',
                  gap: '0.65rem',
                }}
              >
                {STATUS_CONFIG.map((st) => {
                  const count = statusCounts[st.key] || 0;
                  const isSelected = statusFilter === st.key;
                  return (
                    <div
                      key={st.key}
                      onClick={() => setStatusFilter(isSelected ? 'ALL' : st.key)}
                      className="stat-card"
                      style={{
                        background: isSelected ? st.bg : 'rgba(14,21,40,0.7)',
                        border: isSelected ? `1.5px solid ${st.border}` : '1px solid var(--border-subtle)',
                        boxShadow: isSelected ? `0 0 16px ${st.bg}` : 'none',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 0, left: 0, right: 0,
                          height: '2.5px',
                          background: isSelected ? st.color : 'transparent',
                          borderRadius: 'var(--radius-full) var(--radius-full) 0 0',
                          transition: 'all 0.2s ease',
                        }}
                      />
                      <div
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: isSelected ? st.color : 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          marginBottom: '0.3rem',
                        }}
                      >
                        {st.label}
                      </div>
                      <div
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: 800,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          color: isSelected ? st.color : 'var(--text-main)',
                          lineHeight: 1,
                        }}
                      >
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task Groups */}
            {postedTasks.length === 0 ? (
              <div className="glass-card empty-state">
                <div
                  className="empty-state-icon"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--primary-light)' }}
                >
                  <Layers size={28} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Posted Tasks Yet</h3>
                <p style={{ color: 'var(--text-sub)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  You haven't posted any tasks yet.
                </p>
                {activeMode === 'requester' ? (
                  <Link to="/create-task" className="btn btn-primary btn-sm">
                    <PlusCircle size={15} /> Create Your First Task
                  </Link>
                ) : (
                  <button onClick={() => setActiveMode('requester')} className="btn btn-primary btn-sm">
                    Switch to Requester Mode
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.75rem' }}>
                {STATUS_CONFIG.filter((st) => statusFilter === 'ALL' || statusFilter === st.key).map((st) => {
                  const groupTasks = postedTasks.filter((t) => t.status === st.key);
                  if (statusFilter === 'ALL' && groupTasks.length === 0) return null;

                  return (
                    <div key={st.key}>
                      {/* Group heading */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '1.25rem',
                          paddingBottom: '0.75rem',
                          borderBottom: `1px solid ${st.border}`,
                        }}
                      >
                        <div
                          style={{
                            width: '4px',
                            height: '20px',
                            borderRadius: 'var(--radius-full)',
                            background: st.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            background: st.bg,
                            color: st.color,
                            border: `1px solid ${st.border}`,
                            padding: '0.28rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {st.key} ({groupTasks.length})
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {st.desc}
                        </span>
                      </div>

                      {groupTasks.length === 0 ? (
                        <p style={{ color: 'var(--text-faint)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                          No tasks in {st.label} status.
                        </p>
                      ) : (
                        <div className="grid-3">
                          {groupTasks.map((task) => (
                            <TaskCard key={task._id} task={task} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TASKS I'M FULFILLING ─────────────────── */}
        {activeTab === 'accepted' && (
          <div>
            {acceptedTasks.length === 0 ? (
              <div className="glass-card empty-state">
                <div
                  className="empty-state-icon"
                  style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', color: 'var(--cyan)' }}
                >
                  <Search size={28} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Active Task Assignments</h3>
                <p style={{ color: 'var(--text-sub)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  You haven't accepted any tasks to fulfill yet.
                </p>
                <Link to="/browse" className="btn btn-cyan btn-sm">
                  <Search size={15} /> Browse Open Tasks
                </Link>
              </div>
            ) : (
              <div className="grid-3">
                {acceptedTasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
