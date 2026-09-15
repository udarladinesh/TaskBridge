import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, MapPin, RefreshCw, AlertCircle, Repeat, SlidersHorizontal } from 'lucide-react';

const BrowseTasksPage = () => {
  const { user, activeMode, setActiveMode } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [rewardRange, setRewardRange] = useState('Any');
  const [statusFilter, setStatusFilter] = useState('OPEN');

  const fetchTasks = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (q) params.q = q;
      if (category && category !== 'All') params.category = category;
      if (stateFilter) params.state = stateFilter;
      if (cityFilter) params.city = cityFilter;
      if (statusFilter) params.status = statusFilter;

      if (rewardRange === '0-250')   { params.minReward = 0;    params.maxReward = 250;  }
      else if (rewardRange === '250-500')  { params.minReward = 250;  params.maxReward = 500;  }
      else if (rewardRange === '500-1000') { params.minReward = 500;  params.maxReward = 1000; }
      else if (rewardRange === '1000+')    { params.minReward = 1000; }

      const res = await api.get('/tasks', { params });
      if (res.data.success) setTasks(res.data.tasks);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [category, statusFilter, rewardRange]);

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchTasks(); };

  const handleResetFilters = () => {
    setQ(''); setCategory('All'); setStateFilter('');
    setCityFilter(''); setRewardRange('Any'); setStatusFilter('OPEN');
    fetchTasks();
  };

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* ── Header ─────────────────────────────── */}
        <div className="page-header">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--cyan)',
              marginBottom: '0.6rem',
            }}
          >
            <Search size={13} /> Browse
          </div>
          <h1>
            Verification &amp; Assistance Tasks
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
            Filter open requests by category, reward range, state, and city.
          </p>
        </div>

        {/* ── Mode Banner ─────────────────────────── */}
        {user && user.role !== 'admin' && activeMode === 'requester' && (
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderLeft: '3px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1rem' }}>💡</span>
              <div>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>
                  You are browsing in Requester Mode.
                </span>
                <p style={{ margin: '0.1rem 0 0', color: 'var(--text-sub)', fontSize: '0.8rem' }}>
                  Accepting tasks requires switching to Tasker Mode.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveMode('tasker')}
              className="btn btn-cyan btn-sm"
            >
              <Repeat size={13} /> Switch to Tasker Mode
            </button>
          </div>
        )}

        {/* ── Filter Panel ────────────────────────── */}
        <div
          className="glass-card"
          style={{ marginBottom: '2rem', borderTop: '2px solid rgba(99,102,241,0.3)' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.1rem',
              color: 'var(--text-sub)',
              fontSize: '0.825rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <SlidersHorizontal size={14} color="var(--primary-light)" /> Filter Tasks
          </div>

          <form onSubmit={handleSearchSubmit}>
            {/* Search Bar */}
            <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute', left: '12px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Search by title, city, or locality…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                <Search size={15} /> Search
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary btn-sm"
                title="Reset Filters"
                style={{ flexShrink: 0 }}
              >
                <RefreshCw size={14} /> Reset
              </button>
            </div>

            {/* Filter Dropdowns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.85rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="All">All Categories</option>
                  <option value="verification">Verification</option>
                  <option value="photo_collection">Photo Collection</option>
                  <option value="information_collection">Info Collection</option>
                  <option value="pickup">Pickup</option>
                  <option value="local_assistance">Local Assistance</option>
                  <option value="inspection">Inspection</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Andhra Pradesh"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  onBlur={fetchTasks}
                />
              </div>

              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Vijayawada"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  onBlur={fetchTasks}
                />
              </div>

              {user?.role !== 'admin' && (
                <div>
                  <label className="form-label">Reward Range</label>
                  <select className="form-select" value={rewardRange} onChange={(e) => setRewardRange(e.target.value)}>
                    <option value="Any">Any Reward</option>
                    <option value="0-250">₹0 – ₹250</option>
                    <option value="250-500">₹250 – ₹500</option>
                    <option value="500-1000">₹500 – ₹1000</option>
                    <option value="1000+">₹1000+</option>
                  </select>
                </div>
              )}

              <div>
                <label className="form-label">Status</label>
                <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="OPEN">OPEN Only</option>
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="DISPUTED">DISPUTED</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* ── Error ───────────────────────────────── */}
        {error && (
          <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Results ─────────────────────────────── */}
        {loading ? (
          <LoadingSpinner text="Searching tasks..." />
        ) : tasks.length === 0 ? (
          <div className="glass-card empty-state">
            <div
              className="empty-state-icon"
              style={{
                background: 'rgba(100,116,139,0.1)',
                border: '1px solid rgba(100,116,139,0.2)',
                color: 'var(--text-muted)',
              }}
            >
              <MapPin size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Tasks Found</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', maxWidth: '360px', marginBottom: '1.25rem' }}>
              No tasks match your current filters. Try clearing them to see all available tasks.
            </p>
            <button onClick={handleResetFilters} className="btn btn-secondary">
              <RefreshCw size={15} /> Reset Filters
            </button>
          </div>
        ) : (
          <div>
            <div
              style={{
                marginBottom: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '0.28rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(34,211,238,0.1)',
                  color: 'var(--cyan)',
                  border: '1px solid rgba(34,211,238,0.2)',
                }}
              >
                {tasks.length} tasks found
              </span>
            </div>
            <div className="grid-3">
              {tasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseTasksPage;
