import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { MapPin, Calendar, User, Building, FileText, CheckCircle, ArrowLeft } from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintRes, historyRes] = await Promise.all([
          complaintService.getComplaintById(id),
          complaintService.getComplaintHistory(id)
        ]);
        if (complaintRes.success) setComplaint(complaintRes.data);
        if (historyRes.success) setHistory(historyRes.data);
      } catch (err) { setError('Failed to load complaint details.'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleClose = async () => {
    if (!window.confirm('Are you sure you want to close this complaint?')) return;
    setClosing(true);
    try {
      const res = await complaintService.closeComplaint(id);
      if (res.success) {
        setComplaint(res.data);
        const hRes = await complaintService.getComplaintHistory(id);
        if (hRes.success) setHistory(hRes.data);
      }
    } catch (err) { alert('Failed to close complaint'); }
    finally { setClosing(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!complaint) return <ErrorMessage message={error || 'Complaint not found'} />;

  const DetailRow = ({ icon, label, value }) => (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
        {icon} {label}
      </div>
      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '0.5rem', padding: '0.3rem 0' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>{complaint.title}</h1>
            <StatusBadge status={complaint.status} />
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
            {complaint.complaintNumber}
          </p>
        </div>
        {complaint.status === 'RESOLVED' && (
          <button className="btn" style={{ background: 'var(--color-success)', color: '#fff' }} onClick={handleClose} disabled={closing}>
            <CheckCircle size={16} /> {closing ? 'Closing...' : 'Close Complaint'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Description */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
              <FileText size={18} /> Description
            </h2>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.9rem' }}>{complaint.description}</p>
            {complaint.imageUrl && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Attachment</div>
                <img src={`http://localhost:8080${complaint.imageUrl}`} alt="Complaint proof" style={{ maxWidth: '100%', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }} />
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
                    {h.remarks && <div style={{ fontSize: '0.85rem', marginBottom: '0.15rem' }}>{h.remarks}</div>}
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>By: {h.changedByName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Details</h2>
            <DetailRow icon={<Calendar size={13} />} label="Submitted On" value={new Date(complaint.createdAt).toLocaleDateString()} />
            <DetailRow icon={<Building size={13} />} label="Department" value={complaint.departmentName} />
            <DetailRow icon={<FileText size={13} />} label="Category" value={complaint.categoryName} />
            <DetailRow icon={<User size={13} />} label="Assigned Officer" value={complaint.assignedOfficerName || 'Not assigned yet'} />
          </div>

          <div className="card">
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Location</h2>
            <DetailRow icon={<MapPin size={13} />} label="Address" value={complaint.locationAddress} />
            <DetailRow icon={null} label="District" value={complaint.districtName} />
            {complaint.revenueDivisionName && <DetailRow icon={null} label="Division" value={complaint.revenueDivisionName} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
