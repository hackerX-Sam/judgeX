import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navbar } from '../../components/Navbar';
import { useTheme } from '../../theme/ThemeContext';
import { THEMES } from '../../theme/themeRegistry';
import type { ThemeId } from '../../theme/themeRegistry';
import { 
  User, Palette, Code2, Bell, Keyboard, Shield, Sliders, 
  Sparkles, Check, ChevronRight, Download, Monitor, Volume2, Globe, Lock
} from 'lucide-react';
import './SettingsPage.css';

type CategoryTab = 'account' | 'appearance' | 'editor' | 'notifications' | 'shortcuts' | 'privacy' | 'preferences';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<CategoryTab>('appearance');
  const { activeThemeId, setThemeId, editorSettings, updateEditorSettings } = useTheme();
  const user = useSelector((state: any) => state.auth.user);

  // Local notification & privacy preference state (saved to localStorage)
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('judgex_notifications');
    return saved ? JSON.parse(saved) : { contestAlerts: true, soundEffects: true, aiToasts: true, emailSummaries: false };
  });

  const [privacy, setPrivacy] = useState(() => {
    const saved = localStorage.getItem('judgex_privacy');
    return saved ? JSON.parse(saved) : { publicProfile: true, leaderboardCode: true, allowFollowers: true };
  });

  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('judgex_preferences');
    return saved ? JSON.parse(saved) : { defaultLang: 'javascript', autoSave: true, reducedMotion: false };
  });

  const updateNotifications = (key: string, val: boolean) => {
    const updated = { ...notifications, [key]: val };
    setNotifications(updated);
    localStorage.setItem('judgex_notifications', JSON.stringify(updated));
  };

  const updatePrivacy = (key: string, val: boolean) => {
    const updated = { ...privacy, [key]: val };
    setPrivacy(updated);
    localStorage.setItem('judgex_privacy', JSON.stringify(updated));
  };

  const updatePreferences = (key: string, val: any) => {
    const updated = { ...preferences, [key]: val };
    setPreferences(updated);
    localStorage.setItem('judgex_preferences', JSON.stringify(updated));
  };

  const handleExportData = () => {
    const data = {
      user: user || { username: 'Guest' },
      theme: activeThemeId,
      editorSettings,
      notifications,
      privacy,
      preferences,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `judgex_settings_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="settings-page-wrapper">
      <Navbar active="settings" />

      <main className="settings-container">
        {/* Header */}
        <div className="settings-header-banner">
          <div>
            <h1 className="settings-title">Settings Center</h1>
            <p className="settings-subtitle">Customize your JudgeX coding environment, appearance, and workspace preferences.</p>
          </div>
        </div>

        {/* Mobile Nav Switcher */}
        <div className="settings-mobile-nav">
          {[
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'editor', label: 'Editor', icon: Code2 },
            { id: 'account', label: 'Account', icon: User },
            { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy', icon: Shield },
            { id: 'preferences', label: 'Preferences', icon: Sliders },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as CategoryTab)}
                className={`mobile-tab-btn ${activeTab === item.id ? 'active' : ''}`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop 2-Column Layout */}
        <div className="settings-layout-grid">
          {/* Left Navigation Sidebar */}
          <aside className="settings-sidebar">
            <nav className="settings-nav-list">
              <button 
                onClick={() => setActiveTab('account')} 
                className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
              >
                <User size={18} />
                <span>Account & Plan</span>
              </button>

              <button 
                onClick={() => setActiveTab('appearance')} 
                className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
              >
                <Palette size={18} />
                <span>Appearance & Themes</span>
                <span className="badge-pill">8 Themes</span>
              </button>

              <button 
                onClick={() => setActiveTab('editor')} 
                className={`settings-nav-item ${activeTab === 'editor' ? 'active' : ''}`}
              >
                <Code2 size={18} />
                <span>Monaco Editor</span>
              </button>

              <button 
                onClick={() => setActiveTab('notifications')} 
                className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              >
                <Bell size={18} />
                <span>Notifications</span>
              </button>

              <button 
                onClick={() => setActiveTab('shortcuts')} 
                className={`settings-nav-item ${activeTab === 'shortcuts' ? 'active' : ''}`}
              >
                <Keyboard size={18} />
                <span>Shortcuts</span>
              </button>

              <button 
                onClick={() => setActiveTab('privacy')} 
                className={`settings-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
              >
                <Shield size={18} />
                <span>Privacy & Data</span>
              </button>

              <button 
                onClick={() => setActiveTab('preferences')} 
                className={`settings-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
              >
                <Sliders size={18} />
                <span>General Preferences</span>
              </button>
            </nav>
          </aside>

          {/* Right Selected Content Area */}
          <section className="settings-content-panel glass-panel">

            {/* TAB 1: APPEARANCE & THEMES */}
            {activeTab === 'appearance' && (
              <div className="tab-fade-in">
                <div className="section-head">
                  <h2 className="section-title">
                    <Palette size={20} color="var(--jx-primary)" />
                    <span>Appearance & Themes</span>
                  </h2>
                  <p className="section-desc">Customize how JudgeX looks and feels. Switch between curated themes for your workspace and editor.</p>
                </div>

                <div className="theme-gallery-grid">
                  {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                    const theme = THEMES[tId];
                    const isSelected = activeThemeId === tId;

                    return (
                      <div 
                        key={tId}
                        onClick={() => setThemeId(tId)}
                        className={`theme-card ${isSelected ? 'selected' : ''}`}
                        style={{ '--card-accent': theme.previewColors.primary } as React.CSSProperties}
                      >
                        {/* Theme Card Top Meta */}
                        <div className="theme-card-header">
                          <div>
                            <div className="theme-card-title">{theme.name}</div>
                            {theme.badge && <span className="theme-badge-tag">{theme.badge}</span>}
                          </div>
                          {isSelected && (
                            <div className="selected-indicator">
                              <Check size={14} /> Active
                            </div>
                          )}
                        </div>

                        <p className="theme-card-desc">{theme.description}</p>

                        {/* Mini Code Editor Preview */}
                        <div 
                          className="theme-code-preview" 
                          style={{ 
                            background: theme.previewColors.bg,
                            borderColor: isSelected ? theme.previewColors.primary : 'rgba(255,255,255,0.1)'
                          }}
                        >
                          <div className="preview-top-dots">
                            <span style={{ background: '#ef4444' }} />
                            <span style={{ background: '#f59e0b' }} />
                            <span style={{ background: '#10b981' }} />
                            <span className="preview-filename">solution.cpp</span>
                          </div>

                          <pre className="preview-snippet" style={{ color: theme.previewColors.text }}>
                            <span style={{ color: theme.previewColors.primary, fontWeight: 700 }}>int</span> main() {'{\n'}
                            {'  '}
                            <span style={{ color: theme.previewColors.accent }}>printf</span>(
                            <span style={{ color: theme.isLight ? '#16a34a' : '#34d399' }}>"JudgeX Rules!"</span>
                            );{'\n'}
                            {'  '}<span style={{ color: theme.previewColors.primary }}>return</span> <span style={{ color: '#f59e0b' }}>0</span>;{'\n'}
                            {'}'}
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: MONACO EDITOR SETTINGS */}
            {activeTab === 'editor' && (
              <div className="tab-fade-in">
                <div className="section-head">
                  <h2 className="section-title">
                    <Code2 size={20} color="var(--jx-primary)" />
                    <span>Monaco Editor Preferences</span>
                  </h2>
                  <p className="section-desc">Tune your coding environment. Adjust font size, word wrapping, indentation, and editor features.</p>
                </div>

                <div className="editor-controls-grid">
                  {/* Font Size */}
                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Font Size</label>
                      <span className="setting-hint">Controls editor code font size in pixels.</span>
                    </div>
                    <select 
                      value={editorSettings.fontSize} 
                      onChange={(e) => updateEditorSettings({ fontSize: Number(e.target.value) })}
                      className="setting-select"
                    >
                      <option value={12}>12 px (Small)</option>
                      <option value={14}>14 px (Default)</option>
                      <option value={16}>16 px (Medium)</option>
                      <option value={18}>18 px (Large)</option>
                      <option value={20}>20 px (Extra Large)</option>
                    </select>
                  </div>

                  {/* Font Family */}
                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Font Family</label>
                      <span className="setting-hint">Select typeface for the Monaco Editor.</span>
                    </div>
                    <select 
                      value={editorSettings.fontFamily} 
                      onChange={(e) => updateEditorSettings({ fontFamily: e.target.value })}
                      className="setting-select"
                    >
                      <option value="'Consolas', 'Courier New', monospace">Consolas / Monospace</option>
                      <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
                      <option value="'Fira Code', monospace">Fira Code (Ligatures)</option>
                      <option value="'Cascadia Code', monospace">Cascadia Code</option>
                    </select>
                  </div>

                  {/* Word Wrap */}
                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Word Wrap</label>
                      <span className="setting-hint">Wrap long lines automatically in the editor pane.</span>
                    </div>
                    <button 
                      onClick={() => updateEditorSettings({ wordWrap: editorSettings.wordWrap === 'on' ? 'off' : 'on' })}
                      className={`toggle-switch ${editorSettings.wordWrap === 'on' ? 'active' : ''}`}
                    >
                      <span className="switch-handle" />
                    </button>
                  </div>

                  {/* Minimap */}
                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Editor Minimap</label>
                      <span className="setting-hint">Display code outline minimap on the right edge.</span>
                    </div>
                    <button 
                      onClick={() => updateEditorSettings({ minimap: !editorSettings.minimap })}
                      className={`toggle-switch ${editorSettings.minimap ? 'active' : ''}`}
                    >
                      <span className="switch-handle" />
                    </button>
                  </div>

                  {/* Tab Size */}
                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Tab Size</label>
                      <span className="setting-hint">Number of spaces per indentation level.</span>
                    </div>
                    <select 
                      value={editorSettings.tabSize} 
                      onChange={(e) => updateEditorSettings({ tabSize: Number(e.target.value) as 2 | 4 })}
                      className="setting-select"
                    >
                      <option value={2}>2 Spaces</option>
                      <option value={4}>4 Spaces</option>
                    </select>
                  </div>

                  {/* Line Numbers */}
                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Line Numbers</label>
                      <span className="setting-hint">Show or hide gutter line numbers.</span>
                    </div>
                    <button 
                      onClick={() => updateEditorSettings({ lineNumbers: editorSettings.lineNumbers === 'on' ? 'off' : 'on' })}
                      className={`toggle-switch ${editorSettings.lineNumbers === 'on' ? 'active' : ''}`}
                    >
                      <span className="switch-handle" />
                    </button>
                  </div>

                  {/* Cursor Style */}
                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Cursor Style</label>
                      <span className="setting-hint">Shape of the text insertion cursor.</span>
                    </div>
                    <select 
                      value={editorSettings.cursorStyle} 
                      onChange={(e) => updateEditorSettings({ cursorStyle: e.target.value as any })}
                      className="setting-select"
                    >
                      <option value="line">Line (|)</option>
                      <option value="block">Block (█)</option>
                      <option value="underline">Underline (_)</option>
                    </select>
                  </div>
                </div>

                {/* Live Editor Preview Box */}
                <div className="live-editor-preview-card">
                  <div className="preview-card-header">
                    <Monitor size={14} color="var(--jx-accent)" />
                    <span>Live Editor Style Preview</span>
                  </div>
                  <pre 
                    className="preview-code-render"
                    style={{
                      fontSize: `${editorSettings.fontSize}px`,
                      fontFamily: editorSettings.fontFamily,
                      whiteSpace: editorSettings.wordWrap === 'on' ? 'pre-wrap' : 'pre',
                    }}
                  >
                    {editorSettings.lineNumbers === 'on' && <span className="preview-gutter">1 </span>}
                    <span style={{ color: 'var(--jx-primary)', fontWeight: 600 }}>function</span> solve(nums, target) {'{\n'}
                    {editorSettings.lineNumbers === 'on' && <span className="preview-gutter">2 </span>}
                    {'  '.repeat(editorSettings.tabSize / 2)}<span style={{ color: 'var(--jx-accent)' }}>let</span> map = <span style={{ color: 'var(--jx-primary)' }}>new</span> Map();{'\n'}
                    {editorSettings.lineNumbers === 'on' && <span className="preview-gutter">3 </span>}
                    {'  '.repeat(editorSettings.tabSize / 2)}<span style={{ color: 'var(--jx-text-secondary)' }}>// Solved with O(N) linear complexity</span>{'\n'}
                    {editorSettings.lineNumbers === 'on' && <span className="preview-gutter">4 </span>}
                    {'}'}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 3: ACCOUNT & PREMIUM */}
            {activeTab === 'account' && (
              <div className="tab-fade-in">
                <div className="section-head">
                  <h2 className="section-title">
                    <User size={20} color="var(--jx-primary)" />
                    <span>Account Profile & Membership</span>
                  </h2>
                  <p className="section-desc">Manage your account profile, linked credentials, and subscription status.</p>
                </div>

                {/* Account Details Card */}
                <div className="account-profile-card">
                  <div className="profile-top-row">
                    <div className="profile-avatar">
                      {user?.username ? user.username[0].toUpperCase() : 'J'}
                    </div>
                    <div>
                      <h3 className="profile-name">{user?.fullName || user?.username || 'Guest Developer'}</h3>
                      <p className="profile-email">{user?.email || 'guest@judgex.local'}</p>
                    </div>
                  </div>

                  <div className="profile-meta-grid">
                    <div className="meta-box">
                      <span className="meta-label">Username</span>
                      <span className="meta-val">{user?.username || 'guest'}</span>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Auth Provider</span>
                      <span className="meta-val">{user?.provider || 'local'}</span>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Institution</span>
                      <span className="meta-val">{user?.institution || 'Unspecified'}</span>
                    </div>
                  </div>
                </div>

                {/* Preserved JudgeX Premium Feature Section */}
                <div className="premium-status-card">
                  <div className="premium-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={20} color="#fbbf24" />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>JudgeX Pro Membership</h3>
                    </div>
                    <span className="pro-badge">ACTIVE MEMBER</span>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    You have unlocked unlimited GPT-4o AI code intelligence, priority Docker execution queues, and premium company problem sets.
                  </p>
                  <div className="premium-perks-list">
                    <div><Check size={14} color="#10b981" /> Unlimited AI Code Optimization & Complexity Analysis</div>
                    <div><Check size={14} color="#10b981" /> High-Priority Docker Container Sandboxes</div>
                    <div><Check size={14} color="#10b981" /> Premium Company Problem Sets (Google, Meta, Amazon)</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="tab-fade-in">
                <div className="section-head">
                  <h2 className="section-title">
                    <Bell size={20} color="var(--jx-primary)" />
                    <span>Notification Preferences</span>
                  </h2>
                  <p className="section-desc">Manage contest reminders, execution alert sounds, and submission status toasts.</p>
                </div>

                <div className="editor-controls-grid">
                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Contest Starting Alerts</label>
                      <span className="setting-hint">Receive browser alerts when registered contests are about to begin.</span>
                    </div>
                    <button 
                      onClick={() => updateNotifications('contestAlerts', !notifications.contestAlerts)}
                      className={`toggle-switch ${notifications.contestAlerts ? 'active' : ''}`}
                    >
                      <span className="switch-handle" />
                    </button>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Execution Sound Effects</label>
                      <span className="setting-hint">Play subtle audio cue when submission verdict completes.</span>
                    </div>
                    <button 
                      onClick={() => updateNotifications('soundEffects', !notifications.soundEffects)}
                      className={`toggle-switch ${notifications.soundEffects ? 'active' : ''}`}
                    >
                      <span className="switch-handle" />
                    </button>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">AI Intelligence Toasts</label>
                      <span className="setting-hint">Show toast notification when GPT-4o analysis finishes.</span>
                    </div>
                    <button 
                      onClick={() => updateNotifications('aiToasts', !notifications.aiToasts)}
                      className={`toggle-switch ${notifications.aiToasts ? 'active' : ''}`}
                    >
                      <span className="switch-handle" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: KEYBOARD SHORTCUTS */}
            {activeTab === 'shortcuts' && (
              <div className="tab-fade-in">
                <div className="section-head">
                  <h2 className="section-title">
                    <Keyboard size={20} color="var(--jx-primary)" />
                    <span>Keyboard & Hotkey Shortcuts</span>
                  </h2>
                  <p className="section-desc">Speed up your coding workflow using JudgeX hotkeys in the IDE and Playground.</p>
                </div>

                <div className="shortcuts-list">
                  {[
                    { keys: ['Ctrl', 'Enter'], desc: 'Run code against sample test case' },
                    { keys: ['Ctrl', 'Shift', 'Enter'], desc: 'Submit code to JudgeX Execution Queue' },
                    { keys: ['Ctrl', 'S'], desc: 'Save snippet in Playground' },
                    { keys: ['Esc'], desc: 'Exit Fullscreen Focus Mode' },
                  ].map((sc, idx) => (
                    <div key={idx} className="shortcut-row">
                      <span className="shortcut-desc">{sc.desc}</span>
                      <div className="keys-group">
                        {sc.keys.map((k, i) => (
                          <React.Fragment key={i}>
                            <kbd className="key-cap">{k}</kbd>
                            {i < sc.keys.length - 1 && <span className="key-plus">+</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: PRIVACY & DATA */}
            {activeTab === 'privacy' && (
              <div className="tab-fade-in">
                <div className="section-head">
                  <h2 className="section-title">
                    <Shield size={20} color="var(--jx-primary)" />
                    <span>Privacy & Account Data</span>
                  </h2>
                  <p className="section-desc">Control profile visibility, submission privacy, and export your personal data.</p>
                </div>

                <div className="editor-controls-grid">
                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Public Profile</label>
                      <span className="setting-hint">Allow other developers to view your solved problems and heat map.</span>
                    </div>
                    <button 
                      onClick={() => updatePrivacy('publicProfile', !privacy.publicProfile)}
                      className={`toggle-switch ${privacy.publicProfile ? 'active' : ''}`}
                    >
                      <span className="switch-handle" />
                    </button>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Leaderboard Solutions</label>
                      <span className="setting-hint">Show your accepted solution code on global rankings.</span>
                    </div>
                    <button 
                      onClick={() => updatePrivacy('leaderboardCode', !privacy.leaderboardCode)}
                      className={`toggle-switch ${privacy.leaderboardCode ? 'active' : ''}`}
                    >
                      <span className="switch-handle" />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--jx-border)', paddingTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Export Personal Data</h3>
                  <p style={{ color: 'var(--jx-text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Download a complete JSON export of your preferences, settings, and profile details.
                  </p>
                  <button onClick={handleExportData} className="btn-magnetic" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                    <Download size={14} /> Export Settings Data (.json)
                  </button>
                </div>
              </div>
            )}

            {/* TAB 7: PREFERENCES */}
            {activeTab === 'preferences' && (
              <div className="tab-fade-in">
                <div className="section-head">
                  <h2 className="section-title">
                    <Sliders size={20} color="var(--jx-primary)" />
                    <span>General Preferences</span>
                  </h2>
                  <p className="section-desc">Set default programming languages and system interaction behaviors.</p>
                </div>

                <div className="editor-controls-grid">
                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Default Programming Language</label>
                      <span className="setting-hint">Default language selected when opening a new problem workspace.</span>
                    </div>
                    <select 
                      value={preferences.defaultLang} 
                      onChange={(e) => updatePreferences('defaultLang', e.target.value)}
                      className="setting-select"
                    >
                      <option value="javascript">JavaScript (Node.js)</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python 3</option>
                      <option value="cpp">C++ (g++)</option>
                      <option value="c">C (gcc)</option>
                      <option value="java">Java 11</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                    </select>
                  </div>

                  <div className="setting-control-row">
                    <div className="setting-info">
                      <label className="setting-label">Auto-Save Code Snippets</label>
                      <span className="setting-hint">Automatically persist draft code in browser cache.</span>
                    </div>
                    <button 
                      onClick={() => updatePreferences('autoSave', !preferences.autoSave)}
                      className={`toggle-switch ${preferences.autoSave ? 'active' : ''}`}
                    >
                      <span className="switch-handle" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  );
}
