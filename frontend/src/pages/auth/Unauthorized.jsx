import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <div className="flag-stripe" style={{ height: '6px' }}>
        <div className="band-red"></div><div className="band-gold"></div><div className="band-red"></div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '420px', padding: '3rem 2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1.25rem',
            background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <AlertTriangle size={32} color="var(--color-warning)" />
          </div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text)' }}>Access Denied</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
            You do not have the required permissions to access this section. Please log in with the correct role.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
