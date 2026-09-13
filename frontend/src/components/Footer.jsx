import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'rgba(11, 15, 25, 0.95)',
        borderTop: '1px solid var(--border-color)',
        padding: '2.5rem 0 1.5rem',
        marginTop: 'auto',
        color: 'var(--text-sub)'
      }}
    >
      <div className="container">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ maxWidth: '400px' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
              Real-World Assistance & Verification Network
            </h4>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
              Connecting people who need physical location checks, store verifications, photo evidence, and local information gathering with trusted community taskers.
            </p>
          </div>

          <div>
            <h5 style={{ color: 'var(--text-main)', fontSize: '0.925rem', marginBottom: '0.75rem' }}>Platform Guidelines</h5>
            <ul style={{ listStyle: 'none', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>✔ Safe Local Verification</li>
              <li>✔ Physical Store & Stock Checks</li>
              <li>✔ Public Information & Photos</li>
              <li>✖ Prohibited Illegal Activities</li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: 'var(--text-main)', fontSize: '0.925rem', marginBottom: '0.75rem' }}>System Status</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emerald)' }}>
                <ShieldCheck size={16} /> Phase 1 Functional Foundation
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <Lock size={16} /> Secure JWT & Input Protection
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          © {new Date().getFullYear()} VeriTask Network. All rights reserved. Payment processing & maps integration scheduled for future phases.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
