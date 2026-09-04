import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Home, PlusCircle, FileText, Bell, User, Sparkles } from 'lucide-react';

const BottomNav = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  // No bottom nav for admin
  if (user.role === 'ADMIN') return null;

  const citizenLinks = [
    { to: '/citizen/dashboard', icon: Home, label: 'Home' },
    { to: '/citizen/complaints', icon: FileText, label: 'Complaints' },
    { to: '/citizen/complaints/new', icon: PlusCircle, label: 'New', fab: true },
    { to: '/citizen/notifications', icon: Bell, label: 'Alerts' },
    { to: '/citizen/profile', icon: User, label: 'Profile' },
  ];

  const officerLinks = [
    { to: '/officer/dashboard', icon: Home, label: 'Home' },
    { to: '/officer/ai-review', icon: Sparkles, label: 'AI Review' },
    { to: '/officer/notifications', icon: Bell, label: 'Alerts' },
    { to: '/officer/profile', icon: User, label: 'Profile' },
  ];

  const links = user.role === 'CITIZEN' ? citizenLinks : officerLinks;

  return (
    <nav className="bottom-nav">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to.endsWith('dashboard')}
          className={({ isActive }) =>
            `bottom-nav-item${isActive ? ' active' : ''}${link.fab ? ' bottom-nav-fab' : ''}`
          }
        >
          {link.fab ? (
            <div className="bottom-nav-fab-circle">
              <link.icon size={22} />
            </div>
          ) : (
            <>
              <link.icon size={20} />
              <span>{link.label}</span>
            </>
          )}
          {link.fab && <span className="bottom-nav-fab-label">{link.label}</span>}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
