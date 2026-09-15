import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogIn, Lock, Mail, AlertCircle, GitMerge, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.user, res.data.token);
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="page-wrapper"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '85vh' }}
    >
      <div style={{ width: '100%', maxWidth: '440px', padding: '0 1.5rem' }}>

        {/* Brand mark */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
              marginBottom: '0.25rem',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(99,102,241,0.4)',
              }}
            >
              <GitMerge size={22} color="#fff" strokeWidth={2.2} />
            </div>
            <span
              style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #fff 30%, var(--primary-light) 70%, var(--cyan) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              TaskBridge
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          className="glass-card"
          style={{
            padding: '2.25rem 2rem',
            borderTop: '2px solid rgba(99, 102, 241, 0.5)',
          }}
        >
          <div style={{ marginBottom: '1.75rem' }}>
            <h2
              style={{
                fontSize: '1.55rem',
                fontWeight: 800,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '-0.02em',
                marginBottom: '0.35rem',
              }}
            >
              Welcome back
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>
              Sign in to manage your tasks or start fulfilling requests
            </p>
          </div>

          {error && (
            <div className="alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute', left: '12px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute', left: '12px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', justifyContent: 'center' }}
              disabled={submitting}
            >
              {submitting ? (
                'Authenticating...'
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-sub)',
            }}
          >
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--cyan)', fontWeight: 700 }}>
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
