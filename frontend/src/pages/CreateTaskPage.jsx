import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SafetyNotice from '../components/SafetyNotice';
import {
  PlusCircle,
  MapPin,
  Calendar,
  IndianRupee,
  Camera,
  AlertCircle,
  Repeat,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Lock,
  CheckCircle2
} from 'lucide-react';

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const { user, activeMode, setActiveMode } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const [title, setTitle] = useState('');

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('verification');

  // Structured location fields
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Andhra Pradesh');
  const [city, setCity] = useState('Vijayawada');
  const [locality, setLocality] = useState('Benz Circle');
  const [additionalDetails, setAdditionalDetails] = useState('');

  // Deadline date & time
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('18:00');

  // Reward & Proof
  const [rewardAmount, setRewardAmount] = useState('300');
  const [currency] = useState('INR');
  const [proofRequirement, setProofRequirement] = useState('photo');
  const [proofInstructions, setProofInstructions] = useState('Take a photo showing the product name and displayed price.');

  // AI Safety Analysis
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [scanningAi, setScanningAi] = useState(false);

  // Wallet
  const [walletBalance, setWalletBalance] = useState(5000);
  const [toppingUp, setToppingUp] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const res = await api.get('/wallet');
        if (res.data.success) {
          setWalletBalance(res.data.walletBalance);
        }
      } catch (err) {
        // Fallback to user.walletBalance
        if (user?.walletBalance !== undefined) setWalletBalance(user.walletBalance);
      }
    };
    if (user) fetchWalletBalance();
  }, [user]);

  // Debounced AI Safety scan on form input change
  useEffect(() => {
    if (!title && !description) {
      setAiAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setScanningAi(true);
      try {
        const res = await api.post('/ai/scan-task', {
          title,
          description,
          category,
          proofRequirement,
          proofInstructions
        });
        if (res.data.success) {
          setAiAnalysis(res.data.analysis);
        }
      } catch (err) {
        // Silent catch for background AI analysis
      } finally {
        setScanningAi(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [title, description, category, proofRequirement, proofInstructions]);

  const handleQuickTopUp = async (amount = 1000) => {
    setToppingUp(true);
    try {
      const res = await api.post('/wallet/deposit', { amount });
      if (res.data.success) {
        setWalletBalance(res.data.walletBalance);
      }
    } catch (err) {
      alert(err.message || 'Top-up failed');
    } finally {
      setToppingUp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (activeMode === 'tasker') {
      setError('Taskers cannot create tasks. Please switch to Requester mode.');
      return;
    }

    if (!deadlineDate || !deadlineTime) {
      setError('Please specify both deadline date and time.');
      return;
    }

    const combinedDeadline = new Date(`${deadlineDate}T${deadlineTime}`);
    if (combinedDeadline <= new Date()) {
      setError('Deadline must be set to a date and time in the future.');
      return;
    }

    const rewardNum = Number(rewardAmount);
    if (rewardNum < 0) {
      setError('Reward amount cannot be negative.');
      return;
    }

    if (walletBalance < rewardNum) {
      setError(`Insufficient wallet balance (Available: ₹${walletBalance}, Required: ₹${rewardNum}). Please top up your wallet.`);
      return;
    }

    if (aiAnalysis && aiAnalysis.riskLevel === 'HIGH_RISK') {
      setError(`Cannot post task: Prohibited safety issues detected (${aiAnalysis.flags.join(', ')})`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/tasks', {
        title,
        description,
        category,
        location: {
          country,
          state,
          city,
          locality,
          additionalDetails
        },
        deadline: combinedDeadline.toISOString(),
        rewardAmount: rewardNum,
        currency,
        proofRequirement,
        proofInstructions
      });

      if (res.data.success) {
        navigate(`/tasks/${res.data.task._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  if (activeMode === 'tasker') {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: '700px', marginTop: '2rem' }}>
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: 'var(--rose)'
              }}
            >
              <AlertCircle size={32} />
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#fff' }}>
              Task Creation Restricted in Tasker Mode
            </h2>

            <p style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              As a Tasker, your dashboard is focused on browsing, accepting, and completing open tasks. Posting new tasks is reserved for Requesters. Switch to Requester mode below to create and post a task.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveMode('requester')}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Repeat size={18} /> Switch to Requester Mode
              </button>

              <button
                onClick={() => navigate('/browse')}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ArrowLeft size={18} /> Browse Open Tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isBalanceSufficient = walletBalance >= Number(rewardAmount);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Post a Real-World Request</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem' }}>
            Specify the task, physical location details, deadline, reward, and required proof.
          </p>
        </div>

        {/* Safety Disclaimer Banner */}
        <SafetyNotice />

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

        {/* Real-time AI Safety Feedback Box (if analyzing or completed) */}
        {aiAnalysis && (
          <div
            className="glass-card"
            style={{
              padding: '1.25rem',
              marginBottom: '1.5rem',
              background:
                aiAnalysis.riskLevel === 'HIGH_RISK'
                  ? 'rgba(244, 63, 94, 0.12)'
                  : aiAnalysis.riskLevel === 'MEDIUM_RISK'
                  ? 'rgba(245, 158, 11, 0.12)'
                  : 'rgba(16, 185, 129, 0.1)',
              border:
                aiAnalysis.riskLevel === 'HIGH_RISK'
                  ? '1px solid rgba(244, 63, 94, 0.4)'
                  : aiAnalysis.riskLevel === 'MEDIUM_RISK'
                  ? '1px solid rgba(245, 158, 11, 0.4)'
                  : '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color={aiAnalysis.riskLevel === 'SAFE' ? 'var(--emerald)' : 'var(--cyan)'} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                  TaskBridge AI Safety Scanner
                </span>
                {scanningAi && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Scanning...</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-sub)' }}>
                  Safety Score:
                </span>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: aiAnalysis.score >= 80 ? 'var(--emerald)' : aiAnalysis.score >= 50 ? '#f59e0b' : 'var(--rose)'
                  }}
                >
                  {aiAnalysis.score}/100
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)', margin: '0 0 0.5rem' }}>
              {aiAnalysis.feedback}
            </p>

            {aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0 && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {aiAnalysis.suggestions.map((sug, idx) => (
                  <div key={idx} style={{ marginTop: '0.2rem' }}>💡 {sug}</div>
                ))}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2.25rem' }}>
          {/* Section 1: Basic Information */}
          <h3 style={{ fontSize: '1.15rem', color: 'var(--cyan)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            1. Basic Task Details
          </h3>

          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Verify Dell laptop availability at Vijayawada store"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Task Category</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="verification">Verification</option>
                <option value="photo_collection">Photo Collection</option>
                <option value="information_collection">Information Collection</option>
                <option value="pickup">Pickup</option>
                <option value="local_assistance">Local Assistance</option>
                <option value="inspection">Inspection</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Proof Requirement Type</label>
              <select className="form-select" value={proofRequirement} onChange={(e) => setProofRequirement(e.target.value)}>
                <option value="photo">Photo</option>
                <option value="video">Video</option>
                <option value="text_description">Text Description</option>
                <option value="document">Document</option>
                <option value="multiple">Multiple (Photo + Description)</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Task Description & Instructions</label>
            <textarea
              className="form-textarea"
              placeholder="Detail what needs to be verified or done, specific questions to ask, store name, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Specific Proof Instructions</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Take a photo showing the product name and displayed price."
              value={proofInstructions}
              onChange={(e) => setProofInstructions(e.target.value)}
            />
          </div>

          {/* Section 2: Structured Location */}
          <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', margin: '2rem 0 1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            2. Structured Physical Location
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Country</label>
              <input type="text" className="form-control" value={country} onChange={(e) => setCountry(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Andhra Pradesh"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Vijayawada"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Area / Locality</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Benz Circle"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Location / Landmark Details (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Lotus Electronics, Opposite Trendset Mall, 1st Floor"
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
            />
          </div>

          {/* Section 3: Deadline & Escrow Reward */}
          <h3 style={{ fontSize: '1.15rem', color: 'var(--emerald)', margin: '2rem 0 1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            3. Deadline & Escrow Reward
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Deadline Date</label>
              <input
                type="date"
                className="form-control"
                min={new Date().toISOString().split('T')[0]}
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Deadline Time</label>
              <input
                type="time"
                className="form-control"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reward Amount (₹ INR)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--emerald)' }}>
                ₹
              </span>
              <input
                type="number"
                min="0"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="300"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Escrow Commitment Card */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: isBalanceSufficient ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.1)',
              border: isBalanceSufficient ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(244, 63, 94, 0.3)',
              marginTop: '1rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: isBalanceSufficient ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Lock size={18} color={isBalanceSufficient ? 'var(--emerald)' : 'var(--rose)'} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                  Escrow Lock: ₹{Number(rewardAmount || 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.78rem', color: isBalanceSufficient ? 'var(--text-sub)' : 'var(--rose)' }}>
                  {isBalanceSufficient
                    ? `Available Wallet: ₹${walletBalance.toLocaleString('en-IN')}. Funds will be held securely until you approve proof.`
                    : `Low balance! Available: ₹${walletBalance.toLocaleString('en-IN')}. Top up ₹${Number(rewardAmount || 0) - walletBalance} to post.`}
                </div>
              </div>
            </div>

            {!isBalanceSufficient && (
              <button
                type="button"
                onClick={() => handleQuickTopUp(1000)}
                disabled={toppingUp}
                className="btn btn-cyan btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <PlusCircle size={14} /> {toppingUp ? 'Adding...' : 'Quick Top-Up ₹1,000'}
              </button>
            )}
          </div>

          <div style={{ marginTop: '2.25rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting || !isBalanceSufficient || (aiAnalysis && aiAnalysis.riskLevel === 'HIGH_RISK')}
            >
              {submitting ? 'Locking Escrow & Posting...' : `Lock Escrow & Post Task (₹${Number(rewardAmount || 0)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskPage;
