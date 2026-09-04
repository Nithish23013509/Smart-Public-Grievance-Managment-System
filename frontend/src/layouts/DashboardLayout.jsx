import React, { useContext, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, FileText, PlusCircle, Bell, User, LogOut, Users, Building, Menu, X, Sparkles, BarChart3, Landmark } from 'lucide-react';
import BottomNav from '../components/common/BottomNav';

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const renderSidebarLinks = () => {
    if (!user) return null;
    if (user.role === 'CITIZEN') return (
      <>
        <NavLink to="/citizen/dashboard" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><Home size={18} /> Dashboard</NavLink>
        <NavLink to="/citizen/complaints/new" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><PlusCircle size={18} /> Submit Complaint</NavLink>
        <NavLink to="/citizen/complaints" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><FileText size={18} /> My Complaints</NavLink>
        <NavLink to="/citizen/notifications" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><Bell size={18} /> Notifications</NavLink>
        <NavLink to="/citizen/profile" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><User size={18} /> Profile</NavLink>
      </>
    );
    if (user.role === 'OFFICER') return (
      <>
        <NavLink to="/officer/dashboard" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><Home size={18} /> Dashboard</NavLink>
        <NavLink to="/officer/ai-review" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><Sparkles size={18} /> AI Review Queue</NavLink>
        <NavLink to="/officer/notifications" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><Bell size={18} /> Notifications</NavLink>
        <NavLink to="/officer/profile" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><User size={18} /> Profile</NavLink>
      </>
    );
    if (user.role === 'ADMIN') return (
      <>
        <NavLink to="/admin/dashboard" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><Home size={18} /> Dashboard</NavLink>
        <NavLink to="/admin/complaints" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><FileText size={18} /> All Complaints</NavLink>
        <NavLink to="/admin/ai-analytics" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><BarChart3 size={18} /> AI Analytics</NavLink>
        <NavLink to="/admin/ai-review" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><Sparkles size={18} /> AI Review Queue</NavLink>
        <NavLink to="/admin/users" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><Users size={18} /> Users & Officers</NavLink>
        <NavLink to="/admin/departments" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><Building size={18} /> Departments</NavLink>
        <NavLink to="/admin/notifications" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><Bell size={18} /> Notifications</NavLink>
        <NavLink to="/admin/profile" onClick={closeSidebar} className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}><User size={18} /> Profile</NavLink>
      </>
    );
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar}></div>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1 }} onClick={() => navigate('/')}>
            <div className="sidebar-logo-icon"><Landmark size={23} strokeWidth={2.2} /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}>SmartGrievance</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>Government Portal</div>
            </div>
          </div>
          <button className="mobile-menu-btn" onClick={closeSidebar} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Gold accent line */}
        <div style={{ height: '3px', background: 'var(--color-secondary)' }}></div>

        <nav className="sidebar-nav">
          {renderSidebarLinks()}
        </nav>

        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ padding: '0.75rem 1rem', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{user?.fullName}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{user?.role} Portal</div>
          </div>
          <button onClick={logout} className="btn" style={{
            width: '100%', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.5rem', justifyContent: 'center',
            fontSize: '0.85rem'
          }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {/* Flag stripe on top */}
        <div className="flag-stripe" style={{ height: '4px' }}>
          <div className="band-red"></div><div className="band-gold"></div><div className="band-red"></div>
        </div>

        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', cursor: 'pointer', display: 'flex' }}>
              <Menu size={24} />
            </button>
            <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9rem' }}>
              {user?.role === 'CITIZEN' ? 'Citizen' : user?.role === 'OFFICER' ? 'Officer' : 'Administrator'} Portal
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="desktop-only" style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.fullName}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>{user?.email}</div>
            </div>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.9rem'
            }}>
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
        <BottomNav />
      </main>
    </div>
  );
};

export default DashboardLayout;
