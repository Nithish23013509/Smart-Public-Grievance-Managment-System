import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { ClipboardList, Clock, CheckCircle, Shield, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const OfficerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await complaintService.getOfficerComplaints(null, 0, 10);
        if (response.success) {
          const content = response.data.content || [];
          setComplaints(content);
          let assigned = 0, inProg = 0, res = 0;
          content.forEach(c => {
            if (c.status === 'ASSIGNED') assigned++;
            if (c.status === 'IN_PROGRESS') inProg++;
            if (c.status === 'RESOLVED' || c.status === 'CLOSED') res++;
          });
          setStats({ assigned, inProgress: inProg, resolved: res });
        }
      } catch (err) { setError('Failed to load assigned complaints.'); }
      finally { setLoading(false); }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const urgentComplaints = complaints.filter(c => c.status === 'ASSIGNED');
  const otherComplaints = complaints.filter(c => c.status !== 'ASSIGNED');
  const firstName = user?.fullName?.split(' ')[0] || 'Officer';

  return (
    <div style={{ paddingBottom: '1rem' }}>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="mobile-only">
        {/* Curved gradient header */}
        <div className="mobile-hero mobile-hero--officer">
          <div className="greeting-sub">Field Officer Portal</div>
          <h1>{getGreeting()}, {firstName}! 🛡️</h1>
          <p>{user?.departmentName || 'Department Operations'}</p>
        </div>

        {/* Stats pills */}
        <div className="mobile-stats-row" style={{ marginTop: '-0.75rem', position: 'relative', zIndex: 2 }}>
          <div className="mobile-stat-pill" style={{ borderBottom: '3px solid #ef4444' }}>
            <div className="stat-number" style={{ color: '#ef4444' }}>{stats.assigned}</div>
            <div className="stat-label">New</div>
          </div>
          <div className="mobile-stat-pill" style={{ borderBottom: '3px solid #f59e0b' }}>
            <div className="stat-number" style={{ color: '#f59e0b' }}>{stats.inProgress}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="mobile-stat-pill" style={{ borderBottom: '3px solid #10b981' }}>
            <div className="stat-number" style={{ color: '#10b981' }}>{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>

        <ErrorMessage message={error} />

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
          <Link to="/officer/ai-review" className="mobile-action-btn">
            <div className="action-icon" style={{ background: 'rgba(166,20,22,0.1)', color: 'var(--color-primary)' }}>
              <Sparkles size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h3>AI Review Queue</h3>
              <p>Review AI-categorized complaints</p>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--color-text-muted)' }} />
          </Link>
        </div>

        {/* Priority Queue */}
        {urgentComplaints.length > 0 && (
          <>
            <div className="mobile-section-header">
              <h2 style={{ color: '#b91c1c' }}>⚠️ Priority Queue</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {urgentComplaints.map(c => (
                <Link key={c.id} to={`/officer/complaints/${c.id}`} className="mobile-complaint-card" style={{ borderLeft: '4px solid #ef4444' }}>
                  <div className="complaint-card-header">
                    <div className="complaint-card-title">{c.title}</div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="complaint-card-meta">
                    <span>#{c.complaintNumber}</span>
                    <span>•</span>
                    <span>{c.districtName}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Active workspace */}
        <div className="mobile-section-header">
          <h2>Active Cases</h2>
        </div>
        {otherComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            No other active complaints.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {otherComplaints.map(c => (
              <Link key={c.id} to={`/officer/complaints/${c.id}`} className="mobile-complaint-card">
                <div className="complaint-card-header">
                  <div className="complaint-card-title">{c.title}</div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="complaint-card-meta">
                  <span>#{c.complaintNumber}</span>
                  <span>•</span>
                  <span>{c.districtName}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ===== DESKTOP LAYOUT (unchanged) ===== */}
      <div className="desktop-hero">
        {/* Department Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          color: '#fff',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(30, 58, 138, 0.3)'
        }}>
          <div style={{ position: 'absolute', top: '-10px', right: '20px', opacity: 0.1, transform: 'rotate(-10deg)' }}>
            <Shield size={160} />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#93c5fd' }}>
              <ClipboardList size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Field Officer Portal</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              {user?.departmentName || 'Department Operations'}
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', maxWidth: '500px', lineHeight: 1.5 }}>
              Welcome back, {user?.fullName}. You currently have <strong style={{ color: '#fff' }}>{stats.assigned} new grievances</strong> requiring immediate attention.
            </p>
          </div>
        </div>

        <ErrorMessage message={error} />

        {/* Action Metrics */}
        <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2.5rem' }}>
          {[
            { label: 'Requires Action (New)', value: stats.assigned, color: '#ef4444', icon: <AlertTriangle size={24} />, bg: '#fef2f2' },
            { label: 'Work In Progress', value: stats.inProgress, color: '#f59e0b', icon: <Clock size={24} />, bg: '#fffbeb' },
            { label: 'Successfully Resolved', value: stats.resolved, color: '#10b981', icon: <CheckCircle size={24} />, bg: '#ecfdf5' },
          ].map((s, i) => (
            <div key={i} className="card card-hover" style={{ borderLeft: `5px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ background: s.bg, color: s.color, padding: '1rem', borderRadius: '50%' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', marginTop: '0.25rem' }}>
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Priority Queue */}
        <div className="grid grid-cols-1 gap-6" style={{ marginBottom: '2rem' }}>
          {urgentComplaints.length > 0 && (
            <div className="card" style={{ border: '2px solid rgba(239, 68, 68, 0.2)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ef4444' }}></div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} /> Priority Queue
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {urgentComplaints.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.25rem' }}>{c.title}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#b91c1c', opacity: 0.8, display: 'flex', gap: '1rem' }}>
                        <span>#{c.complaintNumber}</span>
                        <span>{c.districtName}</span>
                      </div>
                    </div>
                    <Link to={`/officer/complaints/${c.id}`} className="btn btn-primary" style={{ background: '#ef4444', boxShadow: 'none' }}>Take Action</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Active Workspace</h2>
            {otherComplaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
                No other active complaints.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '800px' }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'transparent', borderBottom: '2px solid var(--color-border)' }}>Complaint ID</th>
                      <th style={{ background: 'transparent', borderBottom: '2px solid var(--color-border)' }}>Title</th>
                      <th style={{ background: 'transparent', borderBottom: '2px solid var(--color-border)' }}>Location</th>
                      <th style={{ background: 'transparent', borderBottom: '2px solid var(--color-border)' }}>Status</th>
                      <th style={{ background: 'transparent', borderBottom: '2px solid var(--color-border)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherComplaints.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.complaintNumber}</td>
                        <td style={{ fontWeight: 500 }}>{c.title}</td>
                        <td style={{ color: 'var(--color-text-muted)' }}>{c.districtName}</td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>
                          <Link to={`/officer/complaints/${c.id}`} style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)' }}>
                            Manage <ArrowRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
