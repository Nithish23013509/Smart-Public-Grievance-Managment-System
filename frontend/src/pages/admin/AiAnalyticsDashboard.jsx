import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import complaintService from '../../services/complaintService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sparkles, TrendingUp, ShieldCheck, AlertTriangle, XOctagon, RefreshCw } from 'lucide-react';

const CHART_COLORS = ['#a61416', '#f4c022', '#2b6cb0', '#0f7b4f', '#c27803', '#7c3aed', '#db2777', '#059669', '#dc2626', '#6366f1'];

const AiAnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true); setError('');
    try {
      const res = await complaintService.getAiAnalytics();
      if (res.success) setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load AI analytics.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return <ErrorMessage message="No analytics data available." />;

  const total = data.totalAiRoutedComplaints || 0;
  const reviewed = (data.aiAcceptedCount || 0) + (data.manualOverridesCount || 0);
  const acceptanceRate = reviewed > 0 ? Math.round((data.aiAcceptedCount / reviewed) * 100) : 0;
  const avgConf = data.averageConfidence ? Math.round(data.averageConfidence * 100) : 0;

  const deptData = data.departmentWiseDistribution
    ? Object.entries(data.departmentWiseDistribution).map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, value }))
    : [];

  const catData = data.categoryWiseDistribution
    ? Object.entries(data.categoryWiseDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const decisionData = [
    { name: 'Auto Recommended', value: data.autoRecommendedCount || 0 },
    { name: 'Review Required', value: data.reviewRequiredCount || 0 },
    { name: 'Low Confidence', value: data.lowConfidenceCount || 0 },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={22} /> AI Analytics Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>AI recommendation performance and distribution</p>
        </div>
        <button className="btn btn-outline" onClick={fetchAnalytics} style={{ fontSize: '0.82rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total AI Routed', value: total, color: 'var(--color-primary)', icon: <TrendingUp size={18} /> },
          { label: 'Auto Recommended', value: data.autoRecommendedCount || 0, color: 'var(--color-success)', icon: <ShieldCheck size={18} /> },
          { label: 'Review Required', value: data.reviewRequiredCount || 0, color: 'var(--color-warning)', icon: <AlertTriangle size={18} /> },
          { label: 'Low Confidence', value: data.lowConfidenceCount || 0, color: 'var(--color-error)', icon: <XOctagon size={18} /> },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ borderTopColor: s.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="stat-label">{s.label}</div>
              <div style={{ color: s.color }}>{s.icon}</div>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
        <div className="stat-card" style={{ borderTopColor: 'var(--color-info)' }}>
          <div className="stat-label">Avg. Confidence</div>
          <div className="stat-value" style={{ color: 'var(--color-info)' }}>{avgConf}%</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: '#7c3aed' }}>
          <div className="stat-label">AI Acceptance Rate</div>
          <div className="stat-value" style={{ color: '#7c3aed' }}>{acceptanceRate}%</div>
        </div>
        <div className="stat-card" style={{ borderTopColor: '#db2777' }}>
          <div className="stat-label">Manual Overrides</div>
          <div className="stat-value" style={{ color: '#db2777' }}>{data.manualOverridesCount || 0}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
        {/* Decision Distribution Pie */}
        {decisionData.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Decision Distribution</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={decisionData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: '0.7rem' }}>
                  {decisionData.map((_, idx) => <Cell key={idx} fill={[CHART_COLORS[3], CHART_COLORS[4], CHART_COLORS[8]][idx]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Department Distribution Bar */}
        {deptData.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Department Distribution</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category Distribution */}
      {catData.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Category Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={catData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {catData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AiAnalyticsDashboard;
