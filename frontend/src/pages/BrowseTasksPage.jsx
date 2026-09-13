import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, MapPin, RefreshCw, AlertCircle, Repeat } from 'lucide-react';

const BrowseTasksPage = () => {
  const { user, activeMode, setActiveMode } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
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

      if (rewardRange === '0-250') {
        params.minReward = 0;
        params.maxReward = 250;
      } else if (rewardRange === '250-500') {
        params.minReward = 250;
        params.maxReward = 500;
      } else if (rewardRange === '500-1000') {
        params.minReward = 500;
        params.maxReward = 1000;
      } else if (rewardRange === '1000+') {
        params.minReward = 1000;
      }

      const res = await api.get('/tasks', { params });
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [category, statusFilter, rewardRange]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
  };

  const handleResetFilters = () => {
    setQ('');
    setCategory('All');
    setStateFilter('');
    setCityFilter('');
    setRewardRange('Any');
    setStatusFilter('OPEN');
    fetchTasks();
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            Browse Verification & Assistance Tasks
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem' }}>
            Filter open requests by category, reward range, state, and city locality.
          </p>
        </div>

        {/* Mode Notification Banner if viewing in Requester Mode */}
        {user && activeMode === 'requester' && (
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.1rem' }}>💡</span>
              <div>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>
                  You are browsing in Requester Mode.
                </span>
                <p style={{ margin: '0.1rem 0 0', color: 'var(--text-sub)', fontSize: '0.8rem' }}>
                  Accepting tasks, starting work, and submitting proof requires switching to Tasker Mode.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveMode('tasker')}
              className="btn btn-cyan btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Repeat size={14} /> Switch to Tasker Mode
            </button>
          </div>
        )}

        {/* Search Bar & Filters Form */}
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleSearchSubmit}>
            {/* Main Search Input */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Search by title, description, city, or locality (e.g. Vijayawada, Benz Circle)..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-cyan">
                Search
              </button>
              <button type="button" onClick={handleResetFilters} className="btn btn-secondary btn-sm" title="Reset Filters">
                <RefreshCw size={16} /> Reset
              </button>
            </div>

            {/* Filter Dropdowns Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem'
              }}
            >
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Category</label>
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
                <label className="form-label" style={{ fontSize: '0.8rem' }}>State</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter state (e.g. Andhra Pradesh)"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  onBlur={fetchTasks}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>City</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter city (e.g. Vijayawada)"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  onBlur={fetchTasks}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Reward Range</label>
                <select className="form-select" value={rewardRange} onChange={(e) => setRewardRange(e.target.value)}>
                  <option value="Any">Any Reward</option>
                  <option value="0-250">₹0 – ₹250</option>
                  <option value="250-500">₹250 – ₹500</option>
                  <option value="500-1000">₹500 – ₹1000</option>
                  <option value="1000+">₹1000+</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Status</label>
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

        {/* Results Counter & Loading State */}
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

        {loading ? (
          <LoadingSpinner text="Searching tasks..." />
        ) : tasks.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <MapPin size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Tasks Found</h3>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              No tasks match your current search query or filter parameters. Try clearing your filters.
            </p>
            <button onClick={handleResetFilters} className="btn btn-secondary">
              Reset Filters
            </button>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem', color: 'var(--text-sub)', fontSize: '0.875rem' }}>
              Showing <strong>{tasks.length}</strong> available tasks
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
