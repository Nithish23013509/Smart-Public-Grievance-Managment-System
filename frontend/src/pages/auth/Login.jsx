import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      const role = result.user.role;
      if (role === 'CITIZEN') navigate('/citizen/dashboard');
      else if (role === 'OFFICER') navigate('/officer/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      {/* Top flag stripe */}
      <div className="flag-stripe" style={{ height: '6px' }}>
        <div className="band-red"></div>
        <div className="band-gold"></div>
        <div className="band-red"></div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Government seal / logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1rem',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', boxShadow: 'var(--shadow-primary)'
            }}>🏛️</div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)' }}>Official Login</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Smart Public Grievance Management System
            </p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <ErrorMessage message={error} />

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="Enter your registered email" required />
              </div>
              
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
              </div>

              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', fontSize: '0.95rem' }}
                disabled={loading}>
                <LogIn size={18} />
                {loading ? 'Authenticating...' : 'Login to Portal'}
              </button>
            </form>
          </div>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            New citizen? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
          </div>
          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>← Back to Home</Link>
          </div>
        </div>
      </div>

      {/* Bottom stripe */}
      <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
        © 2026 Smart Public Grievance Management System
      </div>
    </div>
  );
};

export default Login;
