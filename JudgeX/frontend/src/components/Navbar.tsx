import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Sun, Moon, Compass, Code2, Trophy, MessageSquare, Sparkles, User, LogOut } from 'lucide-react';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button 
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
      className="theme-toggle-btn" 
      aria-label="Toggle theme"
      title="Toggle Dark/Light Mode"
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
};

export const Navbar = ({ active, transparent = false }: { active: string; transparent?: boolean }) => {
  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();
  
  return (
    <nav className={`lc-navbar ${transparent ? 'transparent' : ''}`}>
      <div className="lc-nav-left">
        <div className="lc-logo">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img src="/logo.png" alt="JudgeX Logo" className="lc-logo-img" />
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', fontFamily: 'var(--font-main)' }}>
              Judge<span style={{ color: '#3b82f6' }}>X</span>
            </span>
          </Link>
        </div>
        <div className="lc-nav-links">
          <Link to="/explore" className={active === 'explore' ? 'active' : ''}>
            <Compass size={15} />
            <span>Explore</span>
          </Link>
          <Link to="/problems" className={active === 'problems' ? 'active' : ''}>
            <Code2 size={15} />
            <span>Problems</span>
          </Link>
          <Link to="/contest" className={active === 'contest' ? 'active' : ''}>
            <Trophy size={15} />
            <span>Contest</span>
          </Link>
          <Link to="/discuss" className={active === 'discuss' ? 'active' : ''}>
            <MessageSquare size={15} />
            <span>Discuss</span>
          </Link>
        </div>
      </div>

      <div className="lc-nav-right">
        <ThemeToggle />
        <button className="lc-btn-premium">
          <Sparkles size={14} />
          <span>Premium</span>
        </button>

        {user ? (
          <div className="user-profile-menu" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '0.35rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
             <User size={15} color="#38bdf8" />
             <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.85rem' }}>{user.username}</span>
             <button 
               onClick={() => dispatch({ type: 'auth/logout' })}
               style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
               title="Logout"
             >
               <LogOut size={14} />
             </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/login" className="lc-link">Sign in</Link>
            <Link to="/register" className="btn-magnetic" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: '10px' }}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
