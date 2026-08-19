import React, { useState, useEffect, useContext } from 'react';
import notificationService from '../services/notificationService';
import { AuthContext } from '../context/AuthContext';
import { Bell } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const r = await notificationService.getMyNotifications();
        if (r.success) setNotifications(r.data);
      } catch (err) { console.error("Failed to load notifications"); }
      finally { setLoading(false); }
    };
    fetchNotifications();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={22} color="var(--color-primary)" /> Notifications
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>System alerts and updates</p>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Bell size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>No notifications available.</p>
          </div>
        ) : (
          <div>
            {notifications.map((n, idx) => (
              <div key={n.id} style={{ 
                padding: '1.25rem 1.5rem', 
                borderBottom: idx < notifications.length - 1 ? '1px solid var(--color-border)' : 'none',
                backgroundColor: n.isRead ? 'var(--color-surface)' : '#fffbeb',
                borderLeft: n.isRead ? 'none' : '4px solid var(--color-secondary)',
                transition: 'var(--transition)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{n.title}</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ color: 'var(--color-text)', fontSize: '0.85rem' }}>{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
