import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatar';
import NotificationDropdown from './NotificationDropdown';
import {
  GitMerge,
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: isActive(path) ? 'var(--cyan)' : 'var(--text-sub)',
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: '0.4rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    transition: 'all var(--transition-fast)',
    background: isActive(path) ? 'rgba(34, 211, 238, 0.08)' : 'transparent',
    textDecoration: 'none',
  });

  return (
    <header
      style={{
        background: scrolled
          ? 'rgba(6, 11, 24, 0.92)'
          : 'rgba(8, 13, 26, 0.8)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: scrolled
          ? '1px solid rgba(99, 102, 241, 0.15)'
          : '1px solid rgba(148, 163, 184, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div
        className="container"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}
      >
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', textDecoration: 'none', flexShrink: 0 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 50%, var(--cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)',
              flexShrink: 0,
            }}
          >
            <GitMerge size={22} color="#fff" strokeWidth={2.2} />
          </div>
          <div>
            <span
              style={{
                fontSize: '1.22rem',
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.03em',
                display: 'block',
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, #fff 30%, var(--primary-light) 70%, var(--cyan) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              TaskBridge
            </span>
            <span
              style={{
                fontSize: '0.6rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'block',
                marginTop: '1px',
              }}
            >
              Task Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="desktop-nav">
          <Link to="/browse" style={navLinkStyle('/browse')}>
            <Search size={16} /> Browse Tasks
          </Link>

          {user && user.role !== 'admin' && (
            <>
              {activeMode === 'requester' && (
                <Link to="/create-task" style={navLinkStyle('/create-task')}>
                  <PlusCircle size={16} /> Post Task
                </Link>
              )}
              <Link to="/dashboard" style={navLinkStyle('/dashboard')}>
                <LayoutDashboard size={16} /> Dashboard
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
                color: 'var(--rose-light)',
                fontWeight: 700,
                fontSize: '0.85rem',
                background: 'rgba(244, 63, 94, 0.1)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                textDecoration: 'none',
              }}
            >
              <ShieldAlert size={15} /> Admin Portal
            </Link>
          )}
        </nav>

        {/* Right side — Desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }} className="desktop-nav">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {/* Mode Toggle */}
              {user.role !== 'admin' && (
                <button
                  onClick={toggleActiveMode}
                  title="Switch between Requester and Tasker mode"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.38rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: activeMode === 'requester'
                      ? '1px solid rgba(99, 102, 241, 0.45)'
                      : '1px solid rgba(16, 185, 129, 0.45)',
                    background: activeMode === 'requester'
                      ? 'rgba(99, 102, 241, 0.12)'
                      : 'rgba(16, 185, 129, 0.12)',
                    color: activeMode === 'requester' ? 'var(--primary-light)' : 'var(--emerald-light)',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.01em',
                  }}
                >
                  <Repeat size={12} />
                  {activeMode === 'requester' ? 'Requester' : 'Tasker'}
                </button>
              )}

              {/* Wallet */}
              {user.role !== 'admin' && (
                <Link
                  to="/wallet"
                  title="View Wallet & Escrow Ledger"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    textDecoration: 'none',
                    background: isActive('/wallet')
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                    padding: '0.38rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isActive('/wallet')
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Wallet size={15} color="var(--emerald-light)" />
                  <span>₹{(user.walletBalance ?? 5000).toLocaleString('en-IN')}</span>
                </Link>
              )}

              {/* Notifications */}
              <NotificationDropdown />

              {/* Profile */}
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  textDecoration: 'none',
                  background: isActive('/profile')
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  padding: '0.35rem 0.85rem 0.35rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  border: isActive('/profile')
                    ? '1px solid rgba(99, 102, 241, 0.4)'
                    : '1px solid var(--border-color)',
                  transition: 'all 0.15s ease',
                }}
              >
                <img
                  src={getAvatarUrl(user.profileImage, user.name)}
                  alt={user.name}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid rgba(99, 102, 241, 0.5)',
                  }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {user.name.split(' ')[0]}
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Logout"
                style={{ color: 'var(--rose-light)', padding: '0.42rem 0.65rem' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem',
            cursor: 'pointer',
            color: 'var(--text-main)',
            transition: 'all var(--transition-fast)',
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu"
          style={{
            background: 'rgba(6, 11, 24, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--border-color)',
            padding: '1rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            animation: 'fadeInUp 0.2s ease both',
          }}
        >
          {[
            { to: '/browse', icon: <Search size={17} />, label: 'Browse Tasks' },
          ].map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.7rem 0.5rem',
                color: isActive(to) ? 'var(--cyan)' : 'var(--text-sub)',
                fontWeight: 600,
                fontSize: '0.925rem',
                borderBottom: '1px solid var(--border-subtle)',
                textDecoration: 'none',
              }}
            >
              {icon} {label}
            </Link>
          ))}

          {user && (
            <>
              {user.role !== 'admin' && (
                <>
                  {activeMode === 'requester' && (
                    <Link
                      to="/create-task"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.65rem',
                        padding: '0.7rem 0.5rem',
                        color: isActive('/create-task') ? 'var(--cyan)' : 'var(--text-sub)',
                        fontWeight: 600, fontSize: '0.925rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        textDecoration: 'none',
                      }}
                    >
                      <PlusCircle size={17} /> Post a Task
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      padding: '0.7rem 0.5rem',
                      color: isActive('/dashboard') ? 'var(--cyan)' : 'var(--text-sub)',
                      fontWeight: 600, fontSize: '0.925rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      textDecoration: 'none',
                    }}
                  >
                    <LayoutDashboard size={17} /> Dashboard
                  </Link>
                  <Link
                    to="/wallet"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      padding: '0.7rem 0.5rem',
                      color: isActive('/wallet') ? 'var(--cyan)' : 'var(--text-sub)',
                      fontWeight: 600, fontSize: '0.925rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      textDecoration: 'none',
                    }}
                  >
                    <Wallet size={17} /> Wallet (₹{(user.walletBalance ?? 5000).toLocaleString('en-IN')})
                  </Link>
                </>
              )}
              <Link
                to="/profile"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  padding: '0.7rem 0.5rem',
                  color: isActive('/profile') ? 'var(--cyan)' : 'var(--text-sub)',
                  fontWeight: 600, fontSize: '0.925rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  textDecoration: 'none',
                }}
              >
                <User size={17} /> Profile
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.65rem',
                    padding: '0.7rem 0.5rem',
                    color: 'var(--rose-light)',
                    fontWeight: 700, fontSize: '0.925rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                  }}
                >
                  <ShieldAlert size={17} /> Admin Portal
                </Link>
              )}

              <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.85rem', flexWrap: 'wrap' }}>
                {user.role !== 'admin' && (
                  <button
                    onClick={toggleActiveMode}
                    style={{
                      flex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: activeMode === 'requester'
                        ? '1px solid rgba(99, 102, 241, 0.5)'
                        : '1px solid rgba(16, 185, 129, 0.5)',
                      background: activeMode === 'requester'
                        ? 'rgba(99, 102, 241, 0.12)'
                        : 'rgba(16, 185, 129, 0.12)',
                      color: activeMode === 'requester' ? 'var(--primary-light)' : 'var(--emerald-light)',
                    }}
                  >
                    <Repeat size={13} />
                    {activeMode === 'requester' ? 'Requester Mode' : 'Tasker Mode'}
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="btn btn-danger btn-sm"
                  style={{ flex: 1 }}
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </>
          )}

          {!user && (
            <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.85rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
