import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import { SERVER_BASE_URL } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { CheckCircle, FileText, MapPin, ArrowLeft, PlayCircle } from 'lucide-react';

const OfficerComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [resolutionProof, setResolutionProof] = useState(null);

  const fetchData = async () => {
    try {
      const [complaintRes, historyRes] = await Promise.all([
        complaintService.getComplaintById(id), complaintService.getComplaintHistory(id)
      ]);
      if (complaintRes.success) setComplaint(complaintRes.data);
      if (historyRes.success) setHistory(historyRes.data);
    } catch (err) { setError('Failed to load complaint details.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!remarks.trim()) { alert("Remarks are required."); return; }
    setUpdating(true);
    try {
      if (newStatus === 'RESOLVED' && resolutionProof) await complaintService.uploadResolutionProof(id, resolutionProof);
      const res = await complaintService.updateComplaintStatus(id, { status: newStatus, remarks });
      if (res.success) { setRemarks(''); setResolutionProof(null); await fetchData(); }
    } catch (err) { alert(err.response?.data?.message || 'Failed to update status'); }
    finally { setUpdating(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!complaint) return <ErrorMessage message={error || 'Complaint not found'} />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '0.75rem', padding: '0.3rem 0' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>{complaint.title}</h1>
            <StatusBadge status={complaint.status} />
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>{complaint.complaintNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Action Panel */}
          {(complaint.status === 'ASSIGNED' || complaint.status === 'IN_PROGRESS') && (
            <div className="card" style={{ borderTop: '4px solid var(--color-secondary)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
                Update Status
              </h2>
              <div className="form-group">
                <label className="form-label">Remarks / Action Taken *</label>
                <textarea className="form-control" rows="3" value={remarks} onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Describe the action taken..." required />
              </div>
              {complaint.status === 'IN_PROGRESS' && (
                <div className="form-group">
                  <label className="form-label">Resolution Proof Image (Optional)</label>
                  <input type="file" className="form-control" accept="image/*" onChange={(e) => setResolutionProof(e.target.files[0])} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                {complaint.status === 'ASSIGNED' && (
                  <button className="btn" style={{ background: 'var(--color-warning)', color: '#fff' }}
                    onClick={() => handleStatusUpdate('IN_PROGRESS')} disabled={updating}>
                    <PlayCircle size={16} /> Start Work
                  </button>
                )}
                {complaint.status === 'IN_PROGRESS' && (
                  <button className="btn" style={{ background: 'var(--color-success)', color: '#fff' }}
                    onClick={() => handleStatusUpdate('RESOLVED')} disabled={updating}>
                    <CheckCircle size={16} /> Mark Resolved
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
              <FileText size={18} /> Description
            </h2>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.9rem' }}>{complaint.description}</p>
            {complaint.imageUrl && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Citizen Proof</div>
                <img src={`${SERVER_BASE_URL}${complaint.imageUrl}`} alt="Proof" style={{ maxWidth: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }} />
              </div>
            )}
            {complaint.resolutionImageUrl && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Resolution Proof</div>
                <img src={`${SERVER_BASE_URL}${complaint.resolutionImageUrl}`} alt="Resolution" style={{ maxWidth: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }} />
              </div>
            )}
          </div>


          {/* Timeline */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
              <CheckCircle size={18} /> Status Timeline
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {history.map((h, idx) => (
                <div key={h.id} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, border: '3px solid rgba(166,20,22,0.2)' }} />
                    {idx < history.length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--color-border)', margin: '4px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: idx < history.length - 1 ? '1.5rem' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.15rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{h.newStatus}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{new Date(h.changedAt).toLocaleString()}</span>
                    </div>
                    {h.remarks && <div style={{ fontSize: '0.85rem' }}>{h.remarks}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Citizen Info</h2>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Name</div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{complaint.citizenName}</div>
            </div>
          </div>
          <div className="card">
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Location</h2>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} /> Address</div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{complaint.locationAddress}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>District</div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{complaint.districtName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerComplaintDetails;
