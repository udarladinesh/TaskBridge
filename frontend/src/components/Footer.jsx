import React from 'react';
import { Link } from 'react-router-dom';
import { GitMerge, ShieldCheck, Lock, ExternalLink } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'rgba(6, 11, 24, 0.97)',
        borderTop: '1px solid rgba(148, 163, 184, 0.08)',
        padding: '3rem 0 1.75rem',
        marginTop: 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle top gradient accent */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.4) 30%, rgba(34,211,238,0.3) 70%, transparent 100%)',
        }}
      />

      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand Column */}
          <div style={{ maxWidth: '340px' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                textDecoration: 'none',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(99,102,241,0.35)',
                  flexShrink: 0,
                }}
              >
                <GitMerge size={18} color="#fff" strokeWidth={2.2} />
              </div>
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #fff 30%, var(--primary-light) 70%, var(--cyan) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                TaskBridge
              </span>
            </Link>
            <p
              style={{
                fontSize: '0.875rem',
                lineHeight: '1.7',
                color: 'var(--text-muted)',
                maxWidth: '280px',
              }}
            >
              Connecting people who need physical location checks, store verifications, photo evidence, and local information gathering with trusted community taskers.
            </p>
          </div>

          {/* Guidelines Column */}
          <div>
            <h5
              style={{
                color: 'var(--text-sub)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Platform Guidelines
            </h5>
            <ul style={{ listStyle: 'none', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                { icon: '✓', label: 'Safe Local Verification', ok: true },
                { icon: '✓', label: 'Physical Store & Stock Checks', ok: true },
                { icon: '✓', label: 'Public Information & Photos', ok: true },
                { icon: '✕', label: 'Prohibited Illegal Activities', ok: false },
              ].map(({ icon, label, ok }) => (
                <li
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: ok ? 'var(--text-sub)' : 'var(--text-muted)',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: ok ? 'var(--emerald)' : 'var(--rose)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {icon}
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* System Status Column */}
          <div>
            <h5
              style={{
                color: 'var(--text-sub)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              System Status
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.75rem',
                  color: 'var(--emerald-light)',
                }}
              >
                <ShieldCheck size={15} />
                <span>All Systems Operational</span>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--emerald)',
                    marginLeft: 'auto',
                    animation: 'pulse-dot 2s infinite',
                    flexShrink: 0,
                  }}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-muted)',
                  padding: '0.5rem 0.75rem',
                }}
              >
                <Lock size={14} />
                <span>Secure JWT & Input Protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(148, 163, 184, 0.06)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © {year} TaskBridge. All rights reserved.
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
            Payment processing & maps integration scheduled for future phases.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
