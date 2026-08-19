import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import departmentService from '../../services/departmentService';
import locationService from '../../services/locationService';
import ErrorMessage from '../../components/common/ErrorMessage';
import { ArrowLeft, Upload } from 'lucide-react';

const CreateComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '', description: '', categoryId: '', departmentId: '',
    districtId: '', revenueDivisionId: '', talukId: '', localBodyId: '', locationAddress: ''
  });
  const [image, setImage] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [taluks, setTaluks] = useState([]);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [deptRes, catRes, distRes] = await Promise.all([
          departmentService.getDepartments(), departmentService.getCategories(), locationService.getDistricts()
        ]);
        if (deptRes.success) setDepartments(deptRes.data);
        if (catRes.success) setCategories(catRes.data);
        if (distRes.success) setDistricts(distRes.data);
      } catch (err) { console.error("Failed to load reference data", err); }
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
      if (image) {
        const data = new FormData();
        const complaintData = {
          title: formData.title, description: formData.description,
          categoryId: Number(formData.categoryId), departmentId: Number(formData.departmentId),
          districtId: Number(formData.districtId), locationAddress: formData.locationAddress,
          revenueDivisionId: formData.revenueDivisionId ? Number(formData.revenueDivisionId) : null,
          talukId: formData.talukId ? Number(formData.talukId) : null
        };
        data.append('complaint', new Blob([JSON.stringify(complaintData)], { type: "application/json" }));
        data.append('image', image);
        response = await complaintService.createComplaintWithImage(data);
      } else {
        const complaintData = { ...formData,
          categoryId: Number(formData.categoryId), departmentId: Number(formData.departmentId),
          districtId: Number(formData.districtId),
          revenueDivisionId: formData.revenueDivisionId ? Number(formData.revenueDivisionId) : null,
          talukId: formData.talukId ? Number(formData.talukId) : null
        };
        response = await complaintService.createComplaint(complaintData);
      }
      if (response.success) navigate(`/citizen/complaints/${response.data.id}`);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.fieldErrors || 'Failed to submit complaint';
      let errStr = message; if (typeof errStr === 'object') errStr = Object.values(errStr).join(', ');
      setError(errStr);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '0.75rem', padding: '0.3rem 0' }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Submit New Complaint</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>Fill in the details of your public grievance</p>
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
              <textarea name="description" className="form-control" placeholder="Detailed description of the problem..." rows={4}
                value={formData.description} onChange={handleChange} required minLength={10} />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="categoryId" className="form-control" value={formData.categoryId} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select name="departmentId" className="form-control" value={formData.departmentId} onChange={handleChange} required>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
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
