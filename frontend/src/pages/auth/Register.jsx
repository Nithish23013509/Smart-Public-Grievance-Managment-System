import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', mobileNumber: '',
    password: '', confirmPassword: '', address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
    const result = await register({
      fullName: formData.fullName, email: formData.email,
      mobileNumber: formData.mobileNumber, password: formData.password, address: formData.address
    });
    if (result.success) { navigate('/login'); }
    else {
      let errStr = result.error;
      if (typeof errStr === 'object') errStr = Object.values(errStr).join(', ');
      setError(errStr); setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <div className="flag-stripe" style={{ height: '6px' }}>
        <div className="band-red"></div><div className="band-gold"></div><div className="band-red"></div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '580px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1rem',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', boxShadow: 'var(--shadow-primary)'
            }}>🏛️</div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)' }}>Citizen Registration</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Register to submit and track public grievances
            </p>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <ErrorMessage message={error} />
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Full Name *</label>
                  <input type="text" name="fullName" className="form-control"
                    value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" name="email" className="form-control"
                    value={formData.email} onChange={handleChange} placeholder="your.email@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input type="text" name="mobileNumber" className="form-control"
                    value={formData.mobileNumber} onChange={handleChange} placeholder="10-digit mobile number" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input type="password" name="password" className="form-control"
                    value={formData.password} onChange={handleChange} placeholder="Min 8 characters" required minLength="8" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input type="password" name="confirmPassword" className="form-control"
                    value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Address</label>
                  <textarea name="address" className="form-control" rows="2"
                    value={formData.address} onChange={handleChange} placeholder="Your residential address" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <button type="submit" className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }} disabled={loading}>
                    <UserPlus size={18} />
                    {loading ? 'Registering...' : 'Register as Citizen'}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Already registered? <Link to="/login" style={{ fontWeight: 600 }}>Login here</Link>
          </div>
          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>← Back to Home</Link>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
        © 2026 Smart Public Grievance Management System
      </div>
    </div>
  );
};

export default Register;
