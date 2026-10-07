'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { gsap } from 'gsap';
import { 
  ArrowUpRight, User, LogOut, Compass, Code2, 
  Trophy, MessageSquare, Settings, Sparkles 
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { supabase } from '../../config/supabase';
import { ThemeToggle, BackgroundToggle } from '../Navbar';
import './CardNav.css';

export interface CardNavLink {
  label: string;
  href?: string;
  to?: string;
  ariaLabel?: string;
  onClick?: () => void;
}

export interface CardNavItem {
  label: string;
  bgColor?: string;
  textColor?: string;
  links: CardNavLink[];
}

export interface CardNavProps {
  logo?: string;
  logoAlt?: string;
  items?: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  active?: string;
}

export const CardNav: React.FC<CardNavProps> = ({
  logo = '/logo.png',
  logoAlt = 'JudgeX Logo',
  items,
  className = '',
  ease = 'power3.out',
  baseColor = 'rgba(15, 23, 42, 0.85)',
  menuColor,
  active = 'home'
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const defaultItems: CardNavItem[] = [
    {
      label: 'Explore & Platform',
      bgColor: '#1e293b',
      textColor: '#38bdf8',
      links: [
        { label: 'Explore Hub', to: '/explore', ariaLabel: 'Go to Explore' },
        { label: 'Problem Library', to: '/problems', ariaLabel: 'Browse Problems' },
        { label: 'Company Challenges', to: '/explore', ariaLabel: 'Company Problems' }
      ]
    },
    {
      label: 'Practice & Compete',
      bgColor: '#0f172a',
      textColor: '#34d399',
      links: [
        { label: 'Coding Playground', to: '/playground', ariaLabel: 'Try Playground' },
        { label: 'Weekly Contests', to: '/contest', ariaLabel: 'Join Contests' },
        { label: 'Live Rankings', to: '/contest', ariaLabel: 'Leaderboards' }
      ]
    },
    {
      label: 'Community & Portal',
      bgColor: '#1E2640',
      textColor: '#fbbf24',
      links: [
        { label: 'Discuss Forums', to: '/discuss', ariaLabel: 'Discussion' },
        { label: 'IDE & Theme Settings', to: '/settings', ariaLabel: 'Settings' },
        { label: 'Admin Dashboard', to: '/admin', ariaLabel: 'Admin Page' }
      ]
    }
  ];

  const navItems = items && items.length > 0 ? items : defaultItems;

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement | null;
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';

        contentEl.offsetHeight; // trigger reflow

        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return topBar + contentHeight + padding;
      }
    }
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current.filter(Boolean), { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease
    });

    tl.to(cardsRef.current.filter(Boolean), { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1');

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, navItems]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const closeMenu = () => {
    const tl = tlRef.current;
    if (isExpanded && tl) {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          {/* Hamburger Menu Toggle */}
          <div
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
              }
            }}
            role="button"
            aria-label={isExpanded ? 'Close navigation cards' : 'Open navigation cards'}
            aria-expanded={isExpanded}
            tabIndex={0}
            style={{ color: menuColor || '#ffffff' }}
            title={isExpanded ? "Collapse Menu Cards" : "Expand Menu Cards"}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          {/* Logo Center Branding */}
          <div className="logo-container">
            <Link to="/" onClick={closeMenu}>
              <img src={logo} alt={logoAlt} className="logo" />
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--jx-text)', letterSpacing: '-0.5px', fontFamily: 'var(--font-main)' }}>
                Judge<span style={{ color: 'var(--jx-primary)' }}>X</span>
              </span>
            </Link>
          </div>

          {/* Right Action Items */}
          <div className="card-nav-actions">
            <BackgroundToggle />
            <ThemeToggle />

            {user ? (
              <div 
                className="user-profile-menu" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: 'rgba(255,255,255,0.06)', 
                  padding: '0.35rem 0.75rem', 
                  borderRadius: '10px', 
                  border: '1px solid rgba(255,255,255,0.1)' 
                }}
              >
                <User size={15} color="#38bdf8" />
                <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.85rem' }} title={user.email || user.username}>
                  {user.username || user.email?.split('@')[0]}
                </span>
                <button 
                  onClick={async () => {
                    try {
                      await supabase.auth.signOut();
                    } catch (e) {
                      console.warn('Supabase signout exception:', e);
                    }
                    dispatch(logout());
                    closeMenu();
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link to="/register" className="card-nav-cta-button" onClick={closeMenu}>
                <Sparkles size={14} />
                <span>Get Started</span>
              </Link>
            )}
          </div>
        </div>

        {/* Expandable Navigation Cards Content */}
        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(navItems || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label" style={{ color: item.textColor }}>
                {idx === 0 && <Compass size={18} />}
                {idx === 1 && <Code2 size={18} />}
                {idx === 2 && <MessageSquare size={18} />}
                <span>{item.label}</span>
              </div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => {
                  const clickHandler = () => {
                    closeMenu();
                    if (lnk.onClick) lnk.onClick();
                    if (lnk.to) navigate(lnk.to);
                  };

                  return lnk.to ? (
                    <Link
                      key={`${lnk.label}-${i}`}
                      className="nav-card-link"
                      to={lnk.to}
                      aria-label={lnk.ariaLabel}
                      onClick={closeMenu}
                    >
                      <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                      <span>{lnk.label}</span>
                    </Link>
                  ) : (
                    <a
                      key={`${lnk.label}-${i}`}
                      className="nav-card-link"
                      href={lnk.href || '#'}
                      aria-label={lnk.ariaLabel}
                      onClick={clickHandler}
                    >
                      <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                      <span>{lnk.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
