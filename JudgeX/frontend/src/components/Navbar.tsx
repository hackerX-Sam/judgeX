import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="theme-toggle-btn" aria-label="Toggle theme">
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
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
          <Link to="/">
            <img src="/logo.png" alt="JudgeX Logo" className="lc-logo-img" />
          </Link>
        </div>
        <div className="lc-nav-links">
          <Link to="/explore" className={active === 'explore' ? 'active' : ''}>Explore</Link>
          <Link to="/problems" className={active === 'problems' ? 'active' : ''}>Problems</Link>
          <Link to="/contest" className={active === 'contest' ? 'active' : ''}>Contest</Link>
          <Link to="/discuss" className={active === 'discuss' ? 'active' : ''}>Discuss</Link>
        </div>
      </div>
      <div className="lc-nav-right">
        <ThemeToggle />
        <button className="lc-btn-premium">Premium</button>
        {user ? (
          <div className="user-profile-menu" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user.username}</span>
             <button 
               onClick={() => dispatch({ type: 'auth/logout' })}
               style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
             >
               Logout
             </button>
          </div>
        ) : (
          <>
            <Link to="/register" className="lc-link">Register</Link>
            <span className="lc-divider">or</span>
            <Link to="/login" className="lc-link">Sign in</Link>
          </>
        )}
      </div>
    </nav>
  );
};
