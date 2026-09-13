import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskStatusBadge from '../components/TaskStatusBadge';
import { getAvatarUrl } from '../utils/avatar';
import {
  Users,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  UserCheck,
  UserX,
  AlertCircle,
  ThumbsUp,
  XCircle
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'disputes' | 'reports'
  const [resolvingId, setResolvingId] = useState(null);
  const [resolveSuccess, setResolveSuccess] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, disputesRes, reportsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/disputes'),
        api.get('/admin/reports')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (disputesRes.data.success) setDisputes(disputesRes.data.tasks);
      if (reportsRes.data.success) setReports(reportsRes.data.reports);
    } catch (err) {
      setError(err.message || 'Failed to load admin management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserActive = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-active`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: res.data.user.isActive } : u))
        );
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle user status');
    }
  };

  const handleResolveDispute = async (taskId, resolution) => {
    setResolvingId(taskId);
    setResolveSuccess('');
    try {
      const res = await api.put(`/admin/disputes/${taskId}/resolve`, { resolution });
      if (res.data.success) {
        setResolveSuccess(res.data.message);
        setDisputes((prev) => prev.filter((t) => t._id !== taskId));
        fetchAdminData();
      }
    } catch (err) {
      alert(err.message || 'Failed to resolve dispute');
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading admin analytics..." />;
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--rose)',
              background: 'rgba(244, 63, 94, 0.1)',
              padding: '0.25rem 0.75rem',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.8rem',
              marginBottom: '0.5rem'
            }}
          >
            <ShieldAlert size={16} /> ADMIN MANAGEMENT PORTAL
          </div>
          <h1 style={{ fontSize: '1.8rem' }}>Platform Control & Moderation</h1>
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

        {/* System Stats Overview Grid */}
        {stats && (
          <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Total Users</span>
                <Users size={20} color="var(--primary)" />
              </div>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalUsers}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', display: 'block', marginTop: '0.2rem' }}>
                {stats.activeUsers} Active
              </span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Total Tasks</span>
                <FileText size={20} color="var(--cyan)" />
              </div>
              <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalTasks}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--cyan)', display: 'block', marginTop: '0.2rem' }}>
                {stats.openTasks} Open
              </span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Completed Tasks</span>
                <CheckCircle2 size={20} color="var(--emerald)" />
              </div>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald)' }}>{stats.completedTasks}</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Disputed Tasks</span>
                <AlertTriangle size={20} color="var(--rose)" />
              </div>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--rose)' }}>{stats.disputedTasks}</span>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'users' ? '2px solid var(--cyan)' : '2px solid transparent',
              color: activeTab === 'users' ? 'var(--cyan)' : 'var(--text-sub)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Users List ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'disputes' ? '2px solid var(--rose)' : '2px solid transparent',
              color: activeTab === 'disputes' ? 'var(--rose)' : 'var(--text-sub)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Disputed Tasks ({disputes.length})
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'reports' ? '2px solid var(--amber)' : '2px solid transparent',
              color: activeTab === 'reports' ? 'var(--amber)' : 'var(--text-sub)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Safety Reports ({reports.length})
          </button>
        </div>

        {/* Tab 1: Users Table */}
        {activeTab === 'users' && (
          <div className="glass-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem' }}>User</th>
                  <th style={{ padding: '0.85rem' }}>Email</th>
                  <th style={{ padding: '0.85rem' }}>Role</th>
                  <th style={{ padding: '0.85rem' }}>Status</th>
                  <th style={{ padding: '0.85rem' }}>Joined Date</th>
                  <th style={{ padding: '0.85rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={getAvatarUrl(u.profileImage, u.name)} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</span>
                    </td>
                    <td style={{ padding: '0.85rem', color: 'var(--text-sub)' }}>{u.email}</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: u.role === 'admin' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(99, 102, 241, 0.15)', color: u.role === 'admin' ? 'var(--rose)' : 'var(--primary)' }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <span style={{ color: u.isActive ? 'var(--emerald)' : 'var(--rose)', fontWeight: 600 }}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserActive(u._id)}
                          className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                        >
                          {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Disputed Tasks List */}
        {activeTab === 'disputes' && (
          <div>
            {resolveSuccess && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--emerald)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.25rem'
                }}
              >
                ✔ {resolveSuccess}
              </div>
            )}
            {disputes.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <CheckCircle2 size={40} color="var(--emerald)" style={{ marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-sub)' }}>No disputed tasks at this time. All disputes resolved.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {disputes.map((t) => (
                  <div key={t._id} className="glass-card" style={{ borderLeft: '4px solid var(--rose)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem' }}>{t.title}</h4>
                      <TaskStatusBadge status={t.status} />
                    </div>
                    <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                      <strong>Dispute Reason:</strong> {t.dispute?.reason || 'No reason specified'}
                    </p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span>Requester: {t.requester?.name} ({t.requester?.email})</span>
                      <span>Tasker: {t.tasker?.name} ({t.tasker?.email})</span>
                      <span>Category: {t.category?.replace('_', ' ')}</span>
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '0.85rem',
                        display: 'flex',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>ADMIN RULING:</span>
                      <button
                        onClick={() => handleResolveDispute(t._id, 'complete')}
                        className="btn btn-success btn-sm"
                        disabled={resolvingId === t._id}
                      >
                        <ThumbsUp size={14} /> Approve Tasker (COMPLETE)
                      </button>
                      <button
                        onClick={() => handleResolveDispute(t._id, 'cancel')}
                        className="btn btn-danger btn-sm"
                        disabled={resolvingId === t._id}
                      >
                        <XCircle size={14} /> Side with Requester (CANCEL)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Safety Reports List */}
        {activeTab === 'reports' && (
          <div>
            {reports.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-sub)' }}>No safety violation reports filed.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reports.map((r) => (
                  <div key={r._id} className="glass-card" style={{ borderLeft: '4px solid var(--amber)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber)' }}>{r.reason}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                      "{r.description}"
                    </p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                      Reported by: {r.reportedBy?.name} ({r.reportedBy?.email}) | Task: {r.task?.title}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
