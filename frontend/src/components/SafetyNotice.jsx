import React from 'react';
import { ShieldAlert } from 'lucide-react';

const SafetyNotice = () => {
  return (
    <div className="safety-notice-box">
      <h4>
        <ShieldAlert size={20} /> Community Safety & Verification Notice
      </h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '0.5rem' }}>
        This network is exclusively for legitimate physical verification, public information collection, and authorized local assistance.
      </p>
      <ul>
        <li>STRICTLY PROHIBITED: Weapons, drugs, stalking, secret surveillance, or trespassing.</li>
        <li>DO NOT request illegal acts, accessing private accounts, or collecting non-public personal data.</li>
        <li>All task activities and uploaded proofs are subject to community reports and administrative moderation.</li>
      </ul>
    </div>
  );
};

export default SafetyNotice;
