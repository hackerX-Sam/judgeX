import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ChevronLeft, Maximize2, Minimize2, Cpu, HardDrive, CheckCircle2, BookOpen, Code2 } from 'lucide-react';
import { API_URL } from '../../config';
import ProblemDescription from './ProblemDescription';
import CodeEditorPanel from './CodeEditorPanel';
import './Workspace.css';

export default function Workspace() {
  const { slug } = useParams();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSolved, setIsSolved] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'problem' | 'editor'>('editor');

  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/problems/${slug}`);
        const pData = response.data.problem;
        setProblem(pData);

        if (user && pData) {
          try {
            const solvedRes = await axios.get(`${API_URL}/api/submissions/solved/${user.id}`);
            const solvedIds: string[] = solvedRes.data.solvedProblemIds || [];
            setIsSolved(solvedIds.includes(pData.id));
          } catch (e) {
            console.error('Error checking solved status:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug, user]);

  if (loading) {
    return (
      <div className="workspace-loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#38bdf8' }}>⚡</div>
          <div>Initializing JudgeX IDE Workspace...</div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="workspace-error">
        <div style={{ textAlign: 'center' }}>
          <h2>Problem Not Found</h2>
          <p style={{ color: '#94a3b8', margin: '0.5rem 0 1.5rem 0' }}>The problem slug '{slug}' does not exist.</p>
          <Link to="/problems" className="back-link">
            <ChevronLeft size={16} /> Return to Problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`workspace-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* IDE Top Header */}
      <nav className="workspace-nav">
        <div className="workspace-header-meta">
          <Link to="/problems" className="back-link">
            <ChevronLeft size={16} /> Problems
          </Link>

          <span className="workspace-title-text">{problem.title}</span>

          <span className={`diff-badge diff-${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>

          {isSolved && (
            <span className="solved-status-pill">
              <CheckCircle2 size={13} /> Solved
            </span>
          )}
        </div>

        <div className="workspace-header-actions">
          <span className="limit-pill" style={{ display: 'none' }}>
            <Cpu size={13} color="#38bdf8" /> {problem.timeLimit}ms
          </span>
          <span className="limit-pill" style={{ display: 'none' }}>
            <HardDrive size={13} color="#06b6d4" /> {problem.memoryLimit}MB
          </span>

          <button 
            className="ide-btn-icon" 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            title={isFullscreen ? "Exit Fullscreen Focus Mode" : "Fullscreen Focus Mode"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </nav>

      {/* Workspace Split Panes */}
      <div className="workspace-split">
        {/* Left Pane: Problem Description */}
        <div 
          className="workspace-pane left-pane" 
          style={{ display: window.innerWidth <= 768 && mobileTab !== 'problem' ? 'none' : 'flex' }}
        >
          <ProblemDescription problem={problem} isSolved={isSolved} />
        </div>

        <div className="workspace-divider" />

        {/* Right Pane: Code Editor & Console */}
        <div 
          className="workspace-pane right-pane" 
          style={{ display: window.innerWidth <= 768 && mobileTab !== 'editor' ? 'none' : 'flex' }}
        >
          <CodeEditorPanel problem={problem} />
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="mobile-pane-switcher">
        <button 
          onClick={() => setMobileTab('problem')} 
          className={`filter-btn ${mobileTab === 'problem' ? 'active' : ''}`}
        >
          <BookOpen size={14} /> Description
        </button>
        <button 
          onClick={() => setMobileTab('editor')} 
          className={`filter-btn ${mobileTab === 'editor' ? 'active' : ''}`}
        >
          <Code2 size={14} /> Code Editor
        </button>
      </div>
    </div>
  );
}
