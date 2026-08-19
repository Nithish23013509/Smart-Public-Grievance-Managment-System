import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div style={{
      backgroundColor: '#fef2f2',
      borderLeft: '4px solid var(--color-error)',
      padding: '0.85rem 1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
      marginBottom: '1.25rem'
    }}>
      <AlertCircle color="var(--color-error)" size={18} />
      <span style={{ color: '#991b1b', fontWeight: 500, fontSize: '0.875rem' }}>{message}</span>
    </div>
  );
};

export default ErrorMessage;
