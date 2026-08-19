import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, BarChart, Shield, Phone, Mail, MapPin } from 'lucide-react';

const Home = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>

      {/* ===== TOP GOV BANNER ===== */}
      <div className="top-gov-banner" style={{ background: '#1a1a2e', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', padding: '0.4rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Government of Tamil Nadu — Official Grievance Portal</span>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={12} /> 1800-XXX-XXXX</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={12} /> grievance@tn.gov.in</span>
          </div>
        </div>
      </div>

      {/* Flag stripe */}
      <div className="flag-stripe">
        <div className="band-red"></div>
        <div className="band-gold"></div>
        <div className="band-red"></div>
      </div>

      {/* ===== MAIN HEADER ===== */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0.75rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '1.5rem', fontWeight: 800, boxShadow: '0 2px 8px rgba(166,20,22,0.3)'
            }}>🏛️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary-dark)', lineHeight: 1.2 }}>
                Smart Public Grievance
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>
                Management System
              </div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Home</Link>
            <Link to="/about" style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none' }}>About</Link>
            <Link to="/login" className="btn btn-outline" style={{ padding: '0.45rem 1rem' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 1rem' }}>Register</Link>
          </nav>
        </div>
      </header>

      {/* ===== HERO — FLAG LAYOUT ===== */}
      <section>
        {/* Top Red Band */}
        <div style={{ background: 'var(--color-primary)', padding: '2.5rem 0', color: '#fff', textAlign: 'center' }}>
          <div className="container">
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '0.5rem' }}>
              Your Voice. Your Community.
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: 400, maxWidth: '600px', margin: '0 auto' }}>
              Your Government Listens.
            </p>
          </div>
        </div>

        {/* Gold Band */}
        <div style={{ background: 'var(--color-secondary)', padding: '2rem 0', textAlign: 'center' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn" style={{
              background: 'var(--color-primary)', color: '#fff', padding: '0.75rem 2rem',
              fontSize: '1rem', fontWeight: 700, boxShadow: 'var(--shadow-primary)', borderRadius: '6px'
            }}>
              📝 Register a Complaint
            </Link>
            <Link to="/login" className="btn" style={{
              background: '#fff', color: 'var(--color-primary-dark)', padding: '0.75rem 2rem',
              fontSize: '1rem', fontWeight: 700, border: '2px solid var(--color-primary)', borderRadius: '6px'
            }}>
              🔍 Track Your Complaint
            </Link>
          </div>
        </div>

        {/* Bottom Red Band */}
        <div style={{ background: 'var(--color-primary)', padding: '1.5rem 0', color: '#fff', textAlign: 'center' }}>
          <div className="container">
            <p style={{ fontSize: '0.9rem', opacity: 0.85, fontWeight: 400 }}>
              Report public issues, track progress, and get timely resolution from government authorities.
            </p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: '4rem 0', background: '#f7f8fa' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              How It Works
            </h2>
            <div style={{ width: '60px', height: '4px', background: 'var(--color-secondary)', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {[
              { icon: '👤', title: 'Register', desc: 'Create your citizen account in under 2 minutes.' },
              { icon: '📋', title: 'Submit Complaint', desc: 'Describe the issue with location details and images.' },
              { icon: '📊', title: 'Track Progress', desc: 'Monitor the real-time status of your complaint.' },
              { icon: '✅', title: 'Get Resolution', desc: 'Government officers resolve and close the issue.' }
            ].map((step, idx) => (
              <div key={idx} className="card card-hover" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 1rem',
                  background: 'linear-gradient(135deg, rgba(166,20,22,0.1), rgba(244,192,34,0.15))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                }}>
                  {step.icon}
                </div>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', margin: '-2.5rem auto 1rem',
                  position: 'relative', top: '-0.5rem',
                  background: 'var(--color-primary)', color: '#fff', fontSize: '0.75rem',
                  fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(166,20,22,0.3)'
                }}>{idx + 1}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>{step.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== KEY FEATURES ===== */}
      <section style={{ padding: '4rem 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
              Key Features
            </h2>
            <div style={{ width: '60px', height: '4px', background: 'var(--color-secondary)', margin: '0 auto', borderRadius: '2px' }}></div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: <FileText size={24} />, title: 'Easy Registration', desc: 'Submit grievances online with supporting documents and images.' },
              { icon: <BarChart size={24} />, title: 'Real-time Tracking', desc: 'Track every status change with a complete audit timeline.' },
              { icon: <Shield size={24} />, title: 'Secure & Transparent', desc: 'JWT-secured authentication with role-based access control.' },
            ].map((feature, idx) => (
              <div key={idx} style={{
                display: 'flex', gap: '1rem', padding: '1.5rem',
                border: '1px solid #e5e7eb', borderRadius: 'var(--radius-lg)', transition: 'var(--transition)',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: 'var(--radius-md)', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{feature.icon}</div>
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{feature.title}</h4>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: '#1a1a2e', color: '#94a3b8', marginTop: 'auto' }}>
        {/* Flag stripe */}
        <div className="flag-stripe">
          <div className="band-red"></div>
          <div className="band-gold"></div>
          <div className="band-red"></div>
        </div>

        <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ maxWidth: '320px' }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', marginBottom: '0.75rem' }}>
                🏛️ Smart Public Grievance
              </div>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                An initiative to provide transparent, efficient, and accountable public grievance redressal through technology.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                <Link to="/login" style={{ color: '#94a3b8' }}>Citizen Login</Link>
                <Link to="/register" style={{ color: '#94a3b8' }}>Register</Link>
                <Link to="/" style={{ color: '#94a3b8' }}>About</Link>
              </div>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem' }}>Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={13} /> 1800-XXX-XXXX (Toll Free)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={13} /> grievance@tn.gov.in</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={13} /> Secretariat, Chennai</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1rem 0', textAlign: 'center', fontSize: '0.75rem' }}>
          <div className="container">
            © 2026 Smart Public Grievance Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
