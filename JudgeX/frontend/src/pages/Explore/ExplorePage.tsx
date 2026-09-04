import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';
import { Navbar } from '../../components/Navbar';
import MagneticCard from '../../components/MagneticCard';
import AnimatedCounter from '../../components/AnimatedCounter';
import { 
  Search, Compass, CheckCircle2, Circle, Trophy, Flame, 
  Sparkles, Code2, ArrowRight, Layers, X, RefreshCw, Filter, 
  SlidersHorizontal, Check, BookOpen, Cpu, Hash
} from 'lucide-react';
import './ExplorePage.css';

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  description?: string;
  timeLimit?: number;
  memoryLimit?: number;
  createdAt?: string;
  _count?: {
    submissions?: number;
    testCases?: number;
  };
}

// Helper to deduce topic tags from problem title/description
const inferTags = (title: string, description: string = ''): string[] => {
  const text = `${title} ${description}`.toLowerCase();
  const tags: string[] = [];

  if (text.includes('sum') || text.includes('array') || text.includes('matrix') || text.includes('subsets')) {
    tags.push('Array');
  }
  if (text.includes('string') || text.includes('palindrome') || text.includes('parentheses') || text.includes('substring')) {
    tags.push('String');
  }
  if (text.includes('water') || text.includes('two pointers') || text.includes('container') || text.includes('pointer')) {
    tags.push('Two Pointers');
  }
  if (text.includes('tree') || text.includes('bst') || text.includes('binary')) {
    tags.push('Trees');
  }
  if (text.includes('list') || text.includes('node') || text.includes('lru')) {
    tags.push('Linked List');
  }
  if (text.includes('dynamic') || text.includes('dp') || text.includes('maximum') || text.includes('longest')) {
    tags.push('Dynamic Programming');
  }
  if (text.includes('graph') || text.includes('dfs') || text.includes('bfs')) {
    tags.push('Graphs');
  }
  if (text.includes('hash') || text.includes('map') || text.includes('set')) {
    tags.push('Hash Table');
  }

  return tags.length > 0 ? tags : ['General Algorithm'];
};

