import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { Play, Save, Settings, Share2, BookOpen, ChevronDown, PenLine, Code2 } from 'lucide-react';
import './Playground.css';

const defaultSnippets: Record<string, string> = {
  cpp: '#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n    cout << "Hello World!" << endl;\\n    return 0;\\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello World!\\n");\n    return 0;\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World!")\n}',
  rust: 'fn main() {\n    println!("Hello World!");\n}',
  python: 'print("Hello World!")',
  javascript: 'console.log("Hello World!");'
};

export default function Playground() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(defaultSnippets['cpp']);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Compiling and running...');
    
    try {
      const response = await axios.post('http://localhost:3000/api/submissions/execute/playground', {
        code,
        language
      });
      
      const { output: resultOutput, error, runtime } = response.data;
      if (error) {
        setOutput(`[Error]\\n${error}`);
      } else {
        setOutput(`${resultOutput}\\n\\n=== Execution Successful ===\\nRuntime: ${runtime}ms`);
      }
    } catch (err: any) {
      setOutput(`[System Error] Failed to execute code.\\n${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="playground-container">
      <Navbar active="playground" />
      
      {/* Toolbar */}
      <div className="pg-toolbar">
        <div className="pg-toolbar-left">
          <button className="pg-btn-run" onClick={handleRun} disabled={isRunning}>
            <Play size={14} fill="white" /> {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <div className="pg-title">
            Untitled <PenLine size={12} className="pg-icon-muted" />
          </div>
        </div>
        
        <div className="pg-toolbar-right">
          <button className="pg-btn-secondary">
            <Save size={14} /> Save
          </button>
          
          <div className="pg-select-wrapper">
            <select 
              value={language} 
              onChange={(e) => {
                const newLang = e.target.value;
                setLanguage(newLang);
                setCode(defaultSnippets[newLang]);
              }}
              className="pg-select"
            >
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
            <ChevronDown size={14} className="pg-select-icon" />
          </div>
          
          <button className="pg-btn-icon">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Main Content: Split Pane */}
      <div className="pg-main">
        {/* Editor Pane */}
        <div className="pg-editor-pane">
          <Editor
            height="100%"
            language={language}
            theme="light"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              lineNumbersMinChars: 3,
            }}
          />
        </div>
        
        {/* Output Pane */}
        <div className="pg-output-pane">
          <div className="pg-output-header">Output:</div>
          <div className="pg-output-content">
            <pre>{output}</pre>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="pg-bottom-bar">
        <div className="pg-bottom-left">
          <button className="pg-btn-footer"><Share2 size={14} /> Share</button>
          <button className="pg-btn-footer"><BookOpen size={14} /> Live</button>
        </div>
        <div className="pg-bottom-right">
          <button className="pg-btn-primary"><Code2 size={14} /> Add Snippet</button>
        </div>
      </div>
    </div>
  );
}
