import React from 'react';

const LoadingSpinner = ({ fullPage = false, text = 'Loading...' }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.1rem',
        padding: '2.5rem',
      }}
    >
      {/* Dual-ring spinner */}
      <div style={{ position: 'relative', width: '44px', height: '44px' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: 'var(--primary)',
            borderRightColor: 'rgba(99,102,241,0.3)',
            animation: 'spin 0.85s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '6px',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'var(--cyan)',
            borderRightColor: 'rgba(34,211,238,0.2)',
            animation: 'spin 0.55s linear infinite reverse',
          }}
        />
      </div>
      <span
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          fontWeight: 500,
          letterSpacing: '0.01em',
        }}
      >
        {text}
      </span>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
