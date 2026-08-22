import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import AiDecisionBadge from '../../components/common/AiDecisionBadge';
import ConfidenceMeter from '../../components/common/ConfidenceMeter';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { ArrowLeft, Sparkles, CheckCircle, XCircle, FileText, MapPin } from 'lucide-react';

const AiReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Review form state
  const [acceptAi, setAcceptAi] = useState(true);
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await complaintService.getComplaintById(id);
        if (res.success) setComplaint(res.data);
      } catch (err) { setError('Failed to load complaint.'); }
      finally { setLoading(false); }
    };
    fetchComplaint();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!acceptAi && !overrideReason.trim()) {
      setError('Please provide a reason for overriding the AI recommendation.');
      return;
    }
    setSubmitting(true); setError(''); setSuccessMsg('');
    try {
      const payload = {
        acceptAiRecommendation: acceptAi,
        overrideReason: acceptAi ? null : overrideReason
      };
      const res = await complaintService.submitAiReview(id, payload);
      if (res.success) {
        setSuccessMsg(acceptAi ? 'AI recommendation accepted successfully!' : 'Override submitted successfully!');
        setComplaint(res.data);
        setTimeout(() => navigate('/officer/ai-review'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally { setSubmitting(false); }
  };

  // Parse alternatives from JSON
  const parseAlternatives = () => {
    if (!complaint?.aiAlternativesJson) return [];
    try { return JSON.parse(complaint.aiAlternativesJson); } catch { return []; }
  };

  if (loading) return <LoadingSpinner />;
  if (!complaint) return <ErrorMessage message={error || 'Complaint not found'} />;

  const alternatives = parseAlternatives();
  const alreadyReviewed = complaint.aiReviewAccepted !== null && complaint.aiReviewAccepted !== undefined;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button className="btn btn-ghost" onClick={() => navigate('/officer/ai-review')} style={{ marginBottom: '0.75rem', padding: '0.3rem 0' }}>
        <ArrowLeft size={16} /> Back to Queue
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Review AI Recommendation</h1>
        <StatusBadge status={complaint.status} />
      </div>

      {successMsg && (
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}
      <ErrorMessage message={error} />

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Complaint info */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
              <FileText size={18} /> {complaint.title}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{complaint.complaintNumber}</p>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.9rem' }}>{complaint.description}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              <span><MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {complaint.districtName}</span>
              <span>Filed: {new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Review Form */}
          {!alreadyReviewed ? (
            <div className="card" style={{ borderTop: '3px solid var(--color-primary)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Submit Review Decision</h2>
              <form onSubmit={handleSubmitReview}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: acceptAi ? '2px solid var(--color-success)' : '1px solid var(--color-border)', background: acceptAi ? '#f0fdf4' : 'transparent', cursor: 'pointer', transition: 'var(--transition)' }}>
                    <input type="radio" name="decision" checked={acceptAi} onChange={() => setAcceptAi(true)} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}><CheckCircle size={15} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--color-success)' }} /> Accept AI Recommendation</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Route to {complaint.categoryName} / {complaint.departmentName}</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: !acceptAi ? '2px solid var(--color-warning)' : '1px solid var(--color-border)', background: !acceptAi ? '#fefce8' : 'transparent', cursor: 'pointer', transition: 'var(--transition)' }}>
                    <input type="radio" name="decision" checked={!acceptAi} onChange={() => setAcceptAi(false)} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}><XCircle size={15} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--color-warning)' }} /> Override Recommendation</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Manually assign a different category/department</div>
                    </div>
                  </label>
                </div>

                {!acceptAi && (
                  <div className="form-group">
                    <label className="form-label">Override Reason *</label>
                    <textarea className="form-control" rows={3} placeholder="Explain why the AI recommendation is incorrect..."
                      value={overrideReason} onChange={e => setOverrideReason(e.target.value)} required />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => navigate('/officer/ai-review')}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : acceptAi ? '✓ Accept & Route' : '↻ Override & Route'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card" style={{ borderTop: '3px solid var(--color-success)' }}>
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle size={32} color="var(--color-success)" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>This complaint has already been reviewed</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  {complaint.aiReviewAccepted ? 'AI recommendation was accepted.' : `Overridden: ${complaint.aiOverrideReason || ''}`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Recommendation Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ borderTop: '3px solid var(--color-info)' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-info)' }}>
              <Sparkles size={16} /> AI Prediction
            </h2>
            <div style={{ marginBottom: '0.75rem' }}>
              <AiDecisionBadge decision={complaint.aiDecision} />
            </div>
            <ConfidenceMeter confidence={complaint.aiConfidence} />
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>Category</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>{complaint.categoryName || '—'}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>Department</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{complaint.departmentName || '—'}</div>
            </div>
          </div>

          {/* Alternatives */}
          {alternatives.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Top Alternatives</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {alternatives.map((alt, idx) => (
                  <div key={idx} style={{ padding: '0.65rem 0.85rem', background: '#f8f9fb', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{alt.category || alt.department || '—'}</div>
                        {alt.department && alt.category && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{alt.department}</div>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {alt.confidence ? `${Math.round(alt.confidence * 100)}%` : '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiReviewDetail;
