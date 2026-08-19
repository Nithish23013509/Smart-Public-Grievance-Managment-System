import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchComplaints(page); }, [page]);

  const fetchComplaints = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await complaintService.getMyComplaints(pageNumber, 10);
      if (response.success) {
        setComplaints(response.data.content || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) { setError('Failed to load complaints'); }
    finally { setLoading(false); }
  };

  if (loading && complaints.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>My Complaints</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>All grievances submitted by you</p>
      </div>
      
      <ErrorMessage message={error} />
      
      <div className="card">
        {complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>No complaints found.</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Complaint ID</th><th>Title</th><th>Category</th><th>Department</th><th>Status</th><th>Date</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.complaintNumber}</td>
                      <td>{c.title}</td>
                      <td>{c.categoryName}</td>
                      <td>{c.departmentName}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td><Link to={`/citizen/complaints/${c.id}`} style={{ fontWeight: 600 }}>View</Link></td>
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

export default MyComplaints;
