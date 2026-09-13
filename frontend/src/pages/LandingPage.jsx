import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, PlusCircle, CheckCircle2, MapPin, Eye, Camera, Lock, ArrowRight } from 'lucide-react';
import SafetyNotice from '../components/SafetyNotice';

const LandingPage = () => {
  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Hero Section */}
        <section
          style={{
            textAlign: 'center',
            padding: '4rem 1rem 3rem',
            maxWidth: '900px',
            margin: '0 auto'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '9999px',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: 'var(--cyan)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1.5rem'
            }}
          >
            <ShieldCheck size={18} /> Real-World Verification & Assistance Platform
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              lineHeight: '1.15',
              fontWeight: 800,
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Can’t be there physically? <br />
            <span style={{ color: 'var(--cyan)', WebkitTextFillColor: 'initial' }}>
              Request a trusted local tasker.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-sub)',
              lineHeight: '1.6',
              marginBottom: '2.5rem',
              maxWidth: '750px',
              margin: '0 auto 2.5rem'
            }}
          >
            Connect with nearby people to verify product stock, take public photos, check store opening hours, collect official information, or perform simple local tasks on your behalf.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/browse" className="btn btn-cyan btn-lg">
              <Search size={20} /> Browse Available Tasks
            </Link>
            <Link to="/create-task" className="btn btn-primary btn-lg">
              <PlusCircle size={20} /> Post a Task Now
            </Link>
          </div>
        </section>

        {/* Use Case Cards Grid */}
        <section style={{ margin: '4rem 0' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '2.5rem' }}>
            Common Real-World Tasks
          </h2>

          <div className="grid-4">
            <div className="glass-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--cyan)' }}>
                <Eye size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Store Product Verification</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>
                Check if a specific store in another city has your required laptop, medical item, or electronics in stock with price confirmation.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>
                <Camera size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Location Photography</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>
                Obtain fresh, date-stamped photographic proof of publicly accessible venues, event sites, parks, or storefronts.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--emerald)' }}>
                <MapPin size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Public Info Collection</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>
                Gather printed bus timetables, college notice board announcements, or public parking fee charts accurately.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--amber)' }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Authorized Item Pickups</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>
                Arrange pick up of non-sensitive diagnostic reports, brochures, or pre-paid store items from authorized desks.
              </p>
            </div>
          </div>
        </section>

        {/* Controlled Workflow Stepper */}
        <section className="glass-card" style={{ padding: '3rem 2rem', margin: '4rem 0' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '2.5rem' }}>
            Controlled End-to-End Task Lifecycle
          </h2>

          <div className="grid-4" style={{ textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>1</div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Create Task</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)' }}>Requester posts task details, deadline, reward & proof requirements.</p>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cyan)', marginBottom: '0.5rem' }}>2</div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Accept & Start</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)' }}>Tasker accepts the task atomically and marks it IN_PROGRESS.</p>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--purple)', marginBottom: '0.5rem' }}>3</div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Submit Proof</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)' }}>Tasker uploads completion proof files and notes for review.</p>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald)', marginBottom: '0.5rem' }}>4</div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Approve & Rate</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-sub)' }}>Requester approves completion and both leave mutual ratings.</p>
            </div>
          </div>
        </section>

        {/* Safety Disclaimer Banner */}
        <SafetyNotice />
      </div>
    </div>
  );
};

export default LandingPage;
