import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Landmark,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserRoundPlus,
} from 'lucide-react';

const serviceSteps = [
  { icon: UserRoundPlus, title: 'Register', desc: 'Create a verified citizen account with basic contact details.' },
  { icon: ClipboardList, title: 'Submit', desc: 'Record the grievance with location, department, and evidence.' },
  { icon: BarChart3, title: 'Track', desc: 'Follow department action, status history, and officer updates.' },
  { icon: CheckCircle2, title: 'Resolve', desc: 'Receive accountable closure from the responsible authority.' },
];

const featureCards = [
  { icon: FileText, title: 'Digital Petition Filing', desc: 'Submit civic issues online with supporting documents and photographs.' },
  { icon: ShieldCheck, title: 'Transparent Workflow', desc: 'Every grievance keeps a full audit trail from submission to closure.' },
  { icon: LockKeyhole, title: 'Secure Access', desc: 'Role-based citizen, officer, and administrator portals protect sensitive records.' },
];

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'CITIZEN') navigate('/citizen/dashboard');
      else if (user.role === 'OFFICER') navigate('/officer/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="gov-home">
      <div className="top-gov-banner">
        <div className="container top-gov-banner__inner">
          <span>Government of Tamil Nadu | Official Public Grievance Redressal Portal</span>
          <div className="top-gov-banner__contact">
            <span><Phone size={12} /> 1800-XXX-XXXX</span>
            <span><Mail size={12} /> grievance@tn.gov.in</span>
          </div>
        </div>
      </div>

      <div className="flag-stripe" aria-hidden="true">
        <div className="band-red"></div>
        <div className="band-gold"></div>
        <div className="band-red"></div>
      </div>

      <header className="public-header">
        <div className="container public-header__inner">
          <Link to="/" className="gov-brand" aria-label="Smart Public Grievance home">
            <div className="official-seal">
              <Landmark size={25} strokeWidth={2.2} />
            </div>
            <div>
              <div className="gov-brand__title">Smart Public Grievance</div>
              <div className="gov-brand__subtitle">Management System</div>
            </div>
          </Link>

          <nav className="public-nav" aria-label="Primary navigation">
            <Link to="/">Home</Link>
            <a href="#services">Services</a>
            <a href="#process">Process</a>
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="gov-hero">
          <div className="hero-watermark" aria-hidden="true">
            <Landmark size={420} strokeWidth={1} />
          </div>
          <div className="container gov-hero__grid">
            <div className="gov-hero__copy reveal-in">
              <div className="official-kicker">
                <BadgeCheck size={16} />
                Official Government Service
              </div>
              <h1>Smart Public Grievance Management System</h1>
              <p>
                A secure digital service for registering civic grievances, tracking department action,
                and improving public accountability across local government services.
              </p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-xl">
                  <ClipboardList size={18} /> Register a Complaint
                </Link>
                <Link to="/login" className="btn btn-secondary btn-xl">
                  <Search size={18} /> Track Complaint
                </Link>
              </div>
            </div>

            <div className="service-status-panel reveal-in reveal-delay-1" aria-label="Service status overview">
              <div className="status-panel__header">
                <span>Portal Status</span>
                <strong>Live</strong>
              </div>
              <div className="status-panel__item">
                <span>Citizen services</span>
                <strong>24x7</strong>
              </div>
              <div className="status-panel__item">
                <span>Department routing</span>
                <strong>AI assisted</strong>
              </div>
              <div className="status-panel__item">
                <span>Officer workflow</span>
                <strong>Audited</strong>
              </div>
              <div className="status-progress">
                <span></span>
              </div>
            </div>
          </div>
        </section>

        <section className="quick-services" id="services">
          <div className="container quick-services__grid">
            <div className="quick-service-item reveal-in">
              <Building2 size={22} />
              <span>Department-wise routing</span>
            </div>
            <div className="quick-service-item reveal-in reveal-delay-1">
              <MapPin size={22} />
              <span>Location-linked complaints</span>
            </div>
            <div className="quick-service-item reveal-in reveal-delay-2">
              <ShieldCheck size={22} />
              <span>Verified portal access</span>
            </div>
          </div>
        </section>

        <section className="section-band" id="process">
          <div className="container">
            <div className="section-heading reveal-in">
              <span>Citizen Workflow</span>
              <h2>How It Works</h2>
            </div>

            <div className="process-grid">
              {serviceSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className={`process-card reveal-in reveal-delay-${idx % 3}`}>
                    <div className="process-card__number">{idx + 1}</div>
                    <div className="process-card__icon"><Icon size={24} /></div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-band section-band--white">
          <div className="container">
            <div className="section-heading reveal-in">
              <span>Portal Capabilities</span>
              <h2>Public Service Features</h2>
            </div>

            <div className="feature-grid">
              {featureCards.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className={`feature-card reveal-in reveal-delay-${idx}`}>
                    <div className="feature-card__icon"><Icon size={22} /></div>
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.desc}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div className="flag-stripe" aria-hidden="true">
          <div className="band-red"></div>
          <div className="band-gold"></div>
          <div className="band-red"></div>
        </div>

        <div className="container public-footer__grid">
          <div>
            <div className="public-footer__brand">
              <Landmark size={18} /> Smart Public Grievance
            </div>
            <p>
              An official public grievance redressal service for transparent,
              efficient, and accountable civic administration.
            </p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <Link to="/login">Citizen Login</Link>
            <Link to="/register">New Registration</Link>
            <a href="#process">Process</a>
          </div>
          <div>
            <h4>Contact</h4>
            <span><Phone size={13} /> 1800-XXX-XXXX</span>
            <span><Mail size={13} /> grievance@tn.gov.in</span>
            <span><MapPin size={13} /> Secretariat, Chennai</span>
          </div>
        </div>
        <div className="public-footer__bottom">
          <div className="container">Copyright 2026 Smart Public Grievance Management System. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
