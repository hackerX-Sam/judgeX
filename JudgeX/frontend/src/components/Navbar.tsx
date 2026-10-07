import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Sun, Moon, Compass, Code2, Trophy, MessageSquare, Settings, User, LogOut, Grid, Sparkles } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../config/supabase';

export const ThemeToggle = () => {
  const { activeTheme, setThemeId } = useTheme();

  return (
    <button 
      onClick={() => setThemeId(activeTheme.isLight ? 'judgex-blue' : 'light')} 
      className="theme-toggle-btn" 
      aria-label="Toggle theme"
      title={activeTheme.isLight ? "Switch to JudgeX Dark Mode" : "Switch to Light Mode"}
    >
      {activeTheme.isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
};

export const BackgroundToggle = () => {
  const { bgMode, setBgMode } = useTheme();
  const isGridScan = bgMode === 'gridscan';

  return (
    <button
      onClick={() => setBgMode(isGridScan ? 'classic' : 'gridscan')}
      className="bg-toggle-btn"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '0.4rem 0.7rem',
        borderRadius: '8px',
        background: isGridScan ? 'rgba(56, 189, 248, 0.15)' : 'rgba(59, 130, 246, 0.15)',
        border: isGridScan ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(59, 130, 246, 0.35)',
        color: isGridScan ? '#38bdf8' : '#60a5fa',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      title={isGridScan ? "Current: GridScan (React Bits). Click to revert to Classic Canvas." : "Current: Classic Canvas. Click to enable GridScan."}
    >
      {isGridScan ? (
        <>
          <Grid size={14} />
          <span>GridScan</span>
        </>
      ) : (
        <>
          <Sparkles size={14} />
          <span>Classic</span>
        </>
      )}
    </button>
  );
};

export const Navbar = ({ active, transparent = false }: { active?: string; transparent?: boolean }) => {
  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();
  
  return (
    <nav className={`lc-navbar ${transparent ? 'transparent' : ''}`}>
      <div className="lc-nav-left">
        <div className="lc-logo">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img src="/logo.png" alt="JudgeX Logo" className="lc-logo-img" />
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--jx-text)', letterSpacing: '-0.5px', fontFamily: 'var(--font-main)' }}>
              Judge<span style={{ color: 'var(--jx-primary)' }}>X</span>
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
          <Link to="/admin" className={active === 'admin' ? 'active' : ''}>
            <Settings size={15} />
            <span>Admin</span>
          </Link>
        </div>
      </div>

      <div className="lc-nav-right">
        <BackgroundToggle />
        <ThemeToggle />
        <Link to="/settings" className={`lc-btn-settings ${active === 'settings' ? 'active' : ''}`}>
          <Settings size={15} />
          <span>Settings</span>
        </Link>

        {user ? (
          <div className="user-profile-menu" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--jx-glass-bg)', padding: '0.35rem 0.8rem', borderRadius: '10px', border: '1px solid var(--jx-border)' }}>
             <User size={15} color="var(--jx-accent)" />
             <span style={{ color: 'var(--jx-text)', fontWeight: 600, fontSize: '0.85rem' }} title={user.email || user.username}>
               {user.email || user.username}
             </span>
             <button 
               onClick={async () => {
                 try {
                   await supabase.auth.signOut();
                 } catch (e) {
                   console.warn('Supabase signout exception:', e);
                 }
                 dispatch(logout());
               }}
               style={{ background: 'transparent', border: 'none', color: 'var(--jx-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
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
