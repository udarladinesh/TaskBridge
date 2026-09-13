import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';
import NotificationDropdown from './NotificationDropdown';
import {
  Shield,
  PlusCircle,
  Search,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Repeat,
  Wallet
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, activeMode, toggleActiveMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 900
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Shield size={22} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>
              Veri<span style={{ color: 'var(--cyan)' }}>Task</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Verification Network
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <Link
            to="/browse"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: isActive('/browse') ? 'var(--cyan)' : 'var(--text-sub)',
              fontWeight: 600,
              fontSize: '0.925rem'
            }}
          >
            <Search size={18} /> Browse Tasks
          </Link>

          {user && user.role !== 'admin' && (
            <>
              {activeMode === 'requester' && (
                <Link
                  to="/create-task"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: isActive('/create-task') ? 'var(--cyan)' : 'var(--text-sub)',
                    fontWeight: 600,
                    fontSize: '0.925rem'
                  }}
                >
                  <PlusCircle size={18} /> Post Task
                </Link>
              )}

              <Link
                to="/dashboard"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: isActive('/dashboard') ? 'var(--cyan)' : 'var(--text-sub)',
                  fontWeight: 600,
                  fontSize: '0.925rem'
                }}
              >
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <Link
              to="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--rose)',
                fontWeight: 700,
                fontSize: '0.85rem',
                background: 'rgba(244, 63, 94, 0.1)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(244, 63, 94, 0.25)'
              }}
            >
              <ShieldAlert size={16} /> Admin Portal
            </Link>
          )}
        </nav>

        {/* User Auth Buttons, Notifications & Wallet — Desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-nav">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Mode Toggle Button (Non-Admin Users Only) */}
              {user.role !== 'admin' && (
                <button
                  onClick={toggleActiveMode}
                  title="Switch between Requester and Tasker mode"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: activeMode === 'requester' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(16, 185, 129, 0.5)',
                    background: activeMode === 'requester' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: activeMode === 'requester' ? 'var(--primary-light)' : 'var(--emerald)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Repeat size={14} />
                  <span>{activeMode === 'requester' ? 'Requester' : 'Tasker'}</span>
                </button>
              )}

              {/* Wallet Balance Pill (Non-Admin Users Only) */}
              {user.role !== 'admin' && (
                <Link
                  to="/wallet"
                  title="View Wallet & Escrow Ledger"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    textDecoration: 'none',
                    background: isActive('/wallet') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '10px',
                    border: isActive('/wallet') ? '1px solid var(--emerald)' : '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Wallet size={16} color="var(--emerald)" />
                  <span>₹{(user.walletBalance ?? 5000).toLocaleString('en-IN')}</span>
                </Link>
              )}

              {/* Live Notifications Bell Dropdown */}
              <NotificationDropdown />

              {/* Profile Link */}
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  textDecoration: 'none',
                  background: isActive('/profile') ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  border: isActive('/profile') ? '1px solid var(--primary)' : '1px solid var(--border-color)'
                }}
              >
                <img
                  src={getAvatarUrl(user.profileImage, user.name)}
                  alt={user.name}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {user.name.split(' ')[0]}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Logout"
                style={{ color: 'var(--rose)', padding: '0.4rem 0.6rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.5rem',
            cursor: 'pointer',
            color: 'var(--text-main)'
          }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu"
          style={{
            background: 'rgba(11, 15, 25, 0.98)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid var(--border-color)',
            padding: '1rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <Link
            to="/browse"
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0', color: isActive('/browse') ? 'var(--cyan)' : 'var(--text-sub)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}
          >
            <Search size={18} /> Browse Tasks
          </Link>

          {user && (
            <>
              {user.role !== 'admin' && (
                <>
                  {activeMode === 'requester' && (
                    <Link
                      to="/create-task"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0', color: isActive('/create-task') ? 'var(--cyan)' : 'var(--text-sub)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}
                    >
                      <PlusCircle size={18} /> Post a Task
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0', color: isActive('/dashboard') ? 'var(--cyan)' : 'var(--text-sub)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                  <Link
                    to="/wallet"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0', color: isActive('/wallet') ? 'var(--cyan)' : 'var(--text-sub)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}
                  >
                    <Wallet size={18} /> Wallet (₹{(user.walletBalance ?? 5000).toLocaleString('en-IN')})
                  </Link>
                </>
              )}
              <Link
                to="/profile"
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0', color: isActive('/profile') ? 'var(--cyan)' : 'var(--text-sub)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}
              >
                <User size={18} /> Profile
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0', color: 'var(--rose)', fontWeight: 700, borderBottom: '1px solid var(--border-color)' }}
                >
                  <ShieldAlert size={18} /> Admin Portal
                </Link>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
                {user.role !== 'admin' && (
                  <button
                    onClick={toggleActiveMode}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: activeMode === 'requester' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(16, 185, 129, 0.5)',
                      background: activeMode === 'requester' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: activeMode === 'requester' ? 'var(--primary-light)' : 'var(--emerald)'
                    }}
                  >
                    <Repeat size={14} />
                    {activeMode === 'requester' ? 'Requester Mode' : 'Tasker Mode'}
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm"
                  style={{ flex: 1 }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          )}

          {!user && (

            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
