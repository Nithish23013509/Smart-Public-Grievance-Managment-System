import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchComplaints(page); }, [page]);

  const fetchComplaints = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await complaintService.getAllComplaints(pageNumber, 15);
      if (response.success) {
        setComplaints(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) { setError('Failed to load system complaints'); }
    finally { setLoading(false); }
  };

  if (loading && complaints.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>All Complaints</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>System-wide grievance registry</p>
      </div>
      
      <ErrorMessage message={error} />
      
      <div className="card">
        {complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>No complaints in the system.</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Complaint ID</th><th>Citizen</th><th>Category</th><th>Department</th><th>Officer</th><th>Status</th><th>Date</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.complaintNumber}</td>
                      <td style={{ fontSize: '0.85rem' }}>{c.citizenName}</td>
                      <td style={{ fontSize: '0.85rem' }}>{c.categoryName}</td>
                      <td style={{ fontSize: '0.85rem' }}>{c.departmentName}</td>
                      <td style={{ fontSize: '0.85rem', color: c.assignedOfficerName ? 'inherit' : 'var(--color-error)', fontWeight: c.assignedOfficerName ? 400 : 600 }}>
                        {c.assignedOfficerName || 'Unassigned'}
                      </td>
                      <td><StatusBadge status={c.status} /></td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td><Link to={`/admin/complaints/${c.id}`} style={{ fontWeight: 600 }}>Manage</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
                <button className="btn btn-outline" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>← Previous</button>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Page {page + 1} of {totalPages}</span>
                <button className="btn btn-outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminComplaints;
