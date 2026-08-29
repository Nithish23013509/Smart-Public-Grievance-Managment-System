import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Landmark, ShieldCheck, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'CITIZEN') navigate('/citizen/dashboard');
      else if (user.role === 'OFFICER') navigate('/officer/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      mobileNumber: formData.mobileNumber,
      password: formData.password,
      address: formData.address,
    });

    if (result.success) {
      navigate('/login');
    } else {
      let errStr = result.error;
      if (typeof errStr === 'object') errStr = Object.values(errStr).join(', ');
      setError(errStr);
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
        <div className="auth-panel reveal-in">
          <div className="auth-heading">
            <div className="official-seal official-seal--large">
              <Landmark size={30} strokeWidth={2.2} />
            </div>
            <div className="official-kicker auth-kicker">
              <ShieldCheck size={15} /> Verified Citizen Service
            </div>
            <h2>Citizen Registration</h2>
            <p>Register to submit and track public grievances</p>
          </div>

          <div className="card auth-card">
            <ErrorMessage message={error} />
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group col-span-2">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="text"
                    name="mobileNumber"
                    className="form-control"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 characters"
                    required
                    minLength="8"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
                <div className="form-group col-span-2">
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    className="form-control"
                    rows="2"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Your residential address"
                  />
                </div>
                <div className="col-span-2">
                  <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                    <UserPlus size={18} />
                    {loading ? 'Registering...' : 'Register as Citizen'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="auth-links">
            Already registered? <Link to="/login">Login here</Link>
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

export default Register;
