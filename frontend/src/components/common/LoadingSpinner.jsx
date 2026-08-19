import React from 'react';

const LoadingSpinner = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
      <div style={{
        width: '42px', height: '42px',
        border: '4px solid rgba(166, 20, 22, 0.15)',
        borderLeftColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }}></div>
      <span style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Loading...</span>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
