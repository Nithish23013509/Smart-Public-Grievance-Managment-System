import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, Clock, CheckCircle2, ChevronRight, LayoutDashboard, Sparkles } from 'lucide-react';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { AuthContext } from '../../context/AuthContext';

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

  return (
    <div style={{ paddingBottom: '2rem' }}>
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
            Welcome back, {user?.fullName?.split(' ')[0] || 'Citizen'}!
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

      {/* Recent Complaints as Timeline/Cards */}
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
  );
};

export default CitizenDashboard;
