import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import { useNavigate } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import locationService from '../../services/locationService';
import speechService from '../../services/speechService';
import ErrorMessage from '../../components/common/ErrorMessage';
import AiDecisionBadge from '../../components/common/AiDecisionBadge';
import ConfidenceMeter from '../../components/common/ConfidenceMeter';
import { ArrowLeft, ArrowRight, ClipboardList, Upload, Sparkles, CheckCircle2, Mic, MicOff, Loader2 } from 'lucide-react';
import ComplaintLocationMap from '../../components/complaint/ComplaintLocationMap';

const CreateComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
  title: '',
  description: '',
  districtId: '',
  revenueDivisionId: '',
  talukId: '',
  localBodyId: '',
  locationAddress: '',
  latitude: '',
  longitude: ''
});
  const [image, setImage] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [successData, setSuccessData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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

  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release mic
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size === 0) return;

        setIsTranscribing(true);
        setError('');
        try {
          const result = await speechService.transcribe(audioBlob);
          if (result.text) {
            setFormData(prev => ({
              ...prev,
              description: prev.description
                ? prev.description + ' ' + result.text
                : result.text
            }));
          }
        } catch (err) {
          setError('Voice transcription failed. Please try again or type manually.');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permissions.');
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
        talukId: formData.talukId ? Number(formData.talukId) : null,
        latitude: formData.latitude
  ? Number(formData.latitude)
  : null,

longitude: formData.longitude
  ? Number(formData.longitude)
  : null,
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
              View Details <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleMapLocationChange = useCallback(({ lat, lng }) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  }, []);

  const handleMapAddressChange = useCallback((address) => {
    setFormData(prev => ({
      ...prev,
      locationAddress: address
    }));
  }, []);

  // ——— Form ———
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Mobile header */}
      <div className="mobile-only">
        <div className="mobile-hero" style={{ paddingBottom: '2rem', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.4rem' }}>Submit Grievance</h1>
          <p>AI will route your complaint to the right department.</p>
        </div>
      </div>

      {/* Desktop header */}
      <div className="desktop-hero">
        <div style={{ marginBottom: '1rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ padding: '0.3rem 0' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>

        {/* Premium Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          color: '#fff',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-primary)'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, transform: 'rotate(15deg)' }}>
            <Sparkles size={160} />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Submit New Grievance
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', maxWidth: '500px', lineHeight: 1.5, marginBottom: '1rem' }}>
              Fill in the details below. Our AI will automatically categorize your issue and route it to the correct government department.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 600 }}>
              <Sparkles size={14} /> AI Smart Routing Enabled
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group col-span-2">
              <label className="form-label">Complaint Title *</label>
              <input type="text" name="title" className="form-control" placeholder="Brief summary of the issue"
                value={formData.title} onChange={handleChange} required minLength={5} maxLength={150} />
            </div>
            <div className="form-group col-span-2">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Description *</label>
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isTranscribing}
                  title={isRecording ? 'Stop recording' : 'Record voice'}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-lg)',
                    border: isRecording ? '2px solid var(--color-error)' : '2px solid var(--color-primary)',
                    background: isRecording ? 'rgba(197,48,48,0.1)' : 'var(--color-primary)',
                    color: isRecording ? 'var(--color-error)' : '#ffffff',
                    cursor: isTranscribing ? 'wait' : 'pointer',
                    fontSize: '0.95rem', fontWeight: 700, fontFamily: 'inherit',
                    transition: 'var(--transition)',
                    boxShadow: isRecording ? 'none' : 'var(--shadow-sm)',
                    animation: isRecording ? 'mic-pulse 1.5s ease-in-out infinite' : 'none',
                  }}
                >
                  {isTranscribing ? (
                    <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Transcribing...</>
                  ) : isRecording ? (
                    <><MicOff size={18} /> Stop Recording</>
                  ) : (
                    <><Mic size={18} /> Voice Input</>
                  )}
                </button>
              </div>
              <textarea name="description" className="form-control" placeholder="Describe the problem in detail — the AI uses this to route your complaint..." rows={4}
                value={formData.description} onChange={handleChange} required minLength={10} />
              {isRecording && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-error)', display: 'inline-block', animation: 'mic-pulse 1s ease-in-out infinite' }}></span>
                  Recording... Click "Stop" when done.
                </div>
              )}
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
            <div className="form-group col-span-2">
  <label className="form-label">
    Select Complaint Location on Map
  </label>

  <ComplaintLocationMap
    latitude={formData.latitude}
    longitude={formData.longitude}
    onLocationChange={handleMapLocationChange}
    onAddressChange={handleMapAddressChange}
  />
</div>
<div className="form-group col-span-2" style={{ marginTop: '0.5rem' }}>
  <label className="form-label">
    Exact Location Address *
  </label>

  <input
    type="text"
    name="locationAddress"
    className="form-control"
    placeholder="Select a location on the map..."
    value={formData.locationAddress || ''}
    onChange={handleChange}
    required
  />
</div>
            <div className="form-group col-span-2">
              <label className="form-label">Supporting Image (Optional)</label>
              <div style={{
                border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)',
                padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#fafbfc',
                transition: 'var(--transition)'
              }}>
                <Upload size={24} color="var(--color-text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageChange}
                  style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  Max 5MB • JPG, PNG, WebP
                </div>
              </div>
            </div>
            <div className="form-actions col-span-2" style={{ marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : <><ClipboardList size={16} /> Submit Complaint</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaint;
