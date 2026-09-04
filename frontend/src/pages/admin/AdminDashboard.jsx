import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Activity, Users, Building, ShieldCheck, TrendingUp, AlertCircle, Server, CheckCircle2, ArrowRight } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, submitted: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await complaintService.getAllComplaints(0, 10);
        if (response.success) {
          const content = response.data.content || [];
          setComplaints(content);
          let sub = 0, ass = 0, inProg = 0, res = 0, cls = 0;
          content.forEach(c => {
            if (c.status === 'SUBMITTED') sub++;
            if (c.status === 'ASSIGNED') ass++;
            if (c.status === 'IN_PROGRESS') inProg++;
            if (c.status === 'RESOLVED') res++;
            if (c.status === 'CLOSED') cls++;
          });
          setStats({ total: response.data.totalElements || content.length, submitted: sub, assigned: ass, inProgress: inProg, resolved: res, closed: cls });
        }
      } catch (err) { setError('Failed to load system complaints.'); }
      finally { setLoading(false); }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const firstName = user?.fullName?.split(' ')[0] || 'Admin';

  return (
    <div style={{ paddingBottom: '1rem' }}>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="mobile-only">
        {/* Curved gradient header */}
        <div className="mobile-hero mobile-hero--admin">
          <div className="greeting-sub">⚡ Command Center</div>
          <h1>{getGreeting()}, {firstName}!</h1>
          <p>System-wide grievance monitoring & management.</p>
        </div>

        {/* Stats in 2x2 grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem', marginTop: '-0.75rem',
          position: 'relative', zIndex: 2
        }}>
          {[
            { label: 'Total', value: stats.total, color: 'var(--color-primary)' },
            { label: 'Unassigned', value: stats.submitted, color: '#ef4444' },
            { label: 'Processing', value: stats.assigned + stats.inProgress, color: '#3b82f6' },
            { label: 'Resolved', value: stats.resolved + stats.closed, color: '#10b981' },
          ].map((s, i) => (
            <div key={i} className="mobile-stat-pill" style={{ borderBottom: `3px solid ${s.color}` }}>
              <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <ErrorMessage message={error} />

        {/* Management Modules */}
        <div className="mobile-section-header">
          <h2>Management</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/admin/complaints" className="mobile-action-btn">
            <div className="action-icon" style={{ background: 'rgba(166,20,22,0.1)', color: 'var(--color-primary)' }}>
              <Activity size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h3>Assign Complaints</h3>
              <p>Route unassigned grievances</p>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--color-text-muted)' }} />
          </Link>
          <Link to="/admin/users" className="mobile-action-btn">
            <div className="action-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
              <Users size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h3>Manage Users</h3>
              <p>Officer accounts & citizens</p>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--color-text-muted)' }} />
          </Link>
          <Link to="/admin/departments" className="mobile-action-btn">
            <div className="action-icon" style={{ background: 'rgba(244,192,34,0.15)', color: 'var(--color-secondary-dark)' }}>
              <Building size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h3>Departments</h3>
              <p>Configure routing nodes</p>
            </div>
            <ArrowRight size={16} style={{ color: 'var(--color-text-muted)' }} />
          </Link>
        </div>

        {/* Recent Activity as cards */}
        <div className="mobile-section-header">
          <h2>Recent Activity</h2>
          <Link to="/admin/complaints">View All</Link>
        </div>
        {complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            No complaints in the system.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {complaints.slice(0, 5).map(c => (
              <Link key={c.id} to={`/admin/complaints/${c.id}`} className="mobile-complaint-card">
                <div className="complaint-card-header">
                  <div className="complaint-card-title">{c.title}</div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="complaint-card-meta">
                  <span>#{c.complaintNumber}</span>
                  <span>•</span>
                  <span>{c.departmentName || 'Pending'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ===== DESKTOP LAYOUT (unchanged) ===== */}
      <div className="desktop-hero">
        {/* Control Center Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          color: '#fff',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.4)'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, transform: 'rotate(15deg)' }}>
            <Server size={180} />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-secondary)' }}>
                <ShieldCheck size={20} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Command Center</span>
              </div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                System Overview
              </h1>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', lineHeight: 1.5 }}>
                Monitor government-wide grievance resolution, manage department assignments, and oversee AI performance in real-time.
              </p>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>System Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4ade80', fontWeight: 600, fontSize: '1.1rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }}></div>
                All Systems Operational
              </div>
            </div>
          </div>
        </div>

        <ErrorMessage message={error} />

        {/* Metric Highlights Grid */}
        <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Complaints', value: stats.total, color: 'var(--color-primary)', icon: <Activity size={24} /> },
            { label: 'New (Unassigned)', value: stats.submitted, color: '#ef4444', icon: <AlertCircle size={24} /> },
            { label: 'Active Processing', value: stats.assigned + stats.inProgress, color: '#3b82f6', icon: <TrendingUp size={24} /> },
            { label: 'Resolved / Closed', value: stats.resolved + stats.closed, color: '#10b981', icon: <CheckCircle2 size={24} /> },
          ].map((s, i) => (
            <div key={i} className="card card-hover" style={{ borderBottom: `4px solid ${s.color}`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ background: `${s.color}15`, padding: '0.75rem', borderRadius: 'var(--radius-md)', color: s.color }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)' }}>{s.value}</div>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access Panels */}
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Management Modules</h2>
        <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2.5rem' }}>
          <Link to="/admin/complaints" className="card card-hover" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(166,20,22,0.1)', color: 'var(--color-primary)', padding: '0.75rem', borderRadius: '50%' }}><Activity size={24} /></div>
            <div><h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>Assign Complaints</h3><p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Route unassigned grievances</p></div>
          </Link>
          <Link to="/admin/users" className="card card-hover" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '0.75rem', borderRadius: '50%' }}><Users size={24} /></div>
            <div><h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>Manage Users</h3><p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Officer accounts & citizens</p></div>
          </Link>
          <Link to="/admin/departments" className="card card-hover" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(244,192,34,0.15)', color: 'var(--color-secondary-dark)', padding: '0.75rem', borderRadius: '50%' }}><Building size={24} /></div>
            <div><h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)' }}>Departments</h3><p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Configure routing nodes</p></div>
          </Link>
        </div>

        {/* Recent Activity Table */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent System Activity</h2>
            <Link to="/admin/complaints" className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>View All Registry</Link>
          </div>
          
          {complaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>No complaints in the system.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'transparent', borderBottom: '2px solid var(--color-border)' }}>ID</th>
                    <th style={{ background: 'transparent', borderBottom: '2px solid var(--color-border)' }}>Grievance Title</th>
                    <th style={{ background: 'transparent', borderBottom: '2px solid var(--color-border)' }}>Assigned Department</th>
                    <th style={{ background: 'transparent', borderBottom: '2px solid var(--color-border)' }}>Status</th>
                    <th style={{ background: 'transparent', borderBottom: '2px solid var(--color-border)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>#{c.complaintNumber}</td>
                      <td style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text)' }}>{c.title}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#f0f1f3', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          <Building size={12} /> {c.departmentName || 'Pending Assignment'}
                        </div>
                      </td>
                      <td><StatusBadge status={c.status} /></td>
                      <td><Link to={`/admin/complaints/${c.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Manage</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
