import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../../components/Navbar';
import ComputationalCanvas from '../../components/ComputationalCanvas';
import TechText from '../../components/TechText';
import { API_URL } from '../../config';
import { supabase } from '../../config/supabase';
import { 
  ShieldAlert, Plus, Edit3, Trash2, Eye, EyeOff, 
  CheckCircle2, AlertCircle, FileText, Code2, 
  Layers, Lock, Sparkles, RefreshCw, ChevronLeft
} from 'lucide-react';
import './AdminPage.css';

interface TestCaseInput {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface ProblemItem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  timeLimit: number;
  memoryLimit: number;
  isPublished?: boolean;
  createdAt?: string;
  testCases?: TestCaseInput[];
}

export default function AdminPage() {
  const user = useSelector((state: any) => state.auth.user);
  const token = useSelector((state: any) => state.auth.token);
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // Management State
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<ProblemItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [description, setDescription] = useState('');
  const [constraints, setConstraints] = useState('');
  const [timeLimit, setTimeLimit] = useState(1000);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [isPublished, setIsPublished] = useState(true);
  const [testCases, setTestCases] = useState<TestCaseInput[]>([
    { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
    { input: '3 3\n6', expectedOutput: '0 1', isHidden: true }
  ]);

  // 1. Verify Admin Role Server-Side via Supabase Profiles
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoadingRole(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        setIsAdmin(false);
      } finally {
        setLoadingRole(false);
      }
    };
    checkAdminRole();
  }, [user]);

  // 2. Fetch Problems List
  const fetchProblems = async () => {
    try {
      setLoadingProblems(true);
      const res = await axios.get(`${API_URL}/api/problems`);
      setProblems(res.data.problems || []);
    } catch (err) {
      console.error('Failed to fetch admin problems list', err);
    } finally {
      setLoadingProblems(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProblems();
    }
  }, [isAdmin]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Add / Edit Testcase Field
  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index: number, field: keyof TestCaseInput, value: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  // Open Modal for New Problem
  const handleOpenCreateModal = () => {
    setEditingProblem(null);
    setTitle('');
    setDifficulty('Easy');
    setDescription('');
    setConstraints('');
    setTimeLimit(1000);
    setMemoryLimit(256);
    setIsPublished(true);
    setTestCases([
      { input: '2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
      { input: '3 3\n6', expectedOutput: '0 1', isHidden: true }
    ]);
    setIsModalOpen(true);
  };

  // Open Modal for Edit Problem
  const handleOpenEditModal = (p: ProblemItem) => {
    setEditingProblem(p);
    setTitle(p.title);
    setDifficulty(p.difficulty);
    setDescription(p.description);
    setTimeLimit(p.timeLimit || 1000);
    setMemoryLimit(p.memoryLimit || 256);
    setIsPublished(p.isPublished ?? true);
    setIsModalOpen(true);
  };

  // Submit Form (Create or Update)
  const handleSubmitProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('error', 'Title and Description are required');
      return;
    }

    try {
      const payload = {
        title,
        description,
        difficulty,
        timeLimit,
        memoryLimit,
        isPublished,
        testCases
      };

      const headers = { Authorization: `Bearer ${token}` };

      if (editingProblem) {
        await axios.put(`${API_URL}/api/problems/${editingProblem.id}`, payload, { headers });
        showToast('success', `Problem '${title}' updated successfully`);
      } else {
        await axios.post(`${API_URL}/api/problems`, payload, { headers });
        showToast('success', `Problem '${title}' created successfully`);
      }

      setIsModalOpen(false);
      fetchProblems();
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Failed to save problem');
    }
  };

  // Delete Problem
  const handleDeleteProblem = async (id: string, problemTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete problem '${problemTitle}'? This cannot be undone.`)) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/api/problems/${id}`, { headers });
      showToast('success', `Deleted problem '${problemTitle}'`);
      fetchProblems();
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Failed to delete problem');
    }
  };

  if (loadingRole) {
    return (
      <div className="admin-page-loading">
        <RefreshCw className="animate-spin" size={28} color="#38bdf8" />
        <p>Verifying Admin Authorization Credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="landing-page" style={{ position: 'relative', zIndex: 1 }}>
        <Navbar active="admin" />
        <div className="admin-access-denied glass-panel">
          <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <h2>Access Denied</h2>
          <p>You do not have Administrative Privileges to access the JudgeX Admin Dashboard.</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/problems" className="btn-secondary">
              <ChevronLeft size={16} /> Return to Problems
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-page" style={{ position: 'relative', zIndex: 1 }}>
      <Navbar active="admin" />

      <div className="admin-container">
        {/* Status Toast */}
        {statusMessage && (
          <div className={`admin-toast toast-${statusMessage.type} animate-slide-down`}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Admin Header */}
        <section className="admin-hero glass-panel">
          <div className="admin-badge">
            <Lock size={14} />
            <span>JUDGEX ADMIN MANAGEMENT PORTAL</span>
          </div>

          <div style={{ width: '100%', height: '100px', position: 'relative', margin: '0 auto 1rem' }}>
            <TechText
              text="Problem Curator & Sandbox Engine"
              fontWeight={900}
              fontSize={65}
              color="#ffffff"
              accentColor="#f87171"
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={15}
            />
          </div>

          <p className="admin-subtitle">
            Create, edit, and publish algorithm challenges, define hidden evaluation test cases, and manage JudgeX competitive problem sets.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={handleOpenCreateModal} className="btn-new-post">
              <Plus size={18} />
              <span>Create New Problem</span>
            </button>
            <button onClick={fetchProblems} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RefreshCw size={16} />
              <span>Refresh Problems</span>
            </button>
          </div>
        </section>

        {/* Problems Table */}
        <div className="glass-card admin-table-card">
          <div className="admin-table-header">
            <h3>Managed Problems ({problems.length})</h3>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Real-time Supabase Database Sync</span>
          </div>

          {loadingProblems ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <RefreshCw className="animate-spin" size={24} color="#38bdf8" />
              <p style={{ marginTop: '0.5rem' }}>Loading problems from database...</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title & Slug</th>
                  <th>Difficulty</th>
                  <th>Execution Limits</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                      No problems found in database. Click "Create New Problem" to publish one!
                    </td>
                  </tr>
                ) : (
                  problems.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{p.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>/problems/{p.slug}</div>
                      </td>
                      <td>
                        <span className={`diff-badge diff-${p.difficulty.toLowerCase()}`}>
                          {p.difficulty}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                          ⏱️ {p.timeLimit || 1000}ms | 💾 {p.memoryLimit || 256}MB
                        </div>
                      </td>
                      <td>
                        {p.isPublished !== false ? (
                          <span className="status-pill status-active"><Eye size={13} /> Published</span>
                        ) : (
                          <span className="status-pill status-draft"><EyeOff size={13} /> Draft</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/problems/${p.slug}`} target="_blank" className="icon-btn-action" title="View Problem Workspace">
                            <Eye size={15} />
                          </Link>
                          <button onClick={() => handleOpenEditModal(p)} className="icon-btn-action" title="Edit Problem">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={() => handleDeleteProblem(p.id, p.title)} className="icon-btn-action delete" title="Delete Problem">
                            <Trash2 size={15} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Problem Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content glass-panel admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProblem ? `Edit Problem: ${editingProblem.title}` : 'Create New Coding Problem'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProblem}>
              <div className="form-group">
                <label className="form-label">Problem Title</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Longest Palindromic Substring"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row-2">
                <div>
                  <label className="form-label">Difficulty</label>
                  <select 
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="form-select"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Publication Status</label>
                  <select 
                    value={isPublished ? 'published' : 'draft'}
                    onChange={(e) => setIsPublished(e.target.value === 'published')}
                    className="form-select"
                  >
                    <option value="published">Published (Visible to Students)</option>
                    <option value="draft">Draft (Hidden from Library)</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div>
                  <label className="form-label">Time Limit (Milliseconds)</label>
                  <input 
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 1000)}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Memory Limit (Megabytes)</label>
                  <input 
                    type="number"
                    value={memoryLimit}
                    onChange={(e) => setMemoryLimit(parseInt(e.target.value) || 256)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Problem Description (Markdown Supported)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Given an array nums... Write an efficient algorithm to solve..."
                  className="form-textarea"
                  style={{ minHeight: '150px' }}
                  required
                />
              </div>

              {/* Test Cases Manager */}
              <div className="testcase-manager-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Evaluation Test Cases ({testCases.length})
                  </label>
                  <button type="button" onClick={handleAddTestCase} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                    + Add Test Case
                  </button>
                </div>

                <div className="testcases-list">
                  {testCases.map((tc, idx) => (
                    <div key={idx} className="testcase-item-card">
                      <div className="testcase-item-header">
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: tc.isHidden ? '#f59e0b' : '#10b981' }}>
                          Test Case #{idx + 1} {tc.isHidden ? '(Hidden Security Evaluation)' : '(Public Sample)'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox"
                              checked={tc.isHidden}
                              onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                            />
                            Hidden Test Case
                          </label>
                          <button type="button" onClick={() => handleRemoveTestCase(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="form-row-2" style={{ margin: 0 }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Input</span>
                          <textarea 
                            value={tc.input}
                            onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                            className="form-textarea"
                            style={{ minHeight: '60px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                          />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Expected Output</span>
                          <textarea 
                            value={tc.expectedOutput}
                            onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                            className="form-textarea"
                            style={{ minHeight: '60px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions-right" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-new-post">
                  {editingProblem ? 'Save Changes' : 'Publish Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="discuss-footer">
        <p>Copyright © 2026 JudgeX Admin Console. Sealed with ⚡ for platform administration.</p>
      </footer>
    </div>
  );
}