export default function ExplorePage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'solved' | 'todo'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'difficulty' | 'title' | 'newest'>('recommended');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = useSelector((state: any) => state.auth.user);

  // Fetch real problems & user solved IDs
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/problems`);
      const fetchedProblems: Problem[] = response.data.problems || [];
      setProblems(fetchedProblems);

      if (user) {
        try {
          const solvedRes = await axios.get(`${API_URL}/api/submissions/solved/${user.id}`);
          setSolvedIds(solvedRes.data.solvedProblemIds || []);
        } catch (e) {
          console.error('Error fetching solved problems:', e);
        }
      }
    } catch (err: any) {
      console.error('Error fetching explore page data:', err);
      setError('Failed to load problems. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Keyboard shortcut (Ctrl+K or ⌘K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute topic counts dynamically from real problems
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Array': 0,
      'String': 0,
      'Two Pointers': 0,
      'Trees': 0,
      'Linked List': 0,
      'Dynamic Programming': 0,
      'Hash Table': 0,
      'Graphs': 0,
    };

    problems.forEach(p => {
      const tags = inferTags(p.title, p.description);
      tags.forEach(t => {
        if (counts[t] !== undefined) counts[t]++;
      });
    });

    return counts;
  }, [problems]);

  // Compute difficulty metrics
  const diffMetrics = useMemo(() => {
    const easyTotal = problems.filter(p => p.difficulty.toLowerCase() === 'easy').length;
    const mediumTotal = problems.filter(p => p.difficulty.toLowerCase() === 'medium').length;
    const hardTotal = problems.filter(p => p.difficulty.toLowerCase() === 'hard').length;

    const easySolved = problems.filter(p => p.difficulty.toLowerCase() === 'easy' && solvedIds.includes(p.id)).length;
    const mediumSolved = problems.filter(p => p.difficulty.toLowerCase() === 'medium' && solvedIds.includes(p.id)).length;
    const hardSolved = problems.filter(p => p.difficulty.toLowerCase() === 'hard' && solvedIds.includes(p.id)).length;

    return {
      easy: { total: easyTotal, solved: easySolved },
      medium: { total: mediumTotal, solved: mediumSolved },
      hard: { total: hardTotal, solved: hardSolved }
    };
  }, [problems, solvedIds]);

  // Filter & Sort Logic
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inferTags(p.title, p.description).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDiff = selectedDifficulty === 'all' || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
      
      const pTags = inferTags(p.title, p.description);
      const matchesTopic = selectedTopic === 'all' || pTags.includes(selectedTopic);

      const isSolved = solvedIds.includes(p.id);
      const matchesStatus = 
        selectedStatus === 'all' ||
        (selectedStatus === 'solved' && isSolved) ||
        (selectedStatus === 'todo' && !isSolved);

      return matchesSearch && matchesDiff && matchesTopic && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'difficulty') {
        const order: Record<string, number> = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        return (order[a.difficulty] || 2) - (order[b.difficulty] || 2);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0; // Default Recommended
    });
  }, [problems, searchQuery, selectedDifficulty, selectedTopic, selectedStatus, sortBy, solvedIds]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty('all');
    setSelectedTopic('all');
    setSelectedStatus('all');
    setSortBy('recommended');
  };

  return (
    <div className="landing-page" style={{ position: 'relative', zIndex: 1 }}>
      <Navbar active="explore" />

      <div className="explore-container">
        {/* 1. Explore Hero Section */}
        <section className="explore-hero">
          <div className="explore-badge animate-glow">
            <Compass size={15} />
            <span>DISCOVER & PRACTICE</span>
          </div>

          <h1 className="explore-title">
            Explore. <span className="text-gradient-cyan">Solve. Evolve.</span>
          </h1>

          <p className="explore-subtitle">
            Master algorithm challenges, filter curated topic tracks, track your personal progress, and benchmark your solutions in Docker sandboxes.
          </p>

          {/* Global Search Bar */}
          <div className="explore-search-wrapper">
            <div className="explore-search-box">
              <Search size={18} color="#38bdf8" />
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems by title, topic, or tags..." 
                className="explore-search-input"
              />
              {searchQuery ? (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              ) : (
                <div className="keyboard-shortcut">
                  <span>⌘</span>
                  <span>K</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 2. Stats & Progress Overview */}
        <section className="explore-stats-grid">
          <div className="glass-card explore-stat-card">
            <div className="stat-icon-wrapper icon-blue">
              <Code2 size={24} />
            </div>
            <div>
              <div className="stat-number text-gradient-blue">
                <AnimatedCounter end={problems.length || 4} suffix="" />
              </div>
              <div className="stat-label">Available Problems</div>
            </div>
          </div>

          <div className="glass-card explore-stat-card">
            <div className="stat-icon-wrapper icon-emerald">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="stat-number text-gradient-emerald">
                <AnimatedCounter end={solvedIds.length} suffix="" />
              </div>
              <div className="stat-label">Problems Solved</div>
            </div>
          </div>

          <div className="glass-card explore-stat-card">
            <div className="stat-icon-wrapper icon-cyan">
              <Trophy size={24} />
            </div>
            <div>
              <div className="stat-number text-gradient-cyan">
                {problems.length ? Math.round((solvedIds.length / problems.length) * 100) : 0}%
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>

          <div className="glass-card explore-stat-card">
            <div className="stat-icon-wrapper icon-amber">
              <Flame size={24} />
            </div>
            <div>
              <div className="stat-number text-gradient-amber">
                <AnimatedCounter end={14} suffix=" Docker" />
              </div>
              <div className="stat-label">Execution Sandboxes</div>
            </div>
          </div>
        </section>

        {/* 3. Featured / Recommended Section */}
        {problems.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div className="explore-section-header">
              <div>
                <h2 className="explore-section-title">
                  <Sparkles size={20} color="#fbbf24" />
                  <span>Featured Challenges</span>
                </h2>
                <p className="explore-section-subtitle">Recommended problems to start practicing today</p>
              </div>
            </div>

            <div className="showcase-grid">
              {problems.slice(0, 3).map((p) => {
                const tags = inferTags(p.title, p.description);
                const isSolved = solvedIds.includes(p.id);
                return (
                  <MagneticCard key={p.id}>
                    <div className="problem-card-content" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                          <span className={`diff-badge diff-${p.difficulty.toLowerCase()}`}>
                            {p.difficulty}
                          </span>
                          {isSolved ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                              <CheckCircle2 size={16} /> Solved
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                              {p._count?.submissions || 0} Attempts
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem', color: '#fff' }}>
                          {p.title}
                        </h3>

                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.description ? p.description.replace(/<[^>]+>/g, '') : 'Solve this algorithmic challenge using your choice of 8 supported languages.'}
                        </p>

                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                          {tags.map(t => (
                            <span key={t} style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Link to={`/problems/${p.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                        <span>Solve Challenge</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </MagneticCard>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. Browse by Topic */}
        <section style={{ marginBottom: '3rem' }}>
          <div className="explore-section-header">
            <div>
              <h2 className="explore-section-title">
                <Layers size={20} color="#38bdf8" />
                <span>Browse by Topic</span>
              </h2>
              <p className="explore-section-subtitle">Filter problem tracks by algorithm pattern</p>
            </div>
            {selectedTopic !== 'all' && (
              <button onClick={() => setSelectedTopic('all')} className="filter-btn active">
                Clear Topic Filter <X size={14} />
              </button>
            )}
          </div>

          <div className="topic-grid">
            {Object.entries(topicCounts).map(([topic, count]) => {
              const isActive = selectedTopic === topic;
              return (
                <div 
                  key={topic} 
                  className={`topic-card ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedTopic(isActive ? 'all' : topic)}
                >
                  <div className="topic-info">
                    <Hash size={16} color={isActive ? '#38bdf8' : '#64748b'} />
                    <span className="topic-name">{topic}</span>
                  </div>
                  <span className="topic-count">{count}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Difficulty Skill Paths */}
        <section style={{ marginBottom: '3rem' }}>
          <div className="explore-section-header">
            <div>
              <h2 className="explore-section-title">
                <Cpu size={20} color="#34d399" />
                <span>Difficulty Skill Paths</span>
              </h2>
              <p className="explore-section-subtitle">Choose your target problem complexity</p>
            </div>
          </div>

          <div className="difficulty-grid">
            <div 
              className={`glass-card diff-card diff-card-easy ${selectedDifficulty === 'easy' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty(selectedDifficulty === 'easy' ? 'all' : 'easy')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="diff-badge diff-easy">Easy</span>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                  {diffMetrics.easy.solved} / {diffMetrics.easy.total} Solved
                </span>
              </div>
              <h3 style={{ marginTop: '0.8rem', fontSize: '1.3rem', fontWeight: 800 }}>Beginner Track</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.3rem' }}>Fundamental algorithms, basic loops, and string manipulations.</p>
              <div className="diff-progress-bar">
                <div 
                  className="diff-progress-fill" 
                  style={{ width: `${diffMetrics.easy.total ? (diffMetrics.easy.solved / diffMetrics.easy.total) * 100 : 0}%`, background: '#10b981' }} 
                />
              </div>
            </div>

            <div 
              className={`glass-card diff-card diff-card-medium ${selectedDifficulty === 'medium' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty(selectedDifficulty === 'medium' ? 'all' : 'medium')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="diff-badge diff-medium">Medium</span>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                  {diffMetrics.medium.solved} / {diffMetrics.medium.total} Solved
                </span>
              </div>
              <h3 style={{ marginTop: '0.8rem', fontSize: '1.3rem', fontWeight: 800 }}>Intermediate Track</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.3rem' }}>Two pointers, binary search, sliding window, and tree traversals.</p>
              <div className="diff-progress-bar">
                <div 
                  className="diff-progress-fill" 
                  style={{ width: `${diffMetrics.medium.total ? (diffMetrics.medium.solved / diffMetrics.medium.total) * 100 : 0}%`, background: '#f59e0b' }} 
                />
              </div>
            </div>

            <div 
              className={`glass-card diff-card diff-card-hard ${selectedDifficulty === 'hard' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty(selectedDifficulty === 'hard' ? 'all' : 'hard')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="diff-badge diff-hard">Hard</span>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                  {diffMetrics.hard.solved} / {diffMetrics.hard.total} Solved
                </span>
              </div>
              <h3 style={{ marginTop: '0.8rem', fontSize: '1.3rem', fontWeight: 800 }}>Advanced Track</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.3rem' }}>Dynamic programming, complex graphs, hard data structure design.</p>
              <div className="diff-progress-bar">
                <div 
                  className="diff-progress-fill" 
                  style={{ width: `${diffMetrics.hard.total ? (diffMetrics.hard.solved / diffMetrics.hard.total) * 100 : 0}%`, background: '#ef4444' }} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* 6. Problem Discovery Grid & Filter Toolbar */}
        <section>
          <div className="explore-section-header">
            <div>
              <h2 className="explore-section-title">
                <SlidersHorizontal size={20} color="#06b6d4" />
                <span>Problem Discovery Library</span>
              </h2>
              <p className="explore-section-subtitle">Showing {filteredProblems.length} of {problems.length} problems</p>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="glass-card explore-filter-bar">
            <div className="filter-group">
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Filter size={14} /> Difficulty:
              </span>
              {['all', 'easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  className={`filter-btn ${selectedDifficulty === diff ? 'active' : ''}`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>

            <div className="filter-group">
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Status:</span>
              <button 
                className={`filter-btn ${selectedStatus === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${selectedStatus === 'solved' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('solved')}
              >
                Solved
              </button>
              <button 
                className={`filter-btn ${selectedStatus === 'todo' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('todo')}
              >
                Todo
              </button>

              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginLeft: '0.8rem' }}>Sort:</span>
              <select 
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="explore-select"
              >
                <option value="recommended">Recommended</option>
                <option value="difficulty">Difficulty</option>
                <option value="title">Title (A-Z)</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="problem-grid-wrapper">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="glass-card explore-state-panel">
              <div className="explore-state-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                <X size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Unable to Load Problems</h3>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>{error}</p>
              <button onClick={fetchData} className="btn-magnetic" style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}>
                <RefreshCw size={14} /> Retry Request
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProblems.length === 0 && (
            <div className="glass-card explore-state-panel">
              <div className="explore-state-icon">
                <Search size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Matching Problems Found</h3>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                We couldn't find any challenges matching your current search query or filter selection.
              </p>
              <button onClick={resetFilters} className="btn-magnetic" style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}>
                <RefreshCw size={14} /> Reset All Filters
              </button>
            </div>
          )}

          {/* Real Problem Grid */}
          {!loading && !error && filteredProblems.length > 0 && (
            <div className="problem-grid-wrapper">
              {filteredProblems.map((p) => {
                const tags = inferTags(p.title, p.description);
                const isSolved = solvedIds.includes(p.id);

                return (
                  <MagneticCard key={p.id}>
                    <div className="explore-problem-card">
                      <div>
                        <div className="problem-card-header">
                          <Link to={`/problems/${p.slug}`} className="problem-card-title">
                            {p.title}
                          </Link>
                          <span className={`diff-badge diff-${p.difficulty.toLowerCase()}`}>
                            {p.difficulty}
                          </span>
                        </div>

                        <p className="problem-desc-snippet">
                          {p.description ? p.description.replace(/<[^>]+>/g, '') : 'Implement a working algorithm and verify test cases.'}
                        </p>

                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                          {tags.map(t => (
                            <span key={t} style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="problem-card-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isSolved ? (
                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                              <CheckCircle2 size={16} /> Solved
                            </span>
                          ) : (
                            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Circle size={16} /> Unsolved
                            </span>
                          )}
                        </div>

                        <Link to={`/problems/${p.slug}`} style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Solve <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </MagneticCard>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginTop: '4rem' }}>
        <p>Copyright © 2026 JudgeX. Made with ♥ by Samiran.</p>
      </footer>
    </div>
  );
}
