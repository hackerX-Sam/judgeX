import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { setCredentials } from './store/slices/authSlice';
import axios from 'axios';
import { API_URL } from './config';
import { 
  CheckCircle2, Circle, ChevronRight, Search, 
  Play, Terminal, Flame, Trophy, Sparkles, ArrowRight 
} from 'lucide-react';
import './index.css';
import './App.css';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Workspace from './pages/Workspace/Workspace';
import Playground from './pages/Playground/Playground';
import ActivityGraph from './components/ActivityGraph';
import { Navbar } from './components/Navbar';
import ContestsPage from './pages/Contests/ContestsPage';

import ComputationalCanvas from './components/ComputationalCanvas';
import CodeDnaCanvas from './components/CodeDnaCanvas';
import AnimatedCounter from './components/AnimatedCounter';
import MagneticCard from './components/MagneticCard';
import InteractiveStoryline from './components/InteractiveStoryline';

const ProblemsPage = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/problems`);
        let solvedIds: string[] = [];
        if (user) {
          try {
            const solvedResponse = await axios.get(`${API_URL}/api/submissions/solved/${user.id}`);
            solvedIds = solvedResponse.data.solvedProblemIds || [];
          } catch (e) {
            console.error('Error fetching solved problems:', e);
          }
        }

        const formattedProblems = response.data.problems.map((p: any) => ({
          ...p,
          acceptance: '78.4%',
          status: solvedIds.includes(p.id) ? 'solved' : 'todo'
        }));
        setProblems(formattedProblems);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };
    fetchProblems();
  }, [user]);

  return (
    <div className="app-container" style={{ position: 'relative', zIndex: 1 }}>
      <Navbar active="problems" />
      <main className="lc-main" style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
            Problem <span className="text-gradient-blue">Library</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Practice algorithm challenges, filter by difficulty, and improve your problem-solving skills.
          </p>
        </div>

        <div className="lc-content-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
          <div className="lc-problem-list">
            <div className="lc-toolbar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="lc-search" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(15,23,42,0.6)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', flex: 1 }}>
                <Search size={16} color="#94a3b8" />
                <input type="text" placeholder="Search problems by title or tags..." style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none' }} />
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
              <table className="lc-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Title</th>
                    <th style={{ padding: '1rem' }}>Acceptance</th>
                    <th style={{ padding: '1rem' }}>Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s ease' }}>
                      <td style={{ padding: '1rem' }}>
                        {p.status === 'solved' ? (
                          <CheckCircle2 size={18} color="#10b981" />
                        ) : (
                          <Circle size={18} color="#64748b" />
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        <Link to={`/problems/${p.slug}`} style={{ color: '#f8fafc', textDecoration: 'none' }}>
                          {p.title}
                        </Link>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{p.acceptance}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`diff-badge diff-${p.difficulty.toLowerCase()}`}>
                          {p.difficulty}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lc-sidebar">
            {user && (
              <div className="glass-card" style={{ padding: '1.2rem', marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#fff' }}>Activity Graph</h4>
                <ActivityGraph userId={user.id} />
              </div>
            )}
            <div className="glass-card" style={{ padding: '1.2rem' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#fff' }}>Top Companies</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix'].map((comp) => (
                  <span key={comp} style={{ background: 'rgba(59,130,246,0.1)', color: '#38bdf8', padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const highlightCode = (code: string) => {
  if (!code) return '';
  let res = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  res = res.replace(/("[^"]*")/g, '<span style="color: #ce9178">$1</span>');
  const keywords = /\b(function|let|var|const|while|for|if|else|return|class|def|self|impl|pub|fn|mut|int|struct|type|func|use|public|import)\b/g;
  res = res.replace(keywords, '<span style="color: #569cd6">$1</span>');
  const numbers = /\b(\d+)\b/g;
  res = res.replace(numbers, '<span style="color: #b5cea8">$1</span>');
  return res;
};

const snippetSample = `function binarySearch(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`;

const Welcome = () => {
  const [runState, setRunState] = useState<'idle' | 'running' | 'finished'>('idle');

  const handleRun = () => {
    if (runState === 'running') return;
    setRunState('running');
    setTimeout(() => {
      setRunState('finished');
    }, 1200);
  };

  return (
    <div className="landing-page">
      <Navbar active="home" transparent={true} />

      {/* Cinematic Hero */}
      <section className="landing-hero-redesign">
        <div>
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>CODE IS IN OUR DNA</span>
          </div>

          <h1 className="hero-title-main">
            Master Code.<br />
            <span className="text-gradient-cyan">Execute Without Limits.</span>
          </h1>

          <p className="hero-subtitle-main">
            The next-generation online coding judge. Write algorithms, execute code in isolated Docker sandboxes, and receive real-time AI performance intelligence.
          </p>

          <div className="hero-actions-group">
            <Link to="/register" className="btn-magnetic">
              <span>Start Solving Free</span>
              <ChevronRight size={18} />
            </Link>
            <Link to="/playground" className="glass-card" style={{ padding: '0.8rem 1.5rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Terminal size={18} color="#38bdf8" />
              <span>Try Playground</span>
            </Link>
          </div>
        </div>

        {/* Floating 3D IDE Card */}
        <div className="hero-ide-wrapper animate-float">
          <div className="glass-card" style={{ padding: '1.2rem', borderColor: 'rgba(59,130,246,0.3)', boxShadow: 'var(--shadow-glow-blue)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>BinarySearch.js</span>
              <button 
                onClick={handleRun}
                style={{ background: '#2563eb', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
              >
                <Play size={12} fill="#fff" />
                {runState === 'running' ? 'Executing...' : 'Run Code'}
              </button>
            </div>

            <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '1.6', overflowX: 'auto' }}>
              <code dangerouslySetInnerHTML={{ __html: highlightCode(snippetSample) }} />
            </pre>

            {runState !== 'idle' && (
              <div style={{ marginTop: '1rem', padding: '0.8rem', background: '#090d16', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                {runState === 'running' ? (
                  <span style={{ color: '#fbbf24' }}>⚡ Compiling & running against test cases...</span>
                ) : (
                  <div>
                    <div style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={16} /> Status: ACCEPTED (4/4 Testcases Passed)
                    </div>
                    <div style={{ color: '#94a3b8', marginTop: '0.4rem' }}>Runtime: 4ms (Beats 94.2%) | Memory: 42.1 MB</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Live Animated Statistics Banner */}
      <section className="stats-banner">
        <div className="glass-card stats-grid">
          <div className="stat-box">
            <div className="stat-number text-gradient-blue">
              <AnimatedCounter end={4200} suffix="+" />
            </div>
            <div className="stat-label">Curated Problems</div>
          </div>
          <div className="stat-box">
            <div className="stat-number text-gradient-cyan">
              <AnimatedCounter end={125000} suffix="+" />
            </div>
            <div className="stat-label">Submissions Judged</div>
          </div>
          <div className="stat-box">
            <div className="stat-number text-gradient-emerald">
              <AnimatedCounter end={99.9} prefix="" suffix="%" />
            </div>
            <div className="stat-label">Sandbox Uptime</div>
          </div>
          <div className="stat-box">
            <div className="stat-number text-gradient-amber">
              <AnimatedCounter end={14} suffix=" Languages" />
            </div>
            <div className="stat-label">Docker Execution Environments</div>
          </div>
        </div>
      </section>

      {/* Visual Storytelling Section */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
        <InteractiveStoryline />
      </div>

      {/* Interactive Problem Showcase */}
      <section style={{ maxWidth: '1280px', margin: '4rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em' }}>FEATURED CHALLENGES</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.4rem' }}>Popular Interview Questions</h2>
        </div>

        <div className="showcase-grid">
          {[
            { title: 'Two Sum', diff: 'Easy', acceptance: '49.2%', tags: ['Array', 'Hash Table'] },
            { title: 'Binary Tree Inorder Traversal', diff: 'Easy', acceptance: '74.1%', tags: ['Tree', 'DFS'] },
            { title: 'Reverse Linked List', diff: 'Easy', acceptance: '73.8%', tags: ['Linked List'] },
            { title: 'Longest Substring Without Repeating', diff: 'Medium', acceptance: '33.8%', tags: ['Sliding Window'] },
            { title: 'Trapping Rain Water', diff: 'Hard', acceptance: '59.4%', tags: ['Two Pointers', 'Stack'] },
            { title: 'LRU Cache', diff: 'Medium', acceptance: '41.2%', tags: ['Design', 'Doubly Linked List'] },
          ].map((item, idx) => (
            <MagneticCard key={idx}>
              <div className="problem-card-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <span className={`diff-badge diff-${item.diff.toLowerCase()}`}>{item.diff}</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Acc: {item.acceptance}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.8rem', color: '#fff' }}>{item.title}</h3>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                  {item.tags.map(t => (
                    <span key={t} style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>{t}</span>
                  ))}
                </div>
                <Link to="/problems" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#38bdf8', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>Solve Problem</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </MagneticCard>
          ))}
        </div>
      </section>

      {/* Competitive Energy Arena */}
      <section className="arena-split">
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(245,158,11,0.15)', borderRadius: '10px' }}>
              <Trophy color="#f59e0b" size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Weekly Contest #142</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Live Competitive Arena</p>
            </div>
          </div>
          <div style={{ background: '#090d16', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>STARTS IN</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>02d : 14h : 32m</div>
            </div>
            <Link to="/contest" className="btn-magnetic" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Register
            </Link>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(16,185,129,0.15)', borderRadius: '10px' }}>
              <Flame color="#10b981" size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Global Leaderboard</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Top Performers This Week</p>
            </div>
          </div>
          <div>
            {[
              { rank: 1, name: 'Alex Coder', score: 2840, streak: '24d 🔥' },
              { rank: 2, name: 'Samiran T.', score: 2710, streak: '19d 🔥' },
              { rank: 3, name: 'Elena R.', score: 2650, streak: '14d 🔥' },
            ].map(user => (
              <div key={user.rank} className="leader-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span className="leader-rank">#{user.rank}</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{user.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{user.score} pts</span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.streak}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High Impact CTA */}
      <section className="cta-banner glass-panel">
        <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
          Ready to Level Up Your <span className="text-gradient-cyan">Coding Skills?</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
          Join thousands of developers practicing algorithms, preparing for technical interviews, and competing globally on JudgeX.
        </p>
        <Link to="/register" className="btn-magnetic" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
          <span>Create Free Account</span>
          <ChevronRight size={20} />
        </Link>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
        <p>Copyright © 2026 JudgeX. Made with ♥ by Samiran.</p>
      </footer>
    </div>
  );
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        dispatch(setCredentials({ 
          user: { id: decoded.id, email: decoded.email, username: decoded.username || decoded.email }, 
          token 
        }));
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to decode token from URL', error);
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <ComputationalCanvas />
      <CodeDnaCanvas />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Welcome />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/contest" element={<ContestsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/problems/:slug" element={<Workspace />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="*" element={<div className="not-found" style={{ padding: '5rem', textAlign: 'center', color: '#fff' }}><h1>404 - Page Not Found</h1></div>} />
      </Routes>
    </Router>
  );
};

export default App;
