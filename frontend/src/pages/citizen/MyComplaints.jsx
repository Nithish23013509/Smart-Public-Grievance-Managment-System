import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { FileText, FolderOpen, ChevronRight, LayoutList } from 'lucide-react';

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
    <div style={{ paddingBottom: '2rem' }}>
      {/* Premium Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-surface) 0%, #fafbfc 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        marginBottom: '2rem',
        border: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ position: 'absolute', top: '-10px', right: '20px', opacity: 0.05, transform: 'rotate(10deg)' }}>
          <FolderOpen size={140} color="var(--color-primary)" />
        </div>
        
        <div style={{ background: 'rgba(244,192,34,0.15)', color: 'var(--color-secondary-dark)', padding: '1rem', borderRadius: '50%', flexShrink: 0 }}>
          <LayoutList size={32} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>My Complaints</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '500px' }}>
            View and track the status of all grievances you have submitted.
          </p>
        </div>
      </div>
      
      <ErrorMessage message={error} />
      
      <div className="card" style={{ padding: '2rem' }}>
        {complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
            <FolderOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>No grievances found</h3>
            <p>You haven't submitted any complaints yet.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {complaints.map(c => (
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
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem', color: 'var(--color-text)' }}>{c.title}</h3>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ fontWeight: 600 }}>#{c.complaintNumber}</span>
                        <span>•</span>
                        <span>{c.categoryName}</span>
                        <span>•</span>
                        <span>{c.departmentName}</span>
                        <span>•</span>
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <StatusBadge status={c.status} />
                    <ChevronRight size={18} color="var(--color-text-muted)" />
                  </div>
                </Link>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                <button className="btn btn-outline" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>← Previous</button>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} 
                      onClick={() => setPage(i)}
                      style={{ 
                        width: '32px', height: '32px', borderRadius: 'var(--radius-md)', 
                        border: 'none', background: page === i ? 'var(--color-primary)' : 'transparent',
                        color: page === i ? '#fff' : 'var(--color-text-muted)',
                        fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)'
                      }}
                    >{i + 1}</button>
                  ))}
                </div>
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
