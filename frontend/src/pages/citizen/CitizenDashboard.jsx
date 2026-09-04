import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, Clock, CheckCircle2, ChevronRight, LayoutDashboard, Sparkles, ArrowRight } from 'lucide-react';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { AuthContext } from '../../context/AuthContext';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const CitizenDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await complaintService.getMyComplaints(0, 5);
        if (response.success) {
          const content = response.data.content || [];
          setRecentComplaints(content);
          let inProg = 0, res = 0, cls = 0;
          content.forEach(c => {
            if (c.status === 'IN_PROGRESS') inProg++;
            if (c.status === 'RESOLVED') res++;
            if (c.status === 'CLOSED') cls++;
          });
          setStats({ total: response.data.totalElements || content.length, inProgress: inProg, resolved: res, closed: cls });
        }
      } catch (err) { setError('Failed to load dashboard data.'); }
      finally { setLoading(false); }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const firstName = user?.fullName?.split(' ')[0] || 'Citizen';

  return (
    <div style={{ paddingBottom: '1rem' }}>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="mobile-only">
        {/* Curved gradient header */}
        <div className="mobile-hero">
          <div className="greeting-sub">Smart Grievance Portal</div>
          <h1>{getGreeting()}, {firstName}! 👋</h1>
          <p>Track your grievances and submit new issues quickly.</p>
        </div>

        {/* Floating action card */}
        <div className="mobile-float-card">
          <Link to="/citizen/complaints/new" style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1rem', borderRadius: '14px', textDecoration: 'none',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            color: '#fff', boxShadow: '0 4px 16px rgba(166, 20, 22, 0.3)',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <PlusCircle size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>File New Grievance</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>AI-powered smart routing</div>
            </div>
            <ArrowRight size={20} style={{ opacity: 0.7 }} />
          </Link>
        </div>

        {/* Stats pills */}
        <div className="mobile-stats-row">
          <div className="mobile-stat-pill">
            <div className="stat-number" style={{ color: 'var(--color-primary)' }}>{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="mobile-stat-pill">
            <div className="stat-number" style={{ color: 'var(--color-warning)' }}>{stats.inProgress}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="mobile-stat-pill">
            <div className="stat-number" style={{ color: 'var(--color-success)' }}>{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="mobile-stat-pill">
            <div className="stat-number" style={{ color: '#6b7280' }}>{stats.closed}</div>
            <div className="stat-label">Closed</div>
          </div>
        </div>

        <ErrorMessage message={error} />

        {/* Recent complaints - horizontal scroll */}
        <div className="mobile-section-header">
          <h2>Recent Activity</h2>
          <Link to="/citizen/complaints">View All</Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
            <FileText size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.3rem' }}>No grievances yet</h3>
            <p style={{ fontSize: '0.85rem' }}>Tap the + button to submit your first complaint.</p>
          </div>
        ) : (
          <div className="horizontal-scroll">
            {recentComplaints.map(c => (
              <Link key={c.id} to={`/citizen/complaints/${c.id}`} className="horizontal-scroll-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>#{c.complaintNumber}</span>
                  <StatusBadge status={c.status} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem', lineHeight: 1.3, color: 'var(--color-text)' }}>
                  {c.title.length > 40 ? c.title.substring(0, 40) + '…' : c.title}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <span>{c.categoryName}</span>
                  <span>•</span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="mobile-section-header" style={{ marginTop: '1.5rem' }}>
          <h2>Quick Actions</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/citizen/complaints" className="mobile-action-btn">
            <div className="action-icon" style={{ background: 'rgba(244,192,34,0.15)', color: 'var(--color-secondary-dark)' }}>
              <FileText size={20} />
            </div>
            <div>
              <h3>Track Complaints</h3>
              <p>View status of your {stats.total} submissions</p>
            </div>
          </Link>
          <Link to="/citizen/notifications" className="mobile-action-btn">
            <div className="action-icon" style={{ background: 'rgba(43,108,176,0.1)', color: 'var(--color-info)' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3>Notifications</h3>
              <p>Check updates on your grievances</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (unchanged) ===== */}
      <div className="desktop-hero">
        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          color: '#fff',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-primary)'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, transform: 'rotate(15deg)' }}>
            <Sparkles size={160} />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Welcome back, {firstName}!
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', maxWidth: '500px', lineHeight: 1.5 }}>
              Your central hub for tracking civic grievances. Submit issues quickly and let our AI route them directly to the right department.
            </p>
          </div>
        </div>

        <ErrorMessage message={error} />

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2.5rem' }}>
          <Link to="/citizen/complaints/new" className="card card-hover" style={{ 
            display: 'flex', alignItems: 'center', gap: '1.5rem', 
            background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%)',
            color: '#fff', textDecoration: 'none', border: 'none'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '50%' }}>
              <PlusCircle size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.2rem' }}>File New Grievance</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Report a new issue in your area</p>
            </div>
          </Link>

          <Link to="/citizen/complaints" className="card card-hover" style={{ 
            display: 'flex', alignItems: 'center', gap: '1.5rem', 
            background: 'linear-gradient(135deg, var(--color-surface) 0%, #fafbfc 100%)',
            color: 'var(--color-text)', textDecoration: 'none'
          }}>
            <div style={{ background: 'rgba(244,192,34,0.15)', color: 'var(--color-secondary-dark)', padding: '1rem', borderRadius: '50%' }}>
              <FileText size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.2rem' }}>Track Complaints</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>View status of your {stats.total} submissions</p>
            </div>
          </Link>
        </div>

        {/* Stat Cards */}
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutDashboard size={20} color="var(--color-primary)" /> Overall Metrics
        </h2>
        <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Filed', value: stats.total, color: 'var(--color-primary)', icon: <FileText size={20} /> },
            { label: 'In Progress', value: stats.inProgress, color: 'var(--color-warning)', icon: <Clock size={20} /> },
            { label: 'Resolved', value: stats.resolved, color: 'var(--color-success)', icon: <CheckCircle2 size={20} /> },
            { label: 'Closed', value: stats.closed, color: '#6b7280', icon: <CheckCircle2 size={20} /> },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ borderTopColor: s.color, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="stat-label">{s.label}</div>
                <div style={{ color: s.color, opacity: 0.8 }}>{s.icon}</div>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Complaints */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recent Activity</h2>
            <Link to="/citizen/complaints" className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>View All <ChevronRight size={16}/></Link>
          </div>

          {recentComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
              <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>No grievances found</h3>
              <p>You haven't submitted any complaints yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentComplaints.map(c => (
                <Link key={c.id} to={`/citizen/complaints/${c.id}`} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: '#fafbfc',
                  border: '1px solid var(--color-border)', textDecoration: 'none', color: 'inherit',
                  transition: 'var(--transition)'
                }} className="card-hover">
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: 'var(--radius-md)', 
                      background: 'rgba(166,20,22,0.05)', display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', color: 'var(--color-primary)' 
                    }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem', color: 'var(--color-text)' }}>{c.title}</h3>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        <span>#{c.complaintNumber}</span>
                        <span>•</span>
                        <span>{c.categoryName}</span>
                        <span>•</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <StatusBadge status={c.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
