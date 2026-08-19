import React, { useState, useEffect } from 'react';
import departmentService from '../../services/departmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try { const r = await departmentService.getDepartments(); if (r.success) setDepartments(r.data); }
      catch (err) { setError('Failed to load departments'); }
      finally { setLoading(false); }
    };
    fetchDepartments();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Department Management</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>Government departments in the system</p>
      </div>
      <ErrorMessage message={error} />
      
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>ID</th><th>Department Name</th><th>Status</th></tr>
            </thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>#{d.id}</td>
                  <td>{d.name}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', padding: '0.2rem 0.65rem', borderRadius: '9999px',
                      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: '#d1fae5', color: '#065f46'
                    }}>Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
          Full department management capabilities will be available in Phase 2.
        </p>
      </div>
    </div>
  );
};

export default AdminDepartments;
