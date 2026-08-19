import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, Shield, MapPin } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  if (!user) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>My Profile</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>Your account information</p>
      </div>
      
      <div className="card" style={{ padding: '2rem' }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ 
            width: '72px', height: '72px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 700, boxShadow: 'var(--shadow-primary)'
          }}>
            {user.fullName.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.fullName}</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem',
              background: 'rgba(166,20,22,0.08)', color: 'var(--color-primary)', padding: '0.2rem 0.65rem',
              borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em'
            }}>
              <Shield size={12} /> {user.role}
            </div>
          </div>
        </div>

        {/* Info fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            { icon: <Mail size={18} />, label: 'Email Address', value: user.email },
            { icon: <Phone size={18} />, label: 'Mobile Number', value: user.mobileNumber || 'Not provided' },
            { icon: <User size={18} />, label: 'Account ID', value: `#${user.id}` },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>{item.icon}</div>
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                <div style={{ fontWeight: 500, marginTop: '0.15rem' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
