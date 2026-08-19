import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText } from 'lucide-react';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const CitizenDashboard = () => {
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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Citizen Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>Overview of your grievance submissions</p>
        </div>
        <Link to="/citizen/complaints/new" className="btn btn-primary">
          <PlusCircle size={16} /> New Complaint
        </Link>
      </div>

      <ErrorMessage message={error} />

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Filed', value: stats.total, color: 'var(--color-primary)' },
          { label: 'In Progress', value: stats.inProgress, color: 'var(--color-warning)' },
          { label: 'Resolved', value: stats.resolved, color: 'var(--color-success)' },
          { label: 'Closed', value: stats.closed, color: '#6b7280' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderTopColor: s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Complaints */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Complaints</h2>
          <Link to="/citizen/complaints" style={{ fontSize: '0.85rem', fontWeight: 600 }}>View All →</Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
            <FileText size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p>No complaints submitted yet.</p>
            <Link to="/citizen/complaints/new" className="btn btn-outline" style={{ marginTop: '1rem' }}>Submit your first complaint</Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Complaint ID</th><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.complaintNumber}</td>
                    <td>{c.title}</td>
                    <td>{c.categoryName}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td><Link to={`/citizen/complaints/${c.id}`} style={{ fontWeight: 600 }}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
