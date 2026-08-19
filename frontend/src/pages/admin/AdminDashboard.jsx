import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Activity, Users, Building } from 'lucide-react';

const AdminDashboard = () => {
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

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Administrator Dashboard</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>System-wide grievance overview</p>
      </div>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Complaints', value: stats.total, color: 'var(--color-primary)' },
          { label: 'New (Unassigned)', value: stats.submitted, color: '#dc2626' },
          { label: 'Active', value: stats.assigned + stats.inProgress, color: 'var(--color-info)' },
          { label: 'Resolved / Closed', value: stats.resolved + stats.closed, color: 'var(--color-success)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderTopColor: s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Activity</h2>
            <Link to="/admin/complaints" style={{ fontSize: '0.85rem', fontWeight: 600 }}>View All →</Link>
          </div>
          {complaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>No complaints in the system.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr><th>ID</th><th>Title</th><th>Department</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{c.complaintNumber}</td>
                      <td style={{ fontSize: '0.85rem' }}>{c.title}</td>
                      <td style={{ fontSize: '0.85rem' }}>{c.departmentName}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td><Link to={`/admin/complaints/${c.id}`} style={{ fontWeight: 600, fontSize: '0.85rem' }}>Manage</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link to="/admin/complaints" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <Activity size={16} /> Assign Complaints
              </Link>
              <Link to="/admin/users" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <Users size={16} /> Manage Users
              </Link>
              <Link to="/admin/departments" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <Building size={16} /> Manage Departments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
