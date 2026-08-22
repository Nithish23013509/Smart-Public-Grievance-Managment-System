import React from 'react';

const DECISION_MAP = {
  AUTO_RECOMMENDED: { label: 'Auto Recommended', className: 'badge-ai-auto', icon: '✓' },
  REVIEW_REQUIRED: { label: 'Review Required', className: 'badge-ai-review', icon: '⚠' },
  LOW_CONFIDENCE: { label: 'Low Confidence', className: 'badge-ai-low', icon: '!' },
  AUTO_RECOMMENDED_REVIEWED: { label: 'Reviewed', className: 'badge-ai-auto', icon: '✓' },
  REVIEW_REQUIRED_REVIEWED: { label: 'Reviewed', className: 'badge-ai-auto', icon: '✓' },
  LOW_CONFIDENCE_REVIEWED: { label: 'Reviewed', className: 'badge-ai-auto', icon: '✓' },
};

const AiDecisionBadge = ({ decision }) => {
  if (!decision) return null;
  const config = DECISION_MAP[decision] || { label: decision, className: 'badge-ai-fallback', icon: '?' };

  return (
    <span className={`badge ${config.className}`}>
      {config.icon} {config.label}
    </span>
  );
};

export default AiDecisionBadge;
