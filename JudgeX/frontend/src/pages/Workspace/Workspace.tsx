import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import ProblemDescription from './ProblemDescription';
import CodeEditorPanel from './CodeEditorPanel';
import './Workspace.css';

export default function Workspace() {
  const { slug } = useParams();
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/problems/${slug}`);
        setProblem(response.data.problem);
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);

  if (loading) return <div className="workspace-loading">Loading Problem...</div>;
  if (!problem) return <div className="workspace-error">Problem not found.</div>;

  return (
    <div className="workspace-container">
      <nav className="workspace-nav">
        <Link to="/problems" className="back-link">
          <ChevronLeft size={20} /> Back to Problems
        </Link>
        <div className="workspace-title">{problem.title}</div>
        <div className="nav-placeholder"></div>
      </nav>
      
      <div className="workspace-split">
        <div className="workspace-pane left-pane">
          <ProblemDescription problem={problem} />
        </div>
        <div className="workspace-divider"></div>
        <div className="workspace-pane right-pane">
          <CodeEditorPanel problem={problem} />
        </div>
      </div>
    </div>
  );
}
