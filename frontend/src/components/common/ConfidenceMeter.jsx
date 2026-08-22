import React from 'react';

const ConfidenceMeter = ({ confidence, showLabel = true }) => {
  const pct = Math.round((confidence || 0) * 100);
  const level = pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low';

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            AI Confidence
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{pct}%</span>
        </div>
      )}
      <div className={`confidence-meter confidence-meter-${level}`}>
        <div className="confidence-meter-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default ConfidenceMeter;
