import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import TaskStatusBadge from '../components/TaskStatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import RatingStars from '../components/RatingStars';
import Modal from '../components/Modal';
import TaskChat from '../components/TaskChat';
import { getAvatarUrl } from '../utils/avatar';
import {
  MapPin,
  Clock,
  IndianRupee,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Play,
  Upload,
  ThumbsUp,
  XCircle,
  ShieldAlert,
  UserCheck,
  Calendar,
  AlertCircle,
  FileText,
  Lock,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Repeat,
  PlusCircle,
  Trash2,
  Star,
  StarOff
} from 'lucide-react';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeMode, setActiveMode } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals & form state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [proofDescription, setProofDescription] = useState('');
  const [proofFiles, setProofFiles] = useState([]);

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Safety Violation');
  const [reportDescription, setReportDescription] = useState('');

  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const [submittingAction, setSubmittingAction] = useState(false);

  // Multiple-submissions management state
  const [deletingSubId, setDeletingSubId] = useState(null);
  const [markingFinalSubId, setMarkingFinalSubId] = useState(null);


  const fetchTaskDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/tasks/${id}`);
      if (res.data.success) {
        setTask(res.data.task);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullPage text="Loading task details..." />;
  }

  if (error || !task) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <AlertCircle size={48} color="var(--rose)" style={{ marginBottom: '1rem' }} />
          <h2>Task Not Found</h2>
          <p style={{ color: 'var(--text-sub)', marginBottom: '1.5rem' }}>{error || 'This task does not exist or was removed.'}</p>
          <Link to="/browse" className="btn btn-secondary">
            Return to Task Browsing
          </Link>
        </div>
      </div>
    );
  }

  const isRequester = user && task.requester && user._id === task.requester._id;
  const isTasker = user && task.tasker && user._id === task.tasker._id;
  const isAdmin = user && user.role === 'admin';

  // Handler Actions
  const handleAcceptTask = async () => {
    if (!user) return navigate('/login');
    if (activeMode !== 'tasker') {
      setError('You must switch to Tasker mode to accept tasks.');
      return;
    }
    setSubmittingAction(true);
    setError('');
    try {
      const res = await api.post(`/tasks/${id}/accept`);
      if (res.data.success) {
        setActionSuccess('Task accepted successfully!');
        setTask(res.data.task);
      }
    } catch (err) {
      setError(err.message || 'Failed to accept task');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleStartTask = async () => {
    if (activeMode !== 'tasker') {
      setError('You must switch to Tasker mode to start tasks.');
      return;
    }
    setSubmittingAction(true);
    setError('');
    try {
      const res = await api.post(`/tasks/${id}/start`);
      if (res.data.success) {
        setActionSuccess('Task started and marked IN_PROGRESS');
        setTask(res.data.task);
      }
    } catch (err) {
      setError(err.message || 'Failed to start task');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (activeMode !== 'tasker') {
      setError('You must switch to Tasker mode to submit completion proof.');
      return;
    }
    setSubmittingAction(true);
    setError('');

    const formData = new FormData();
    formData.append('description', proofDescription);
    proofFiles.forEach((file) => {
      formData.append('proofFiles', file);
    });

    try {
      const res = await api.post(`/tasks/${id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setActionSuccess('Proof submitted! AI verification generated.');
        setTask(res.data.task);
        setSubmitModalOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit proof');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleApproveTask = async () => {
    if (activeMode !== 'requester') {
      setError('You must switch to Requester mode to approve tasks.');
      return;
    }
    setSubmittingAction(true);
    setError('');
    try {
      const res = await api.post(`/tasks/${id}/approve`);
      if (res.data.success) {
        setActionSuccess('Task approved and reward released to tasker!');
        setTask(res.data.task);
        setRatingModalOpen(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to approve task');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDisputeTask = async (e) => {
    e.preventDefault();
    if (activeMode !== 'requester') {
      setError('You must switch to Requester mode to dispute submissions.');
      return;
    }
    setSubmittingAction(true);
    setError('');
    try {
      const res = await api.post(`/tasks/${id}/dispute`, { reason: disputeReason });
      if (res.data.success) {
        setActionSuccess('Submission marked DISPUTED for admin resolution.');
        setTask(res.data.task);
        setDisputeModalOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to dispute task');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCancelTask = async () => {
    if (activeMode !== 'requester') {
      setError('You must switch to Requester mode to cancel tasks.');
      return;
    }
    if (!window.confirm('Are you sure you want to cancel this task? Escrow will be refunded to your wallet.')) return;
    setSubmittingAction(true);
    setError('');
    try {
      const res = await api.post(`/tasks/${id}/cancel`);
      if (res.data.success) {
        setActionSuccess('Task cancelled and escrow refunded to your wallet.');
        setTask(res.data.task);
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel task');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReportTask = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    setError('');
    try {
      const res = await api.post(`/tasks/${id}/report`, {
        reason: reportReason,
        description: reportDescription
      });
      if (res.data.success) {
        setActionSuccess('Safety report submitted to platform admins for review.');
        setReportModalOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    setError('');
    try {
      const targetUserId = isRequester ? task.tasker?._id : task.requester?._id;
      const res = await api.post('/ratings', {
        taskId: task._id,
        ratedUserId: targetUserId,
        score: ratingVal,
        comment: ratingComment
      });
      if (res.data.success) {
        setActionSuccess('Thank you for submitting your rating!');
        setRatingModalOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setSubmittingAction(false);
    }
  };

  // ── New: Delete a specific submission ──
  const handleDeleteSubmission = async (subId) => {
    if (activeMode !== 'tasker') {
      setError('You must switch to Tasker mode to delete submissions.');
      return;
    }
    if (!window.confirm('Delete this submission? This action cannot be undone.')) return;
    setDeletingSubId(subId);
    setError('');
    try {
      const res = await api.delete(`/tasks/${id}/submissions/${subId}`);
      if (res.data.success) {
        setActionSuccess('Submission deleted successfully.');
        setTask(res.data.task);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete submission');
    } finally {
      setDeletingSubId(null);
    }
  };

  // ── New: Mark a submission as final ──
  const handleMarkFinal = async (subId) => {
    if (activeMode !== 'tasker') {
      setError('You must switch to Tasker mode to mark a submission as final.');
      return;
    }
    setMarkingFinalSubId(subId);
    setError('');
    try {
      const res = await api.patch(`/tasks/${id}/submissions/${subId}/final`);
      if (res.data.success) {
        setActionSuccess('Submission marked as final. AI verification panel updated.');
        setTask(res.data.task);
      }
    } catch (err) {
      setError(err.message || 'Failed to mark submission as final');
    } finally {
      setMarkingFinalSubId(null);
    }
  };

  const canParticipateInChat = user && (isRequester || isTasker || isAdmin) && task.status !== 'OPEN';


  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Banner Messages */}
        {actionSuccess && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--emerald)',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>✔ {actionSuccess}</span>
            <button onClick={() => setActionSuccess('')} style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--rose)',
              padding: '0.85rem 1.25rem',
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

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Main Task Column */}
          <div>
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              {/* Category & Status Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: 'var(--cyan)',
                    background: 'rgba(6, 182, 212, 0.12)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px'
                  }}
                >
                  {task.category?.replace('_', ' ').toUpperCase()}
                </span>
                <TaskStatusBadge status={task.status} />
              </div>

              <h1 style={{ fontSize: '1.6rem', lineHeight: '1.3', marginBottom: '1rem' }}>{task.title}</h1>

              {/* Task Location Box */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}
              >
                <MapPin size={22} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Task Location Details
                  </span>
                  <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.1rem' }}>
                    {task.location?.locality}, {task.location?.city}, {task.location?.state}, {task.location?.country}
                  </p>
                  {task.location?.additionalDetails && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
                      <strong>Specific Address / Landmark:</strong> {task.location.additionalDetails}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>Task Instructions & Purpose</h4>
                <p style={{ color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{task.description}</p>
              </div>

              {/* Proof Requirements */}
              <div
                style={{
                  background: 'rgba(168, 85, 247, 0.08)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <h4 style={{ fontSize: '0.925rem', color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <Camera size={18} /> Required Verification Proof: {task.proofRequirement?.replace('_', ' ')}
                </h4>
                {task.proofInstructions && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>
                    <strong>Specific Proof Instructions:</strong> {task.proofInstructions}
                  </p>
                )}
              </div>

              {/* Transition Timestamps Audit Log */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <span>Posted: {new Date(task.createdAt).toLocaleString()}</span>
                {task.acceptedAt && <span>Accepted: {new Date(task.acceptedAt).toLocaleString()}</span>}
                {task.startedAt && <span>Started: {new Date(task.startedAt).toLocaleString()}</span>}
                {task.completedAt && <span>Completed: {new Date(task.completedAt).toLocaleString()}</span>}
                {task.cancelledAt && <span>Cancelled: {new Date(task.cancelledAt).toLocaleString()}</span>}
              </div>
            </div>

            {/* ── Multiple Submissions Panel ── */}
            {(() => {
              // Allowed statuses for add/delete/mark-final actions
              const activeForSubmissions = ['ACCEPTED', 'IN_PROGRESS', 'SUBMITTED'].includes(task.status);

              // Combine: new submissions[] array + legacy task.submission (backward compat)
              const hasNewSubmissions = task.submissions && task.submissions.length > 0;
              const hasLegacySubmission =
                !hasNewSubmissions &&
                task.submission &&
                (task.submission.description || (task.submission.proofFiles && task.submission.proofFiles.length > 0));

              if (!hasNewSubmissions && !hasLegacySubmission && !isTasker) return null;
              if (!hasNewSubmissions && !hasLegacySubmission && isTasker && !activeForSubmissions) return null;

              return (
                <div className="glass-card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                  {/* Panel header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <FileText size={22} />
                      Tasker Proof Submissions
                      {hasNewSubmissions && (
                        <span style={{ fontSize: '0.75rem', background: 'rgba(168,85,247,0.2)', color: 'var(--purple)', padding: '0.15rem 0.55rem', borderRadius: '10px', marginLeft: '0.4rem' }}>
                          {task.submissions.length}
                        </span>
                      )}
                    </h3>

                    {/* Add Submission button — tasker only, task still active */}
                    {!isAdmin && isTasker && activeForSubmissions && activeMode === 'tasker' && (
                      <button
                        onClick={() => { setProofDescription(''); setProofFiles([]); setSubmitModalOpen(true); }}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        id="add-submission-btn"
                      >
                        <PlusCircle size={16} /> Add Submission
                      </button>
                    )}
                    {!isAdmin && isTasker && activeForSubmissions && activeMode !== 'tasker' && (
                      <button
                        onClick={() => setActiveMode('tasker')}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Repeat size={14} /> Switch to Tasker Mode
                      </button>
                    )}
                  </div>


                  {/* ── New submissions[] list ── */}
                  {hasNewSubmissions && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {task.submissions.map((sub, idx) => (
                        <div
                          key={sub._id}
                          id={`submission-${sub._id}`}
                          style={{
                            background: sub.isFinal
                              ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.06))'
                              : 'rgba(255,255,255,0.03)',
                            border: sub.isFinal
                              ? '1px solid rgba(16,185,129,0.4)'
                              : '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '1rem'
                          }}
                        >
                          {/* Submission header row */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                #{idx + 1}
                              </span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {new Date(sub.submittedAt).toLocaleString()}
                              </span>
                              {sub.isFinal && (
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '10px',
                                  background: 'rgba(16,185,129,0.2)',
                                  color: 'var(--emerald)',
                                  border: '1px solid rgba(16,185,129,0.35)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}>
                                  <Star size={11} fill="currentColor" /> FINAL
                                </span>
                              )}
                              {/* Per-submission AI badge */}
                              {sub.aiProofVerification && (
                                <span style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '10px',
                                  background: sub.aiProofVerification.recommendation === 'RECOMMEND_APPROVE'
                                    ? 'rgba(16,185,129,0.15)'
                                    : sub.aiProofVerification.recommendation === 'FLAG_CONCERNS'
                                    ? 'rgba(244,63,94,0.15)'
                                    : 'rgba(245,158,11,0.15)',
                                  color: sub.aiProofVerification.recommendation === 'RECOMMEND_APPROVE'
                                    ? 'var(--emerald)'
                                    : sub.aiProofVerification.recommendation === 'FLAG_CONCERNS'
                                    ? 'var(--rose)'
                                    : '#f59e0b',
                                  border: sub.aiProofVerification.recommendation === 'RECOMMEND_APPROVE'
                                    ? '1px solid rgba(16,185,129,0.3)'
                                    : sub.aiProofVerification.recommendation === 'FLAG_CONCERNS'
                                    ? '1px solid rgba(244,63,94,0.3)'
                                    : '1px solid rgba(245,158,11,0.3)'
                                }}>
                                  AI {sub.aiProofVerification.matchScore}% · {sub.aiProofVerification.confidence}
                                </span>
                              )}
                            </div>

                            {/* Tasker action buttons (active tasks only, non-admin) */}
                            {!isAdmin && isTasker && activeForSubmissions && activeMode === 'tasker' && (
                              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                {!sub.isFinal && (
                                  <button
                                    id={`mark-final-${sub._id}`}
                                    onClick={() => handleMarkFinal(sub._id)}
                                    disabled={markingFinalSubId === sub._id}
                                    className="btn btn-success btn-sm"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                                    title="Mark this submission as final"
                                  >
                                    <Star size={13} />
                                    {markingFinalSubId === sub._id ? '...' : 'Mark Final'}
                                  </button>
                                )}
                                {sub.isFinal && (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem' }}>
                                    <StarOff size={13} /> Final selected
                                  </span>
                                )}
                                <button
                                  id={`delete-submission-${sub._id}`}
                                  onClick={() => handleDeleteSubmission(sub._id)}
                                  disabled={deletingSubId === sub._id}
                                  className="btn btn-danger btn-sm"
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                                  title="Delete this submission"
                                >
                                  <Trash2 size={13} />
                                  {deletingSubId === sub._id ? '...' : 'Delete'}
                                </button>
                              </div>
                            )}
                          </div>


                          {/* Description */}
                          {sub.description && (
                            <div style={{ marginBottom: '0.75rem' }}>
                              <strong style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Description:</strong>
                              <p style={{ background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: '6px', marginTop: '0.25rem', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                {sub.description}
                              </p>
                            </div>
                          )}

                          {/* Proof files */}
                          {sub.proofFiles && sub.proofFiles.length > 0 && (
                            <div>
                              <strong style={{ fontSize: '0.85rem', color: 'var(--text-sub)', display: 'block', marginBottom: '0.5rem' }}>
                                Proof Files ({sub.proofFiles.length}):
                              </strong>
                              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                                {sub.proofFiles.map((file, fIdx) => (
                                  <div key={fIdx}>
                                    {file.startsWith('http') || file.startsWith('/uploads') ? (
                                      <a
                                        href={file.startsWith('http') ? file : `http://localhost:5000${file}`}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <img
                                          src={file.startsWith('http') ? file : `http://localhost:5000${file}`}
                                          alt={`Proof file ${fIdx + 1}`}
                                          style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                          onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                      </a>
                                    ) : (
                                      <span style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>{file}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Detailed AI findings for this submission */}
                          {sub.aiProofVerification && sub.aiProofVerification.findings && sub.aiProofVerification.findings.length > 0 && (
                            <div style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              💡 {sub.aiProofVerification.summary}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Backward-compat: legacy task.submission (read-only) ── */}
                  {hasLegacySubmission && (
                    <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Legacy submission — {new Date(task.submission.submittedAt).toLocaleString()}
                      </div>
                      {task.submission.description && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>Description:</strong>
                          <p style={{ background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: '6px', marginTop: '0.25rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                            {task.submission.description}
                          </p>
                        </div>
                      )}
                      {task.submission.proofFiles && task.submission.proofFiles.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                          {task.submission.proofFiles.map((file, idx) => (
                            <div key={idx}>
                              {file.startsWith('http') || file.startsWith('/uploads') ? (
                                <a href={file.startsWith('http') ? file : `http://localhost:5000${file}`} target="_blank" rel="noreferrer">
                                  <img
                                    src={file.startsWith('http') ? file : `http://localhost:5000${file}`}
                                    alt="Legacy proof"
                                    style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                  />
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>{file}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty state for tasker on active task */}
                  {!hasNewSubmissions && !hasLegacySubmission && isTasker && activeForSubmissions && (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      <FileText size={28} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                      <p style={{ fontSize: '0.9rem' }}>No submissions yet. Add your first submission using the button above.</p>
                    </div>
                  )}
                </div>
              );
            })()}



            {/* AI Proof Verification Insights Panel */}
            {task.aiProofVerification && (
              <div
                className="glass-card"
                style={{
                  marginBottom: '1.5rem',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(99, 102, 241, 0.08))',
                  border: '1px solid rgba(6, 182, 212, 0.35)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={20} color="var(--cyan)" />
                    <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#fff' }}>
                      AI Automated Proof Verification Insights
                    </h3>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.65rem',
                      borderRadius: '12px',
                      background:
                        task.aiProofVerification.recommendation === 'RECOMMEND_APPROVE'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'rgba(245, 158, 11, 0.2)',
                      color:
                        task.aiProofVerification.recommendation === 'RECOMMEND_APPROVE'
                          ? 'var(--emerald)'
                          : '#f59e0b',
                      border:
                        task.aiProofVerification.recommendation === 'RECOMMEND_APPROVE'
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : '1px solid rgba(245, 158, 11, 0.4)'
                    }}
                  >
                    {task.aiProofVerification.recommendation?.replace('_', ' ')}
                  </span>
                </div>

                {/* Score Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-sub)' }}>Proof Match Confidence:</span>
                    <span style={{ fontWeight: 800, color: 'var(--cyan)' }}>
                      {task.aiProofVerification.matchScore}% ({task.aiProofVerification.confidence} Confidence)
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${task.aiProofVerification.matchScore}%`,
                        background: 'linear-gradient(90deg, #6366f1, #06b6d4, #10b981)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>

                {/* Findings Checklist */}
                {task.aiProofVerification.findings && task.aiProofVerification.findings.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    {task.aiProofVerification.findings.map((finding, idx) => (
                      <div key={idx} style={{ fontSize: '0.825rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {finding}
                      </div>
                    ))}
                  </div>
                )}

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                  💡 {task.aiProofVerification.summary}
                </p>
              </div>
            )}

            {/* Dispute Notice Box */}
            {task.status === 'DISPUTED' && task.dispute && (
              <div
                style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem'
                }}
              >
                <h4 style={{ color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={20} /> Task Submission Disputed
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                  <strong>Dispute Reason:</strong> {task.dispute.reason}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Disputed on: {new Date(task.dispute.disputedAt).toLocaleString()}. An admin will review the case and resolve the escrow reward.
                </p>
              </div>
            )}

            {/* Action Bar based on Role & State */}
            <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>YOUR STATUS:</span>
                <p style={{ fontWeight: 700, color: 'var(--text-main)', margin: '0.15rem 0 0' }}>
                  {isAdmin
                    ? 'Platform Administrator (Moderation & Safety)'
                    : isRequester
                    ? 'Task Requester (Owner)'
                    : isTasker
                    ? 'Assigned Tasker'
                    : 'Community Member'}
                  {!isAdmin && (
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.725rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '10px',
                        background: activeMode === 'requester' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: activeMode === 'requester' ? 'var(--primary-light)' : 'var(--emerald)',
                        border: activeMode === 'requester' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)'
                      }}
                    >
                      {activeMode === 'requester' ? 'Requester Mode' : 'Tasker Mode'}
                    </span>
                  )}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Admin-specific actions */}
                {isAdmin && task.status === 'DISPUTED' && (
                  <Link
                    to="/admin"
                    className="btn btn-rose btn-sm"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#fff',
                      background: 'var(--rose)',
                      border: 'none',
                      padding: '0.5rem 0.9rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <ShieldAlert size={16} /> Admin Portal (Resolve Dispute)
                  </Link>
                )}

                {/* Non-admin User Actions */}
                {!isAdmin && (
                  <>
                    {/* Non-owner action on OPEN task: Accept Task */}
                    {!isRequester && !isTasker && task.status === 'OPEN' && (
                      <>
                        {!user ? (
                          <button onClick={() => navigate('/login')} className="btn btn-cyan btn-lg">
                            <UserCheck size={20} /> Login to Accept
                          </button>
                        ) : activeMode === 'requester' ? (
                          <button
                            onClick={() => setActiveMode('tasker')}
                            className="btn btn-cyan btn-lg"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          >
                            <Repeat size={18} /> Switch to Tasker Mode to Accept
                          </button>
                        ) : (
                          <button onClick={handleAcceptTask} className="btn btn-cyan btn-lg" disabled={submittingAction}>
                            <UserCheck size={20} /> Accept Task
                          </button>
                        )}
                      </>
                    )}

                    {/* Assigned Tasker Actions on ACCEPTED / IN_PROGRESS / SUBMITTED */}
                    {isTasker && (task.status === 'ACCEPTED' || task.status === 'IN_PROGRESS' || task.status === 'SUBMITTED') && (
                      <>
                        {activeMode === 'requester' ? (
                          <button
                            onClick={() => setActiveMode('tasker')}
                            className="btn btn-cyan btn-lg"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          >
                            <Repeat size={18} /> Switch to Tasker Mode to Work on Task
                          </button>
                        ) : (
                          <>
                            {task.status === 'ACCEPTED' && (
                              <button onClick={handleStartTask} className="btn btn-amber btn-lg" disabled={submittingAction}>
                                <Play size={20} /> Start Task
                              </button>
                            )}
                            <button
                              onClick={() => { setProofDescription(''); setProofFiles([]); setSubmitModalOpen(true); }}
                              className="btn btn-primary btn-lg"
                              disabled={submittingAction}
                              id="action-bar-add-submission-btn"
                            >
                              <PlusCircle size={20} /> Add Submission
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {/* Task Requester Actions on SUBMITTED */}
                    {isRequester && task.status === 'SUBMITTED' && (
                      <>
                        {activeMode === 'tasker' ? (
                          <button
                            onClick={() => setActiveMode('requester')}
                            className="btn btn-primary btn-lg"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          >
                            <Repeat size={18} /> Switch to Requester Mode to Review
                          </button>
                        ) : (
                          <>
                            <button onClick={handleApproveTask} className="btn btn-success btn-lg" disabled={submittingAction}>
                              <ThumbsUp size={20} /> Approve & Release Reward
                            </button>
                            <button onClick={() => setDisputeModalOpen(true)} className="btn btn-danger btn-lg" disabled={submittingAction}>
                              <AlertTriangle size={20} /> Dispute
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {/* Requester action: Cancel Task */}
                    {isRequester && (task.status === 'OPEN' || task.status === 'ACCEPTED') && (
                      <>
                        {activeMode === 'tasker' ? (
                          <button
                            onClick={() => setActiveMode('requester')}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          >
                            <Repeat size={16} /> Switch to Requester Mode to Cancel
                          </button>
                        ) : (
                          <button onClick={handleCancelTask} className="btn btn-secondary" disabled={submittingAction}>
                            <XCircle size={18} /> Cancel Task (Refund Escrow)
                          </button>
                        )}
                      </>
                    )}

                    {/* Completed Task Rating Action */}
                    {task.status === 'COMPLETED' && (isRequester || isTasker) && (
                      <button onClick={() => setRatingModalOpen(true)} className="btn btn-amber">
                        Rate Counterpart Participant
                      </button>
                    )}

                    {/* Report Task Action */}
                    {user && (
                      <button onClick={() => setReportModalOpen(true)} className="btn btn-secondary btn-sm" title="Report safety violation">
                        <ShieldAlert size={16} color="var(--rose)" /> Report
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Embedded Task Chat Panel */}
            {canParticipateInChat && (
              <div style={{ marginBottom: '1.5rem' }}>
                <TaskChat
                  taskId={task._id}
                  currentUser={user}
                  requester={task.requester}
                  tasker={task.tasker}
                  taskStatus={task.status}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar Info */}
          <div>
            {/* Reward & Escrow Status Box (Non-Admin Users Only) */}
            {!isAdmin && (
              <div className="glass-card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  TASK REWARD
                </span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--emerald)', margin: '0.25rem 0' }}>
                  ₹{task.rewardAmount}
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>Currency: {task.currency}</span>

                {/* Escrow Status Pill */}
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background:
                      task.escrowStatus === 'RELEASED'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : task.escrowStatus === 'REFUNDED'
                        ? 'rgba(99, 102, 241, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                    border:
                      task.escrowStatus === 'RELEASED'
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : task.escrowStatus === 'REFUNDED'
                        ? '1px solid rgba(99, 102, 241, 0.3)'
                        : '1px solid rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color:
                      task.escrowStatus === 'RELEASED'
                        ? 'var(--emerald)'
                        : task.escrowStatus === 'REFUNDED'
                        ? 'var(--primary-light)'
                        : '#f59e0b'
                  }}
                >
                  {task.escrowStatus === 'RELEASED' ? (
                    <>
                      <CheckCircle2 size={15} /> Escrow Released to Tasker
                    </>
                  ) : task.escrowStatus === 'REFUNDED' ? (
                    <>
                      <Sparkles size={15} /> Escrow Refunded to Requester
                    </>
                  ) : (
                    <>
                      <Lock size={15} /> ₹{task.rewardAmount} Locked in Escrow
                    </>
                  )}
                </div>
              </div>
            )}


            {/* Requester Profile Card */}
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>Posted By (Requester)</h4>
              {task.requester ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={getAvatarUrl(task.requester.profileImage, task.requester.name)}
                    alt={task.requester.name}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h5 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{task.requester.name}</h5>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Member since {new Date(task.requester.createdAt || Date.now()).getFullYear()}
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unknown Requester</p>
              )}
            </div>

            {/* Assigned Tasker Profile Card (If Accepted) */}
            <div className="glass-card">
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-sub)', marginBottom: '0.75rem' }}>Assigned Tasker</h4>
              {task.tasker ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={getAvatarUrl(task.tasker.profileImage, task.tasker.name)}
                    alt={task.tasker.name}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h5 style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{task.tasker.name}</h5>
                    <span style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>Accepted Task</span>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No tasker assigned yet. Task is OPEN.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal 1: Add Submission Modal (reused for both first and subsequent submissions) */}
        <Modal isOpen={submitModalOpen} onClose={() => setSubmitModalOpen(false)} title="Add Proof Submission">
          <form onSubmit={handleSubmitProof}>
            <div className="form-group">
              <label className="form-label">Description / Summary</label>
              <textarea
                className="form-textarea"
                placeholder="Describe your verification findings, shop prices, or location conditions..."
                value={proofDescription}
                onChange={(e) => setProofDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Proof Files (Photos/Documents/Videos)</label>
              <input
                type="file"
                multiple
                className="form-control"
                onChange={(e) => setProofFiles(Array.from(e.target.files))}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                You can select up to 5 files (Max 10MB per file). Automated AI proof analysis will run on submission.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setSubmitModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submittingAction}>
                {submittingAction ? 'Analyzing & Uploading...' : 'Add Submission'}
              </button>

            </div>
          </form>
        </Modal>

        {/* Modal 2: Dispute Reason Modal */}
        <Modal isOpen={disputeModalOpen} onClose={() => setDisputeModalOpen(false)} title="Dispute Task Submission">
          <form onSubmit={handleDisputeTask}>
            <div className="form-group">
              <label className="form-label">Reason for Dispute</label>
              <textarea
                className="form-textarea"
                placeholder="Explain why the submitted proof is incomplete, inaccurate, or unsatisfactory..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setDisputeModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={submittingAction}>
                {submittingAction ? 'Submitting Dispute...' : 'Confirm Dispute'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal 3: Report Safety Violation Modal */}
        <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Report Task Violation">
          <form onSubmit={handleReportTask}>
            <div className="form-group">
              <label className="form-label">Report Category</label>
              <select className="form-select" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                <option value="Safety Violation">Safety / Illegal Activity</option>
                <option value="Privacy Violation">Stalking / Privacy Violation</option>
                <option value="Fraud">Fraud or Deception</option>
                <option value="Inappropriate Content">Inappropriate Content</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description of Violation</label>
              <textarea
                className="form-textarea"
                placeholder="Describe how this task violates community safety guidelines..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setReportModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={submittingAction}>
                Submit Safety Report
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal 4: Rating Modal */}
        <Modal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)} title="Submit Feedback & Rating">
          <form onSubmit={handleRatingSubmit}>
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label className="form-label">Select Star Rating (1 to 5)</label>
              <div style={{ margin: '0.5rem 0' }}>
                <RatingStars value={ratingVal} onChange={(val) => setRatingVal(val)} size={32} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Review Comment</label>
              <textarea
                className="form-textarea"
                placeholder="Share your experience working with this user..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setRatingModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-amber" disabled={submittingAction}>
                Submit Rating
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default TaskDetailPage;
