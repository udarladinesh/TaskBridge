import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  CheckCircle2,
  MapPin,
  Eye,
  Camera,
  Lock,
  ArrowRight,
  Zap,
  Users,
  Star,
} from 'lucide-react';
import SafetyNotice from '../components/SafetyNotice';

const useCases = [
  {
    icon: <Eye size={22} />,
    title: 'Store Product Verification',
    desc: 'Check if a specific store in another city has your required laptop, medical item, or electronics in stock with price confirmation.',
    color: 'var(--cyan)',
    bg: 'rgba(34, 211, 238, 0.1)',
    border: 'rgba(34, 211, 238, 0.2)',
  },
  {
    icon: <Camera size={22} />,
    title: 'Location Photography',
    desc: 'Obtain fresh, date-stamped photographic proof of publicly accessible venues, event sites, parks, or storefronts.',
    color: 'var(--primary-light)',
    bg: 'rgba(99, 102, 241, 0.1)',
    border: 'rgba(99, 102, 241, 0.2)',
  },
  {
    icon: <MapPin size={22} />,
    title: 'Public Info Collection',
    desc: 'Gather printed bus timetables, college notice board announcements, or public parking fee charts accurately.',
    color: 'var(--emerald-light)',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: 'Authorized Item Pickups',
    desc: 'Arrange pick up of non-sensitive diagnostic reports, brochures, or pre-paid store items from authorized desks.',
    color: 'var(--amber-light)',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
  },
];

const steps = [
  {
    num: '01',
    title: 'Create Task',
    desc: 'Requester posts task details, deadline, reward & proof requirements.',
    color: 'var(--primary)',
    bg: 'rgba(99, 102, 241, 0.12)',
  },
  {
    num: '02',
    title: 'Accept & Start',
    desc: 'Tasker accepts the task atomically and marks it IN_PROGRESS.',
    color: 'var(--cyan)',
    bg: 'rgba(34, 211, 238, 0.12)',
  },
  {
    num: '03',
    title: 'Submit Proof',
    desc: 'Tasker uploads completion proof files and notes for review.',
    color: 'var(--purple-light)',
    bg: 'rgba(168, 85, 247, 0.12)',
  },
  {
    num: '04',
    title: 'Approve & Rate',
    desc: 'Requester approves completion and both leave mutual ratings.',
    color: 'var(--emerald-light)',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
];

const stats = [
  { icon: <Zap size={18} />, value: 'Real-Time', label: 'Verification', color: 'var(--cyan)' },
  { icon: <Users size={18} />, value: 'Dual-Role', label: 'System', color: 'var(--primary-light)' },
  { icon: <Star size={18} />, value: 'Peer-Rated', label: 'Taskers', color: 'var(--amber-light)' },
  { icon: <ShieldCheck size={18} />, value: 'Escrow', label: 'Protected', color: 'var(--emerald-light)' },
];

const LandingPage = () => {
  return (
    <div className="page-wrapper">
      <div className="container">

        {/* ── Hero ───────────────────────────────── */}
        <section
          style={{
            textAlign: 'center',
            padding: '4.5rem 1rem 3.5rem',
            maxWidth: '860px',
            margin: '0 auto',
          }}
        >
          {/* Floating badge */}
          <div className="hero-badge" style={{ marginBottom: '1.75rem' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--cyan)',
                display: 'inline-block',
                animation: 'pulse-dot 1.6s infinite',
                flexShrink: 0,
              }}
            />
            <ShieldCheck size={15} />
            Real-World Verification & Assistance Platform
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
              lineHeight: '1.12',
              fontWeight: 800,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.04em',
              marginBottom: '1.5rem',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #fff 20%, #e2e8f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Can't be there physically?
            </span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, var(--cyan) 0%, var(--primary-light) 60%, var(--purple-light) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Request a trusted local tasker.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-sub)',
              lineHeight: '1.7',
              maxWidth: '680px',
              margin: '0 auto 2.75rem',
            }}
          >
            Connect with nearby people to verify product stock, take public photos, check store opening hours, collect official information, or perform simple local tasks on your behalf.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '3.5rem',
            }}
          >
            <Link to="/browse" className="btn btn-cyan btn-lg">
              <Search size={19} /> Browse Tasks
              <ArrowRight size={17} />
            </Link>
            <Link to="/create-task" className="btn btn-primary btn-lg">
              <PlusCircle size={19} /> Post a Task
            </Link>
          </div>

          {/* Stats Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px',
              background: 'var(--border-color)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-card)',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            {stats.map(({ icon, value, label, color }) => (
              <div
                key={label}
                style={{
                  background: 'var(--bg-card)',
                  padding: '1rem 0.75rem',
                  textAlign: 'center',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ color, marginBottom: '0.3rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>{value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Use Case Cards ──────────────────────── */}
        <section style={{ margin: '3rem 0 4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                marginBottom: '0.5rem',
              }}
            >
              Common Real-World Tasks
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Everything that needs boots on the ground — done remotely.
            </p>
          </div>

          <div className="grid-4">
            {useCases.map(({ icon, title, desc, color, bg, border }) => (
              <div
                key={title}
                className="glass-card"
                style={{
                  borderTop: `2px solid ${color}`,
                  transition: 'all 0.25s ease',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-md)',
                    background: bg,
                    border: `1px solid ${border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.1rem',
                    color,
                  }}
                >
                  {icon}
                </div>
                <h3
                  style={{
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    marginBottom: '0.55rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: '0.865rem', color: 'var(--text-sub)', lineHeight: '1.6' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Process Stepper ─────────────────────── */}
        <section
          className="glass-card"
          style={{
            padding: '3rem 2.5rem',
            margin: '0 0 4rem',
            borderTop: '2px solid transparent',
            backgroundImage: `
              linear-gradient(var(--bg-card), var(--bg-card)),
              linear-gradient(135deg, rgba(99,102,241,0.4), rgba(34,211,238,0.3))
            `,
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <h2
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                marginBottom: '0.5rem',
              }}
            >
              Controlled End-to-End Task Lifecycle
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              From posting to approval — every step is transparent and accountable.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              position: 'relative',
            }}
          >
            {steps.map(({ num, title, desc, color, bg }, idx) => (
              <div key={num} style={{ textAlign: 'center', position: 'relative' }}>
                {/* Connecting line (desktop) */}
                {idx < steps.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '24px',
                      left: 'calc(50% + 32px)',
                      right: 'calc(-50% + 32px)',
                      height: '1px',
                      background: `linear-gradient(90deg, ${color}, rgba(148,163,184,0.1))`,
                      zIndex: 0,
                      display: 'block',
                    }}
                  />
                )}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: bg,
                    border: `2px solid ${color}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: `0 0 20px ${color.replace(')', ', 0.25)').replace('var(', 'rgba(')}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {num}
                  </span>
                </div>
                <h4
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {title}
                </h4>
                <p style={{ fontSize: '0.835rem', color: 'var(--text-sub)', lineHeight: '1.55' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety Disclaimer */}
        <SafetyNotice />
      </div>
    </div>
  );
};

export default LandingPage;
