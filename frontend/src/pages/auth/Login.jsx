import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Landmark, LogIn, ShieldCheck } from 'lucide-react';

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
    <div className="auth-shell">
      <div className="flag-stripe" style={{ height: '6px' }}>
        <div className="band-red"></div>
        <div className="band-gold"></div>
        <div className="band-red"></div>
      </div>

      <div className="auth-stage">
        <div className="auth-panel auth-panel--compact reveal-in">
          <div className="auth-heading">
            <div className="official-seal official-seal--large">
              <Landmark size={30} strokeWidth={2.2} />
            </div>
            <div className="official-kicker auth-kicker">
              <ShieldCheck size={15} /> Secure Government Access
            </div>
            <h2>Official Login</h2>
            <p>Smart Public Grievance Management System</p>
          </div>

          <div className="card auth-card">
            <ErrorMessage message={error} />

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                <LogIn size={18} />
                {loading ? 'Authenticating...' : 'Login to Portal'}
              </button>
            </form>
          </div>

          <div className="auth-links">
            New citizen? <Link to="/register">Create an account</Link>
          </div>
          <div className="auth-back-link">
            <Link to="/">Back to Home</Link>
          </div>
        </div>
      </div>

      <div className="auth-footer">
        Copyright 2026 Smart Public Grievance Management System
      </div>
    </div>
  );
};

export default Login;
