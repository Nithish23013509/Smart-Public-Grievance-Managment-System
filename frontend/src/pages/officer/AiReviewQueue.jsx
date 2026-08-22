import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import AiDecisionBadge from '../../components/common/AiDecisionBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const AiReviewQueue = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchQueue = async (p = 0) => {
    setLoading(true); setError('');
    try {
      const response = await complaintService.getAiReviewQueue(p, 10);
      if (response.success) {
        setComplaints(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setPage(p);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load AI review queue.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(0); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={22} /> AI Review Queue
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
          Complaints requiring manual review of the AI recommendation
        </p>
      </div>

      <ErrorMessage message={error} />

      <div className="card">
        {complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
            <Sparkles size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>No complaints pending review</div>
            <div style={{ fontSize: '0.85rem' }}>All AI recommendations have been reviewed or were auto-accepted.</div>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Complaint ID</th>
                    <th>Title</th>
                    <th>AI Category</th>
                    <th>AI Department</th>
                    <th>Confidence</th>
                    <th>Decision</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{c.complaintNumber}</td>
                      <td style={{ fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                      <td style={{ fontSize: '0.85rem' }}>{c.categoryName || '—'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{c.departmentName || '—'}</td>
                      <td style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.aiConfidence ? `${Math.round(c.aiConfidence * 100)}%` : '—'}</td>
                      <td><AiDecisionBadge decision={c.aiDecision} /></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/officer/ai-review/${c.id}`} className="btn btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button className="btn btn-ghost" disabled={page === 0} onClick={() => fetchQueue(page - 1)}>
                  <ChevronLeft size={16} /> Previous
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button className="btn btn-ghost" disabled={page >= totalPages - 1} onClick={() => fetchQueue(page + 1)}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AiReviewQueue;
