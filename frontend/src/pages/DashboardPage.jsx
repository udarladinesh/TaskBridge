import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  Search,
  Filter,
  Layers,
  Repeat
} from 'lucide-react';

const STATUS_CONFIG = [
  { key: 'OPEN', label: 'Open', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)', desc: 'Tasks currently open for taskers' },
  { key: 'ACCEPTED', label: 'Accepted', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', border: 'rgba(96, 165, 250, 0.3)', desc: 'Tasks accepted by a tasker' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', desc: 'Tasks currently being worked on' },
  { key: 'SUBMITTED', label: 'Submitted', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.12)', border: 'rgba(192, 132, 252, 0.3)', desc: 'Tasks waiting for requester review' },
  { key: 'COMPLETED', label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', desc: 'Successfully completed tasks' },
  { key: 'CANCELLED', label: 'Cancelled', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)', desc: 'Cancelled tasks' },
  { key: 'DISPUTED', label: 'Disputed', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.3)', desc: 'Disputed tasks under review' },
  { key: 'EXPIRED', label: 'Expired', color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.3)', desc: 'Expired tasks past deadline' }
];

const DashboardPage = () => {
  const { user, activeMode, setActiveMode } = useAuth();
  const [postedTasks, setPostedTasks] = useState([]);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(activeMode === 'tasker' ? 'accepted' : 'posted');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' or specific status key

  useEffect(() => {
    setActiveTab(activeMode === 'tasker' ? 'accepted' : 'posted');
  }, [activeMode]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [postedRes, acceptedRes] = await Promise.all([
          api.get('/tasks/my-posted'),
          api.get('/tasks/my-accepted')
        ]);

        if (postedRes.data.success) {
          setPostedTasks(postedRes.data.tasks);
        }
        if (acceptedRes.data.success) {
          setAcceptedTasks(acceptedRes.data.tasks);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate counts for all 8 statuses from actual database response
  const statusCounts = STATUS_CONFIG.reduce((acc, status) => {
    acc[status.key] = postedTasks.filter((t) => t.status === status.key).length;
    return acc;
  }, {});

  if (loading) {
    return <LoadingSpinner fullPage text="Loading your dashboard..." />;
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Welcome Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.8rem', margin: 0 }}>
                Welcome, <span style={{ color: 'var(--cyan)' }}>{user?.name}</span>
              </h1>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '12px',
                  background: activeMode === 'requester' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: activeMode === 'requester' ? 'var(--primary-light)' : 'var(--emerald)',
                  border: activeMode === 'requester' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)'
                }}
              >
                {activeMode === 'requester' ? 'Requester View' : 'Tasker View'}
              </span>
            </div>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem' }}>
              {activeMode === 'requester'
                ? 'Manage your posted tasks, track progress across all statuses, and review submitted proof.'
                : 'Browse available tasks, track accepted work, and submit task completion proof.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {activeMode === 'requester' ? (
              <Link to="/create-task" className="btn btn-primary">
                <PlusCircle size={18} /> Post New Task
              </Link>
            ) : (
              <Link to="/browse" className="btn btn-cyan">
                <Search size={18} /> Browse Open Tasks
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--rose)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('posted')}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'posted' ? '2px solid var(--cyan)' : '2px solid transparent',
              color: activeTab === 'posted' ? 'var(--cyan)' : 'var(--text-sub)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            My Posted Tasks ({postedTasks.length})
          </button>

          <button
            onClick={() => setActiveTab('accepted')}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'accepted' ? '2px solid var(--emerald)' : '2px solid transparent',
              color: activeTab === 'accepted' ? 'var(--emerald)' : 'var(--text-sub)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Tasks I'm Fulfilling ({acceptedTasks.length})
          </button>
        </div>

        {/* MY POSTED TASKS VIEW */}
        {activeTab === 'posted' && (
          <div>
            {/* Status Counts Bar (All 8 Statuses) */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={18} color="var(--cyan)" /> Task Status Overview ({postedTasks.length} Total Posted)
                </h3>
                {statusFilter !== 'ALL' && (
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    style={{ background: 'none', border: 'none', color: 'var(--cyan)', fontSize: '0.825rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Clear Filter (Show All)
                  </button>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '0.75rem'
                }}
              >
                {STATUS_CONFIG.map((st) => {
                  const count = statusCounts[st.key] || 0;
                  const isSelected = statusFilter === st.key;
                  return (
                    <div
                      key={st.key}
                      onClick={() => setStatusFilter(isSelected ? 'ALL' : st.key)}
                      style={{
                        background: isSelected ? st.bg : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? `2px solid ${st.color}` : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.85rem 1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: st.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {st.label}
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Categorized/Grouped Posted Tasks List */}
            {postedTasks.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <p style={{ color: 'var(--text-sub)', marginBottom: '1rem' }}>You haven't posted any tasks yet.</p>
                {activeMode === 'requester' ? (
                  <Link to="/create-task" className="btn btn-primary btn-sm">
                    Create Your First Task
                  </Link>
                ) : (
                  <button onClick={() => setActiveMode('requester')} className="btn btn-primary btn-sm">
                    Switch to Requester Mode to Post Task
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {STATUS_CONFIG.filter((st) => statusFilter === 'ALL' || statusFilter === st.key).map((st) => {
                  const groupTasks = postedTasks.filter((t) => t.status === st.key);
                  if (statusFilter === 'ALL' && groupTasks.length === 0) return null;

                  return (
                    <div key={st.key} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '1.25rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span
                            style={{
                              background: st.bg,
                              color: st.color,
                              border: `1px solid ${st.border}`,
                              padding: '0.3rem 0.75rem',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              letterSpacing: '0.05em'
                            }}
                          >
                            {st.key} ({groupTasks.length})
                          </span>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>
                            {st.desc}
                          </span>
                        </div>
                      </div>

                      {groupTasks.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', italic: 'true' }}>
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

        {/* TASKS I'M FULFILLING (TASKER TAB) */}
        {activeTab === 'accepted' && (
          <div>
            {acceptedTasks.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <p style={{ color: 'var(--text-sub)', marginBottom: '1rem' }}>You haven't accepted any tasks to fulfill yet.</p>
                <Link to="/browse" className="btn btn-cyan btn-sm">
                  Browse Open Tasks
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

