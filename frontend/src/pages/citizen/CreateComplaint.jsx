import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import locationService from '../../services/locationService';
import ErrorMessage from '../../components/common/ErrorMessage';
import AiDecisionBadge from '../../components/common/AiDecisionBadge';
import ConfidenceMeter from '../../components/common/ConfidenceMeter';
import { ArrowLeft, Upload, Sparkles, CheckCircle2 } from 'lucide-react';

const CreateComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '',
    districtId: '', revenueDivisionId: '', talukId: '', localBodyId: '', locationAddress: ''
  });
  const [image, setImage] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const distRes = await locationService.getDistricts();
        if (distRes.success) setDistricts(distRes.data);
      } catch (err) { /* silently fail – districts load is non-critical for form display */ }
    };
    loadReferenceData();
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'districtId' && value) {
      const divRes = await locationService.getRevenueDivisions(value);
      if (divRes.success) setDivisions(divRes.data);
      setFormData(prev => ({ ...prev, revenueDivisionId: '', talukId: '' })); setTaluks([]);
    } else if (name === 'revenueDivisionId' && value) {
      const talukRes = await locationService.getTaluks(value);
      if (talukRes.success) setTaluks(talukRes.data);
      setFormData(prev => ({ ...prev, talukId: '' }));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { setError('Image size should be less than 5MB'); e.target.value = null; return; }
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      let response;
      const complaintData = {
        title: formData.title, description: formData.description,
        districtId: Number(formData.districtId), locationAddress: formData.locationAddress,
        revenueDivisionId: formData.revenueDivisionId ? Number(formData.revenueDivisionId) : null,
        talukId: formData.talukId ? Number(formData.talukId) : null
      };

      if (image) {
        const data = new FormData();
        data.append('complaint', new Blob([JSON.stringify(complaintData)], { type: "application/json" }));
        data.append('image', image);
        response = await complaintService.createComplaintWithImage(data);
      } else {
        response = await complaintService.createComplaint(complaintData);
      }
      if (response.success) {
        setSuccessData(response.data);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.fieldErrors || 'Failed to submit complaint';
      let errStr = message; if (typeof errStr === 'object') errStr = Object.values(errStr).join(', ');
      setError(errStr);
    } finally { setLoading(false); }
  };

  // ——— Success Modal ———
  if (successData) {
    return (
      <div className="modal-overlay" onClick={() => navigate(`/citizen/complaints/${successData.id}`)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <CheckCircle2 size={28} color="#059669" />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)' }}>Complaint Submitted!</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Your grievance has been registered and the AI has automatically routed it.
            </p>
          </div>

          <div style={{ background: '#f8f9fb', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>Complaint No.</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)' }}>{successData.complaintNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>Status</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{successData.status}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>AI Category</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{successData.categoryName || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>AI Department</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{successData.departmentName || '—'}</div>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <ConfidenceMeter confidence={successData.aiConfidence} />
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>AI Decision:</span>
              <AiDecisionBadge decision={successData.aiDecision} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/citizen/complaints')}>
              My Complaints
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/citizen/complaints/${successData.id}`)}>
              View Details →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ——— Form ———
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '0.75rem', padding: '0.3rem 0' }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Submit New Complaint</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>Fill in the details of your public grievance</p>
      </div>

      {/* AI Notice */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)', border: '1px solid #93c5fd',
        borderRadius: 'var(--radius-lg)', padding: '0.85rem 1.1rem', marginBottom: '1.25rem',
        display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', color: '#1e40af'
      }}>
        <Sparkles size={18} style={{ flexShrink: 0 }} />
        <span><strong>Smart Routing:</strong> Category and department are automatically determined by our AI based on your description. Just describe your issue clearly.</span>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Complaint Title *</label>
              <input type="text" name="title" className="form-control" placeholder="Brief summary of the issue"
                value={formData.title} onChange={handleChange} required minLength={5} maxLength={150} />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description *</label>
              <textarea name="description" className="form-control" placeholder="Describe the problem in detail — the AI uses this to route your complaint..." rows={4}
                value={formData.description} onChange={handleChange} required minLength={10} />
            </div>
            <div className="form-group">
              <label className="form-label">District *</label>
              <select name="districtId" className="form-control" value={formData.districtId} onChange={handleChange} required>
                <option value="">Select District</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Revenue Division</label>
              <select name="revenueDivisionId" className="form-control" value={formData.revenueDivisionId} onChange={handleChange} disabled={!formData.districtId}>
                <option value="">Select (Optional)</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Exact Location Address *</label>
              <input type="text" name="locationAddress" className="form-control" placeholder="Street name, landmark, etc."
                value={formData.locationAddress} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Supporting Image (Optional)</label>
              <div style={{
                border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)',
                padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#fafbfc',
                transition: 'var(--transition)'
              }}>
                <Upload size={24} color="var(--color-text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageChange}
                  style={{ display: 'block', margin: '0 auto' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  Max 5MB • JPG, PNG, WebP
                </div>
              </div>
            </div>
            <div style={{ gridColumn: 'span 2', marginTop: '0.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : '📋 Submit Complaint'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;
