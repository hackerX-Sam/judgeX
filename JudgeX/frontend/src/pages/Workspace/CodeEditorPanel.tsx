import { useState, useRef, useEffect } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import axios from 'axios';
import { 
  Play, Send, Brain, Wand2, Lightbulb, RotateCcw, 
  Settings, CheckCircle2, XCircle, Clock, Cpu, Code2, Sparkles, Terminal 
} from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { API_URL } from '../../config';
import { supabase } from '../../config/supabase';
import { useTheme } from '../../theme/ThemeContext';

interface Props {
  problem: any;
}

const boilerplates: Record<string, string> = {
  javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n// Write your solution here\n",
  typescript: "import * as fs from 'fs';\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\n// Write your solution here\n",
  python: "import sys\n\nif __name__ == '__main__':\n    input_data = sys.stdin.read().split()\n    # Write your solution here\n",
  cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n",
  c: "#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n",
  go: "package main\n\nimport (\n\t\"bufio\"\n\t\"fmt\"\n\t\"os\"\n)\n\nfunc main() {\n\t// Write your solution here\n}\n",
  rust: "use std::io;\n\nfn main() {\n    // Write your solution here\n}\n",
  java: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n"
};

export default function CodeEditorPanel({ problem }: Props) {
  const { activeTheme, editorSettings, registerMonaco } = useTheme();
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(boilerplates.javascript);
  
  // Submission State
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [lastExecutionTime, setLastExecutionTime] = useState<number | null>(null);
  
  // Intelligence State
  const [activeTab, setActiveTab] = useState<'console' | 'intelligence'>('console');
  const [intelligence, setIntelligence] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  
  const [showExplanation, setShowExplanation] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const handleResetCode = () => {
    if (boilerplates[language]) {
      setCode(boilerplates[language]);
    }
  };

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStatus('⚡ Compiling & executing code in Docker sandbox...');
    setActiveTab('console');
    setLastExecutionTime(null);

    try {
      const sampleInput = problem?.testCases?.[0]?.input || '';
      const response = await axios.post(`${API_URL}/api/submissions/execute/playground`, {
        code,
        language,
        input: sampleInput
      });

      const { output: resultOutput, error, runtime } = response.data;
      setLastExecutionTime(runtime);

      if (error) {
        setStatus(`[Execution Error]\n${error}`);
      } else {
        let msg = `[Run Result]\n${resultOutput || '(No output)'}\n\n=== Execution Metrics ===\nRuntime: ${runtime}ms`;
        if (problem?.testCases?.[0]) {
          const expected = problem.testCases[0].expectedOutput.trim();
          const got = (resultOutput || '').trim();
          if (got === expected) {
            msg += `\nSample Test Case Passed! ✅`;
          } else {
            msg += `\nSample Test Case Mismatch.\nExpected: ${expected}\nGot: ${got}`;
          }
        }
        setStatus(msg);
      }
    } catch (err: any) {
      setStatus(`[System Error] Failed to run code: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleImproveCode = async () => {
    if (!submissionId || isImproving) return;
    setIsImproving(true);
    try {
      await axios.post(`${API_URL}/api/submissions/${submissionId}/improve`);
      
      // Poll for improvement status
      const interval = setInterval(async () => {
        try {
          const checkRes = await axios.get(`${API_URL}/api/submissions/${submissionId}`);
          const sub = checkRes.data.submission;
          if (sub.intelligence?.improvementStatus !== 'PENDING') {
            clearInterval(interval);
            setIntelligence(sub.intelligence);
            setIsImproving(false);
            if (sub.intelligence?.improvementStatus === 'VERIFIED_IMPROVEMENT') {
              setShowDiff(true);
            }
          }
        } catch {
          clearInterval(interval);
          setIsImproving(false);
        }
      }, 2000);
    } catch (e) {
      console.error(e);
      setIsImproving(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!user) {
      setStatus('Please log in or register to submit your code for judging.');
      setActiveTab('console');
      return;
    }
    
    // Reset state
    setIsSubmitting(true);
    setStatus('🚀 Dispatching code to JudgeX Execution Queue...');
    setActiveTab('console');
    setIntelligence(null);
    setShowExplanation(false);
    setShowDiff(false);
    setIsAnalyzing(false);

    try {
      const response = await axios.post(`${API_URL}/api/submissions`, {
        problemId: problem.id,
        code,
        language,
        userId: user.id 
      });
      
      const sid = response.data.submissionId;
      setSubmissionId(sid);
      setStatus('⚡ Container sandbox starting... Running test cases...');

      // 1. Supabase Realtime WebSocket Listener
      const channel = supabase
        .channel(`submission_${sid}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'Submission',
          filter: `id=eq.${sid}`
        }, (payload) => {
          const sub = payload.new;
          if (sub && sub.status !== 'PENDING') {
            supabase.removeChannel(channel);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsSubmitting(false);
            setLastExecutionTime(sub.executionTime || 0);

            let resultMessage = `Status: ${sub.status}\nRuntime: ${sub.executionTime || 0}ms`;
            if (sub.errorMessage) {
              resultMessage += `\nError:\n${sub.errorMessage}`;
            }
            setStatus(resultMessage);

            if (sub.status !== 'COMPILATION_ERROR') {
              setIsAnalyzing(true);
              pollForIntelligence(sid);
            }
          }
        })
        .subscribe();
      
      // 2. Backup Polling Fallback
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      
      pollIntervalRef.current = setInterval(async () => {
        try {
          const checkRes = await axios.get(`${API_URL}/api/submissions/${sid}`);
          const sub = checkRes.data.submission;
          
          if (sub.status !== 'PENDING') {
            supabase.removeChannel(channel);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setIsSubmitting(false);
            setLastExecutionTime(sub.executionTime || 0);

            let resultMessage = `Status: ${sub.status}\nRuntime: ${sub.executionTime || 0}ms`;
            if (sub.errorMessage) {
              resultMessage += `\nError:\n${sub.errorMessage}`;
            }
            setStatus(resultMessage);
            
            if (sub.status !== 'COMPILATION_ERROR') {
              setIsAnalyzing(true);
              pollForIntelligence(sid);
            }
          }
        } catch (e) {
          console.error('Status check error:', e);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsSubmitting(false);
          setStatus('Error checking submission status.');
        }
      }, 1000);

    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      setStatus('Error submitting code.');
    }
  };

  const pollForIntelligence = (sid: string) => {
    const aiInterval = setInterval(async () => {
      try {
        const checkRes = await axios.get(`${API_URL}/api/submissions/${sid}`);
        const intl = checkRes.data.submission.intelligence;
        if (intl) {
          clearInterval(aiInterval);
          setIntelligence(intl);
          setIsAnalyzing(false);
        }
      } catch {
        clearInterval(aiInterval);
        setIsAnalyzing(false);
      }
    }, 2000);
  };

  // Keyboard Shortcuts: Ctrl+Enter (Run) & Ctrl+Shift+Enter (Submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmit();
        } else {
          handleRun();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, user, isRunning, isSubmitting]);

  return (
    <div className="code-editor-container">
      {/* IDE Glass Toolbar */}
      <div className="editor-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select 
            className="language-select-glass"
            value={language} 
            onChange={(e) => {
              const newLang = e.target.value;
              setLanguage(newLang);
              setCode(boilerplates[newLang] || '');
            }}
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="typescript">TypeScript (Node 22)</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ (g++)</option>
            <option value="c">C (gcc)</option>
            <option value="java">Java 11</option>
            <option value="go">Go 1.20</option>
            <option value="rust">Rust 1.70</option>
          </select>

          <button 
            className="ide-btn-icon" 
            onClick={handleResetCode} 
            title="Reset code to boilerplate"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <div className="toolbar-actions">
          <div className="keyboard-shortcut" style={{ display: 'none' }}>
            <span>Ctrl</span><span>+</span><span>Enter</span>
          </div>

          <button 
            className="btn-ide-run" 
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
          >
            <Play size={14} fill="currentColor" /> {isRunning ? 'Running...' : 'Run'}
          </button>

          <button 
            className="btn-ide-submit" 
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
          >
            <Send size={14} /> {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
      
      {/* Monaco & Diff Editor Container */}
      <div className="editor-wrapper">
        {showDiff && intelligence?.improvedCode ? (
          <DiffEditor
            height="100%"
            language={language}
            theme={activeTheme.monacoThemeId}
            beforeMount={registerMonaco}
            original={code}
            modified={intelligence.improvedCode}
            options={{
              minimap: { enabled: editorSettings.minimap },
              fontSize: editorSettings.fontSize,
              fontFamily: editorSettings.fontFamily,
              wordWrap: editorSettings.wordWrap,
              lineNumbers: editorSettings.lineNumbers,
              cursorStyle: editorSettings.cursorStyle,
              padding: { top: 16 },
              renderSideBySide: true,
              readOnly: true
            }}
          />
        ) : (
          <Editor
            height="100%"
            language={language}
            theme={activeTheme.monacoThemeId}
            beforeMount={registerMonaco}
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: editorSettings.minimap },
              fontSize: editorSettings.fontSize,
              fontFamily: editorSettings.fontFamily,
              wordWrap: editorSettings.wordWrap,
              lineNumbers: editorSettings.lineNumbers,
              cursorStyle: editorSettings.cursorStyle,
              tabSize: editorSettings.tabSize,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              lineNumbersMinChars: 3,
              automaticLayout: true
            }}
          />
        )}
      </div>

      {/* Execution & Intelligence Console */}
      <div className="results-panel-glass">
        <div className="results-tabs-bar">
          <div 
            className={`results-tab-item ${activeTab === 'console' ? 'active' : ''}`}
            onClick={() => setActiveTab('console')}
          >
            <Terminal size={15} /> Console Output
            {lastExecutionTime !== null && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '4px' }}>
                {lastExecutionTime}ms
              </span>
            )}
          </div>

          <div 
            className={`results-tab-item ${activeTab === 'intelligence' ? 'active' : ''}`}
            onClick={() => setActiveTab('intelligence')}
          >
            <Brain size={15} color="#38bdf8" /> Code Intelligence 
            {isAnalyzing && <span style={{ fontSize: '11px', color: '#fbbf24' }}>(Analyzing...)</span>}
            {intelligence && <span style={{ fontSize: '11px', color: '#34d399' }}>(Ready ✨)</span>}
          </div>
        </div>
        
        <div className="results-content-area">
          {activeTab === 'console' && (
            <pre className="console-output-text">
              {status || "Click 'Run' to test against sample inputs or 'Submit' to judge against testcases."}
            </pre>
          )}

          {activeTab === 'intelligence' && (
            <div>
              {!intelligence && !isAnalyzing && (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem' }}>
                  <Sparkles size={28} color="#38bdf8" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                  Submit your code to generate an AI performance analysis and optimization review.
                </div>
              )}

              {isAnalyzing && (
                <div style={{ color: '#fbbf24', textAlign: 'center', padding: '1.5rem' }}>
                  ⚡ Generating comprehensive GPT-4o AI code intelligence report...
                </div>
              )}
              
              {intelligence && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="score-card-glass">
                      <div className="score-value" style={{ color: intelligence.qualityScore >= 80 ? '#10b981' : '#f59e0b' }}>
                        {intelligence.qualityScore}/100
                      </div>
                      <div className="score-label">Quality Score</div>
                    </div>
                    <div className="score-card-glass">
                      <div className="score-value" style={{ color: '#38bdf8' }}>{intelligence.timeComplexity}</div>
                      <div className="score-label">Time Complexity</div>
                    </div>
                    <div className="score-card-glass">
                      <div className="score-value" style={{ color: '#06b6d4' }}>{intelligence.spaceComplexity}</div>
                      <div className="score-label">Space Complexity</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => setShowExplanation(!showExplanation)}
                      className="filter-btn active"
                      style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }}
                    >
                      <Lightbulb size={15} /> {showExplanation ? 'Hide Explanation' : 'Explain My Code'}
                    </button>
                    
                    <button 
                      onClick={handleImproveCode}
                      disabled={isImproving || intelligence.improvementStatus === 'VERIFIED_IMPROVEMENT'}
                      className="filter-btn active"
                      style={{ background: 'rgba(59,130,246,0.2)', borderColor: '#38bdf8', color: '#38bdf8' }}
                    >
                      <Wand2 size={15} /> 
                      {isImproving ? 'Verifying Improvement...' : 
                       intelligence.improvementStatus === 'VERIFIED_IMPROVEMENT' ? 'Improvement Verified!' : 
                       'Improve My Code'}
                    </button>

                    {intelligence.improvementStatus === 'VERIFIED_IMPROVEMENT' && (
                      <button 
                        onClick={() => setShowDiff(!showDiff)}
                        className="filter-btn"
                      >
                        {showDiff ? 'Hide Diff' : 'Show Diff'}
                      </button>
                    )}
                  </div>

                  {showExplanation && (
                    <div style={{ background: 'rgba(9,13,22,0.85)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8' }}>Code Explanation</h4>
                      <p style={{ lineHeight: '1.6', color: '#cbd5e1', fontSize: '0.875rem' }}>{intelligence.explanation}</p>
                      
                      <h4 style={{ color: '#fbbf24', marginTop: '1rem', marginBottom: '0.4rem' }}>Code Smells Identified</h4>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                        {JSON.parse(intelligence.codeSmells || '[]').map((smell: string, i: number) => (
                          <li key={i}>{smell}</li>
                        ))}
                        {JSON.parse(intelligence.codeSmells || '[]').length === 0 && <li>No code smells detected! ✨</li>}
                      </ul>
                      
                      <h4 style={{ color: '#ef4444', marginTop: '1rem', marginBottom: '0.4rem' }}>Edge Cases to Consider</h4>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                        {JSON.parse(intelligence.edgeCases || '[]').map((ec: string, i: number) => (
                          <li key={i}>{ec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {intelligence.improvementStatus === 'FAILED_VERIFICATION' && (
                    <div style={{ padding: '0.8rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <strong>AI Verification Note:</strong> The AI proposed an improvement, but it failed sandbox verification. Your original code remains the active solution.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
