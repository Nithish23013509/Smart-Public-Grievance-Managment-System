import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import { SERVER_BASE_URL } from '../../services/api';
import departmentService from '../../services/departmentService';
import userService from '../../services/userService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { MapPin, FileText, CheckCircle, Shield, ArrowLeft } from 'lucide-react';

const AdminComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    try {
      const [complaintRes, historyRes, deptRes] = await Promise.all([
        complaintService.getComplaintById(id), complaintService.getComplaintHistory(id), departmentService.getDepartments()
      ]);
      if (complaintRes.success) {
        setComplaint(complaintRes.data);
        if (complaintRes.data.departmentId) {
          setSelectedDepartment(complaintRes.data.departmentId);
          const offRes = await userService.getOfficersByDepartment(complaintRes.data.departmentId);
          if (offRes.success) setOfficers(offRes.data);
        }
      }
      if (historyRes.success) setHistory(historyRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (err) { setError('Failed to load complaint details.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDepartmentChange = async (e) => {
    const deptId = e.target.value;
    setSelectedDepartment(deptId); setSelectedOfficer('');
    if (deptId) { const offRes = await userService.getOfficersByDepartment(deptId); if (offRes.success) setOfficers(offRes.data); }
    else setOfficers([]);
  };

  const handleAssign = async () => {
    if (!selectedDepartment || !selectedOfficer) { alert("Please select both a department and an officer."); return; }
    setAssigning(true);
    try {
      const res = await complaintService.assignComplaint(id, selectedDepartment, selectedOfficer);
      if (res.success) { alert("Complaint successfully assigned."); await fetchData(); }
    } catch (err) { alert(err.response?.data?.message || 'Failed to assign complaint'); }
    finally { setAssigning(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!complaint) return <ErrorMessage message={error || 'Complaint not found'} />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '0.75rem', padding: '0.3rem 0' }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>{complaint.title}</h1>
        <StatusBadge status={complaint.status} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Assignment Panel */}
          <div className="card" style={{ borderTop: '4px solid var(--color-secondary)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
              <Shield size={18} /> Assign Complaint
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <select className="form-control" value={selectedDepartment} onChange={handleDepartmentChange}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Officer *</label>
                <select className="form-control" value={selectedOfficer} onChange={(e) => setSelectedOfficer(e.target.value)} disabled={!selectedDepartment}>
                  <option value="">Select Officer</option>
                  {officers.map(o => <option key={o.id} value={o.id}>{o.fullName}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn btn-primary" onClick={handleAssign} disabled={assigning || !selectedDepartment || !selectedOfficer}>
                {assigning ? 'Assigning...' : '📋 Assign / Reassign'}
              </button>
            </div>
          </div>

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
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>By: {h.changedByName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Details</h2>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Complaint ID</div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{complaint.complaintNumber}</div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Citizen</div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{complaint.citizenName}</div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{complaint.categoryName}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Officer</div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{complaint.assignedOfficerName || 'None'}</div>
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

export default AdminComplaintDetails;
