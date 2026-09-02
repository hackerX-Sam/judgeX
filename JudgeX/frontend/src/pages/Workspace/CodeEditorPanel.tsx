import { useState, useRef } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import axios from 'axios';
import { Play, Send, Brain, Wand2, Lightbulb } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { API_URL } from '../../config';

interface Props {
  problem: any;
}

const boilerplates = {
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
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(boilerplates.javascript);
  
  // Submission State
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  
  // Intelligence State
  const [activeTab, setActiveTab] = useState<'console' | 'intelligence'>('console');
  const [intelligence, setIntelligence] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [showExplanation, setShowExplanation] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const handleImproveCode = async () => {
    if (!submissionId) return;
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
    if (!user) {
      setStatus('Please log in or register to submit your code.');
      setActiveTab('console');
      return;
    }
    
    // Reset state
    setStatus('Submitting...');
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
      setStatus('Executing Code (Container starting)...');
      
      // Poll for normal execution
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      
      pollIntervalRef.current = setInterval(async () => {
        try {
          const checkRes = await axios.get(`${API_URL}/api/submissions/${sid}`);
          const sub = checkRes.data.submission;
          
          if (sub.status !== 'PENDING') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            let resultMessage = `Status: ${sub.status}\nRuntime: ${sub.executionTime || 0}ms`;
            if (sub.errorMessage) {
              resultMessage += `\nError:\n${sub.errorMessage}`;
            }
            setStatus(resultMessage);
            
            // If it's a valid run, wait for AI analysis in the background
            if (sub.status !== 'COMPILATION_ERROR') {
              setIsAnalyzing(true);
              pollForIntelligence(sid);
            }
          }
        } catch (e) {
          console.error('Status check error:', e);
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setStatus('Error checking submission status.');
        }
      }, 1000);

    } catch (error) {
      console.error(error);
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

  return (
    <div className="code-editor-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="editor-toolbar" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#1e1e1e', color: 'white' }}>
        <select 
          className="language-select"
          value={language} 
          onChange={(e) => {
            const newLang = e.target.value;
            setLanguage(newLang);
            setCode(boilerplates[newLang as keyof typeof boilerplates]);
          }}
          style={{ background: '#333', color: '#fff', border: 'none', padding: '5px 10px' }}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
        </select>
        <div className="toolbar-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-run" style={{ background: '#444', color: '#fff', padding: '5px 15px', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}><Play size={14}/> Run</button>
          <button className="btn-submit" onClick={handleSubmit} style={{ background: '#2ea043', color: '#fff', padding: '5px 15px', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><Send size={14}/> Submit</button>
        </div>
      </div>
      
      <div className="editor-wrapper" style={{ flex: 1, position: 'relative' }}>
        {showDiff && intelligence?.improvedCode ? (
          <DiffEditor
            height="100%"
            language={language}
            theme="vs-dark"
            original={code}
            modified={intelligence.improvedCode}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
              renderSideBySide: true,
              readOnly: true
            }}
          />
        ) : (
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        )}
      </div>

      <div className="results-panel" style={{ height: '35%', borderTop: '1px solid #333', backgroundColor: '#1e1e1e', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div className="results-tabs" style={{ display: 'flex', borderBottom: '1px solid #333' }}>
          <div 
            onClick={() => setActiveTab('console')}
            style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === 'console' ? '2px solid #58a6ff' : 'none', opacity: activeTab === 'console' ? 1 : 0.6 }}
          >
            Console Output
          </div>
          <div 
            onClick={() => setActiveTab('intelligence')}
            style={{ padding: '10px 20px', cursor: 'pointer', borderBottom: activeTab === 'intelligence' ? '2px solid #58a6ff' : 'none', opacity: activeTab === 'intelligence' ? 1 : 0.6, display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Brain size={16} /> Code Intelligence {isAnalyzing && <span style={{ fontSize: '12px', color: '#8b949e' }}>(Analyzing...)</span>}
          </div>
        </div>
        
        <div className="results-content" style={{ flex: 1, padding: '15px', overflowY: 'auto' }}>
          {activeTab === 'console' && (
            <pre style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {status || "Run or submit your code to see results."}
            </pre>
          )}

          {activeTab === 'intelligence' && (
            <div>
              {!intelligence && !isAnalyzing && <div>Submit code to get an AI analysis.</div>}
              {isAnalyzing && <div style={{ color: '#8b949e' }}>Generating comprehensive AI report...</div>}
              
              {intelligence && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ background: '#2d2d2d', padding: '15px', borderRadius: '8px', flex: 1 }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: intelligence.qualityScore > 80 ? '#2ea043' : '#d29922' }}>
                        {intelligence.qualityScore}/100
                      </div>
                      <div style={{ fontSize: '12px', color: '#8b949e' }}>Quality Score</div>
                    </div>
                    <div style={{ background: '#2d2d2d', padding: '15px', borderRadius: '8px', flex: 1 }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{intelligence.timeComplexity}</div>
                      <div style={{ fontSize: '12px', color: '#8b949e' }}>Time Complexity</div>
                    </div>
                    <div style={{ background: '#2d2d2d', padding: '15px', borderRadius: '8px', flex: 1 }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{intelligence.spaceComplexity}</div>
                      <div style={{ fontSize: '12px', color: '#8b949e' }}>Space Complexity</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => setShowExplanation(!showExplanation)}
                      style={{ background: '#238636', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Lightbulb size={16} /> Explain My Code
                    </button>
                    
                    <button 
                      onClick={handleImproveCode}
                      disabled={isImproving || intelligence.improvementStatus === 'VERIFIED_IMPROVEMENT'}
                      style={{ background: '#1f6feb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: isImproving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: isImproving ? 0.7 : 1 }}
                    >
                      <Wand2 size={16} /> 
                      {isImproving ? 'Verifying Improvement...' : 
                       intelligence.improvementStatus === 'VERIFIED_IMPROVEMENT' ? 'Improvement Verified!' : 
                       'Improve My Code'}
                    </button>

                    {intelligence.improvementStatus === 'VERIFIED_IMPROVEMENT' && (
                      <button 
                        onClick={() => setShowDiff(!showDiff)}
                        style={{ background: '#30363d', color: '#c9d1d9', border: '1px solid #8b949e', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        {showDiff ? 'Hide Diff' : 'Show Diff'}
                      </button>
                    )}
                  </div>

                  {showExplanation && (
                    <div style={{ background: '#161b22', padding: '20px', borderRadius: '8px', border: '1px solid #30363d' }}>
                      <h3 style={{ marginTop: 0, color: '#58a6ff' }}>Explanation</h3>
                      <p style={{ lineHeight: '1.6' }}>{intelligence.explanation}</p>
                      
                      <h4 style={{ color: '#d29922', marginTop: '20px' }}>Identified Code Smells</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {JSON.parse(intelligence.codeSmells || '[]').map((smell: string, i: number) => (
                          <li key={i}>{smell}</li>
                        ))}
                        {JSON.parse(intelligence.codeSmells || '[]').length === 0 && <li>None detected! ✨</li>}
                      </ul>
                      
                      <h4 style={{ color: '#e34c26', marginTop: '20px' }}>Edge Cases to Consider</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {JSON.parse(intelligence.edgeCases || '[]').map((ec: string, i: number) => (
                          <li key={i}>{ec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {intelligence.improvementStatus === 'FAILED_VERIFICATION' && (
                    <div style={{ padding: '10px', background: '#490202', color: '#ff7b72', borderRadius: '4px' }}>
                      <strong>AI Verification Failed:</strong> The AI attempted to improve your code, but the improved version failed our sandbox verification tests. The original code remains the best verified solution!
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
