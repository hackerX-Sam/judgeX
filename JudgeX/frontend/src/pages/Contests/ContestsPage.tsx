import React from 'react';
import { Trophy, Clock, Calendar, BarChart3, Medal, Users } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Navbar } from '../../components/Navbar';
import './ContestsPage.css';

const ContestsPage = () => {
  const user = useSelector((state: any) => state.auth.user);

  // Mock data for past contests
  const pastContests = [
    { id: 405, type: 'Weekly', date: 'Jul 14, 2026', participants: '32.1k' },
    { id: 135, type: 'Biweekly', date: 'Jul 11, 2026', participants: '25.4k' },
    { id: 404, type: 'Weekly', date: 'Jul 7, 2026', participants: '34.2k' },
    { id: 403, type: 'Weekly', date: 'Jun 30, 2026', participants: '31.8k' },
    { id: 134, type: 'Biweekly', date: 'Jun 27, 2026', participants: '24.9k' },
    { id: 402, type: 'Weekly', date: 'Jun 23, 2026', participants: '33.5k' },
  ];

  return (
    <div className="contests-page">
      <Navbar active="contest" />
      
      <div className="contests-container">
        {/* Main Content Area */}
        <main className="contests-main">
          
          <h1 className="section-title">
            <Trophy className="text-accent" size={28} />
            JudgeX Contests
          </h1>

          <div className="contests-hero">
            {/* Weekly Contest Card */}
            <div className="hero-card hero-weekly">
              <span className="card-badge">Weekly Contest 406</span>
              <h2>Weekly Contest 406</h2>
              <p>Sunday, July 21, 2026 at 8:00 AM</p>
              
              <div className="countdown">
                <Clock size={20} />
                <span>06:14:22:45</span>
              </div>
              
              <button className="btn-register">Register Now</button>
            </div>

            {/* Biweekly Contest Card */}
            <div className="hero-card hero-biweekly">
              <span className="card-badge">Biweekly Contest 136</span>
              <h2>Biweekly Contest 136</h2>
              <p>Saturday, July 27, 2026 at 8:00 PM</p>
              
              <div className="countdown">
                <Clock size={20} />
                <span>13:02:22:45</span>
              </div>
              
              <button className="btn-register">Register Now</button>
            </div>
          </div>

          <h2 className="section-title">
            <Calendar className="text-accent" size={24} />
            Past Contests
          </h2>

          <div className="past-contests-grid">
            {pastContests.map((contest) => (
              <div key={`${contest.type}-${contest.id}`} className="past-contest-card">
                <div className="past-contest-header">
                  <h3 className="past-contest-title">{contest.type} Contest {contest.id}</h3>
                  <Trophy size={18} color="var(--text-tertiary)" />
                </div>
                <div className="past-contest-date">{contest.date}</div>
                <div className="stat-label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Users size={14} /> {contest.participants} participants
                </div>
                <button className="btn-virtual">Virtual Participation</button>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="contests-sidebar">
          <div className="sidebar-widget">
            <h3 className="widget-title"><BarChart3 size={20} /> My Contest Info</h3>
            
            {user ? (
              <div className="ranking-stats">
                <div className="stat-item">
                  <span className="stat-label">Contest Rating</span>
                  <span className="stat-value rating-value">1685</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Global Ranking</span>
                  <span className="stat-value">24,592</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Attended</span>
                  <span className="stat-value">14</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Top %</span>
                  <span className="stat-value">15.2%</span>
                </div>
              </div>
            ) : (
              <div className="auth-prompt">
                <Medal size={48} color="var(--border-color)" style={{ margin: '0 auto 1rem auto' }} />
                <p>Sign in to view your contest ranking, rating, and participation history.</p>
                <button className="btn-login-outline">Sign In</button>
              </div>
            )}
          </div>

          <div className="sidebar-widget">
            <h3 className="widget-title"><Medal size={20} /> Global Ranking</h3>
            <div className="ranking-stats">
               <div className="stat-item" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)'}}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
                     <span style={{color: '#fbbf24', fontWeight: 'bold'}}>1</span>
                     <span style={{color: 'var(--text-primary)'}}>tourist</span>
                  </div>
                  <span style={{color: '#10b981', fontWeight: 'bold'}}>3942</span>
               </div>
               <div className="stat-item" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)'}}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
                     <span style={{color: '#94a3b8', fontWeight: 'bold'}}>2</span>
                     <span style={{color: 'var(--text-primary)'}}>awice</span>
                  </div>
                  <span style={{color: '#10b981', fontWeight: 'bold'}}>3814</span>
               </div>
               <div className="stat-item" style={{ paddingBottom: '0.75rem'}}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
                     <span style={{color: '#b45309', fontWeight: 'bold'}}>3</span>
                     <span style={{color: 'var(--text-primary)'}}>lee215</span>
                  </div>
                  <span style={{color: '#10b981', fontWeight: 'bold'}}>3799</span>
               </div>
               <button className="btn-virtual" style={{width: '100%', marginTop: '0.5rem'}}>View Full Ranking</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ContestsPage;
