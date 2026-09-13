import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Wallet,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Clock,
  CheckCircle2,
  Shield,
  CreditCard,
  Building,
  Sparkles,
  ExternalLink,
  Filter
} from 'lucide-react';

const WalletPage = () => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [depositAmount, setDepositAmount] = useState('1000');
  const [depositing, setDepositing] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutAccount, setPayoutAccount] = useState('upi:user@okaxis');
  const [withdrawing, setWithdrawing] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wallet');
      if (res.data.success) {
        setWalletData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleDeposit = async (customAmount) => {
    const amountToDeposit = customAmount || depositAmount;
    if (!amountToDeposit || Number(amountToDeposit) <= 0) return;

    setDepositing(true);
    try {
      const res = await api.post('/wallet/deposit', { amount: Number(amountToDeposit) });
      if (res.data.success) {
        fetchWallet();
      }
    } catch (err) {
      alert(err.message || 'Deposit failed');
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;

    setWithdrawing(true);
    try {
      const res = await api.post('/wallet/withdraw', {
        amount: Number(withdrawAmount),
        bankDetails: payoutAccount
      });
      if (res.data.success) {
        setWithdrawModalOpen(false);
        setWithdrawAmount('');
        fetchWallet();
      }
    } catch (err) {
      alert(err.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const filteredTransactions = (walletData?.transactions || []).filter((tx) => {
    if (typeFilter === 'ALL') return true;
    return tx.type === typeFilter;
  });

  const getTxTypeBadge = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return { label: 'Deposit', color: 'var(--emerald)', bg: 'rgba(16, 185, 129, 0.15)', icon: <ArrowDownLeft size={14} /> };
      case 'WITHDRAWAL':
        return { label: 'Withdrawal', color: 'var(--rose)', bg: 'rgba(244, 63, 94, 0.15)', icon: <ArrowUpRight size={14} /> };
      case 'ESCROW_HOLD':
        return { label: 'Escrow Locked', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: <Lock size={14} /> };
      case 'ESCROW_RELEASE':
        return { label: 'Reward Released', color: 'var(--cyan)', bg: 'rgba(6, 182, 212, 0.15)', icon: <CheckCircle2 size={14} /> };
      case 'ESCROW_REFUND':
        return { label: 'Escrow Refunded', color: 'var(--primary-light)', bg: 'rgba(99, 102, 241, 0.15)', icon: <Sparkles size={14} /> };
      default:
        return { label: type, color: 'var(--text-sub)', bg: 'rgba(255, 255, 255, 0.1)', icon: <CreditCard size={14} /> };
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading your wallet & escrow ledger..." />;
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Page Header */}
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
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Wallet size={28} color="var(--cyan)" />
              VeriTask Wallet & Escrow
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '0.925rem', margin: 0 }}>
              Secure escrow holding for task verification rewards, deposits, and earnings.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowUpRight size={16} /> Withdraw
            </button>
            <button
              onClick={() => handleDeposit(1000)}
              disabled={depositing}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <PlusCircle size={16} /> Quick Top-Up ₹1,000
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--rose)',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem'
            }}
          >
            {error}
          </div>
        )}

        {/* Balance Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem'
          }}
        >
          {/* Available Wallet Balance */}
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Available Balance
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Wallet size={18} color="var(--emerald)" />
              </div>
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              ₹{(walletData?.walletBalance || 0).toLocaleString('en-IN')}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--emerald)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={13} /> Ready for task rewards & payouts
            </p>
          </div>

          {/* Locked in Escrow */}
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(99, 102, 241, 0.08))',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Held in Escrow
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Lock size={18} color="#f59e0b" />
              </div>
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              ₹{(walletData?.escrowBalance || 0).toLocaleString('en-IN')}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#f59e0b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Shield size={13} /> Protected until task approval/refund
            </p>
          </div>

          {/* Total Assets */}
          <div
            className="glass-card"
            style={{
              padding: '1.75rem',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(6, 182, 212, 0.08))',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Platform Balance
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CreditCard size={18} color="var(--primary-light)" />
              </div>
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
              ₹{(walletData?.totalBalance || 0).toLocaleString('en-IN')}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Combined wallet funds & active escrow
            </p>
          </div>
        </div>

        {/* Quick Deposit Section */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} color="var(--cyan)" />
            Add Mock Test Funds
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1.25rem' }}>
            Fund your wallet instantly to post tasks and test escrow locking and payouts.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {[500, 1000, 2500, 5000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleDeposit(amt)}
                disabled={depositing}
                style={{
                  background: depositAmount === amt.toString() ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  border: depositAmount === amt.toString() ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  color: '#fff',
                  padding: '0.55rem 1.15rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                + ₹{amt.toLocaleString('en-IN')}
              </button>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              <input
                type="number"
                min="100"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Custom ₹"
                style={{
                  width: '120px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => handleDeposit()}
                disabled={depositing || !depositAmount}
                className="btn btn-cyan"
              >
                {depositing ? 'Processing...' : 'Deposit Funds'}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Transaction & Escrow Ledger</h2>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                Complete verifiable audit trail of all deposits, escrow locks, releases, and refunds.
              </p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {['ALL', 'DEPOSIT', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'WITHDRAWAL'].map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setTypeFilter(filterKey)}
                  style={{
                    background: typeFilter === filterKey ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                    border: 'none',
                    color: typeFilter === filterKey ? '#fff' : 'var(--text-sub)',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {filterKey.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Table */}
          {filteredTransactions.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Clock size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-sub)' }}>No transactions found</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem' }}>Deposit funds or complete tasks to see your ledger activity.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Description & Task</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Balance After</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => {
                    const badge = getTxTypeBadge(tx.type);
                    const isPositive = tx.type === 'DEPOSIT' || tx.type === 'ESCROW_REFUND' || (tx.type === 'ESCROW_RELEASE' && tx.amount > 0);

                    return (
                      <tr
                        key={tx._id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              background: badge.bg,
                              color: badge.color,
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            {badge.icon} {badge.label}
                          </span>
                        </td>

                        <td style={{ padding: '1rem', color: '#fff' }}>
                          <div>{tx.description}</div>
                          {tx.task && (
                            <Link
                              to={`/tasks/${tx.task._id}`}
                              style={{
                                fontSize: '0.78rem',
                                color: 'var(--cyan)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                marginTop: '0.2rem'
                              }}
                            >
                              View Task <ExternalLink size={12} />
                            </Link>
                          )}
                        </td>

                        <td
                          style={{
                            padding: '1rem',
                            fontWeight: 700,
                            color: isPositive ? 'var(--emerald)' : 'var(--rose)',
                            fontSize: '0.95rem'
                          }}
                        >
                          {isPositive ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                        </td>

                        <td style={{ padding: '1rem', color: 'var(--text-sub)' }}>
                          ₹{tx.balanceAfter?.toLocaleString('en-IN')}
                        </td>

                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Withdrawal Modal */}
        {withdrawModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1.5rem'
            }}
          >
            <div
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '2rem',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={22} color="var(--cyan)" /> Withdraw Funds
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1.5rem' }}>
                Transfer earnings from your VeriTask wallet to your bank account or UPI ID.
              </p>

              <form onSubmit={handleWithdraw}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max={walletData?.walletBalance || 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Max: ₹${walletData?.walletBalance || 0}`}
                    className="form-control"
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Available to withdraw: ₹{(walletData?.walletBalance || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label className="form-label">Payout Destination (UPI / Bank Account)</label>
                  <input
                    type="text"
                    value={payoutAccount}
                    onChange={(e) => setPayoutAccount(e.target.value)}
                    placeholder="e.g. user@okhdfcbank or Account & IFSC"
                    className="form-control"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setWithdrawModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={withdrawing || !withdrawAmount || Number(withdrawAmount) > (walletData?.walletBalance || 0)}
                    className="btn btn-primary"
                  >
                    {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
