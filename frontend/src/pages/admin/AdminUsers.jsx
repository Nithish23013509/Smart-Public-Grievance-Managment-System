import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try { const r = await userService.getAllUsers(); if (r.success) setUsers(r.data); }
      catch (err) { setError('Failed to load users'); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  if (loading) return <LoadingSpinner />;

  const getRoleColor = (role) => {
    if (role === 'ADMIN') return 'var(--color-error)';
    if (role === 'OFFICER') return 'var(--color-info)';
    return 'var(--color-text)';
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>User Management</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>System users and their roles</p>
      </div>
      <ErrorMessage message={error} />
      
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>#{u.id}</td>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.mobileNumber}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', padding: '0.2rem 0.65rem', borderRadius: '9999px',
                      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      background: u.role === 'ADMIN' ? '#fef2f2' : u.role === 'OFFICER' ? '#eff6ff' : '#f3f4f6',
                      color: getRoleColor(u.role)
                    }}>{u.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
          Full user management capabilities will be available in Phase 2.
        </p>
      </div>
    </div>
  );
};

export default AdminUsers;
