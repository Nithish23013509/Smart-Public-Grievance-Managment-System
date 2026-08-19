import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';

const OfficerDashboard = () => {
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

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Officer Dashboard</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>Manage your assigned grievances</p>
      </div>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Newly Assigned', value: stats.assigned, color: 'var(--color-info)', icon: <ClipboardList size={18} /> },
          { label: 'In Progress', value: stats.inProgress, color: 'var(--color-warning)', icon: <Clock size={18} /> },
          { label: 'Resolved', value: stats.resolved, color: 'var(--color-success)', icon: <CheckCircle size={18} /> },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderTopColor: s.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="stat-label">{s.label}</div>
              <div style={{ color: s.color }}>{s.icon}</div>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Assigned Complaints</h2>
        {complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
            No complaints currently assigned to you.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Complaint ID</th><th>Title</th><th>Category</th><th>Location</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.complaintNumber}</td>
                    <td>{c.title}</td>
                    <td>{c.categoryName}</td>
                    <td>{c.districtName}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><Link to={`/officer/complaints/${c.id}`} style={{ fontWeight: 600 }}>Manage</Link></td>
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

export default OfficerDashboard;
