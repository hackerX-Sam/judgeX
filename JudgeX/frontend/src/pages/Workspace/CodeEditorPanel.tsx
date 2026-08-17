import { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Play, Send } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

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
  const [status, setStatus] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const handleSubmit = async () => {
    if (!user) {
      setStatus('Please log in or register to submit your code.');
      return;
    }
    setStatus('Submitting...');
    try {
      const response = await axios.post('http://localhost:3000/api/submissions', {
        problemId: problem.id,
        code,
        language,
        userId: user.id 
      });
      
      const submissionId = response.data.submissionId;
      setStatus('Executing Code (Container starting)...');
      
      // Poll every 1 second until status is no longer PENDING
      const interval = setInterval(async () => {
        try {
          const checkRes = await axios.get(`http://localhost:3000/api/submissions/${submissionId}`);
          const sub = checkRes.data.submission;
          
          if (sub.status !== 'PENDING') {
            clearInterval(interval);
            let resultMessage = `Status: ${sub.status}\nRuntime: ${sub.executionTime || 0}ms`;
            if (sub.errorMessage) {
              resultMessage += `\nError:\n${sub.errorMessage}`;
            }
            setStatus(resultMessage);
          }
        } catch (e) {
          console.error('Status check error:', e);
          clearInterval(interval);
          setStatus('Error checking submission status.');
        }
      }, 1000);

    } catch (error) {
      console.error(error);
      setStatus('Error submitting code.');
    }
  };

  return (
    <div className="code-editor-container">
      <div className="editor-toolbar">
        <select 
          className="language-select"
          value={language} 
          onChange={(e) => {
            const newLang = e.target.value;
            setLanguage(newLang);
            setCode(boilerplates[newLang as keyof typeof boilerplates]);
          }}
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
        <div className="toolbar-actions">
          <button className="btn-run"><Play size={14}/> Run</button>
          <button className="btn-submit" onClick={handleSubmit}><Send size={14}/> Submit</button>
        </div>
      </div>
      
      <div className="editor-wrapper">
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
      </div>

      {status && (
        <div className="console-panel">
          <div className="console-header">Console Output</div>
          <div className="console-content">{status}</div>
        </div>
      )}
    </div>
  );
}
