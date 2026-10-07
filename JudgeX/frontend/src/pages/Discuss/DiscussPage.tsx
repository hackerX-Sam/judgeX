import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Navbar } from '../../components/Navbar';
import ComputationalCanvas from '../../components/ComputationalCanvas';
import TechText from '../../components/TechText';
import { 
  MessageSquare, Search, Plus, Flame, ThumbsUp, Eye, 
  MessageCircle, Bookmark, Sparkles, X, 
  Award, Clock, Send, ChevronRight,
  TrendingUp, Star, ShieldCheck, Code, Layers,
  Users, CheckSquare, Zap, Share2, Tag
} from 'lucide-react';
import './DiscussPage.css';

interface Comment {
  id: string;
  author: string;
  avatarColor: string;
  badge?: string;
  timeAgo: string;
  content: string;
  upvotes: number;
}

interface Post {
  id: string;
  title: string;
  category: 'interview' | 'solutions' | 'system-design' | 'career' | 'announcements';
  author: string;
  avatarColor: string;
  authorBadge?: string;
  timeAgo: string;
  content: string;
  codeSnippet?: string;
  tags: string[];
  upvotes: number;
  commentsCount: number;
  views: number;
  isUpvoted?: boolean;
  isBookmarked?: boolean;
  commentsList?: Comment[];
}

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    title: 'Google L5 System Design: How JudgeX Executes Code Safely in Docker',
    category: 'system-design',
    author: 'Samiran T.',
    avatarColor: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    authorBadge: 'JudgeX Architect',
    timeAgo: '2 hours ago',
    content: `When building a scalable online judge, the main bottleneck is securely executing untrusted user code without compromising system security or running out of memory.

Key architectural pillars:
1. Docker container isolation per execution batch.
2. Cgroups memory cap (256MB) & CPU period limits.
3. Network isolation (NetworkMode: none) to prevent unauthorized network calls.
4. Linux cap-drop ALL & no-new-privileges.

Below is a snippet of our sandboxing engine runner:`,
    codeSnippet: `const container = await docker.createContainer({
  Image: 'python:3.9-alpine',
  Cmd: ['sh', '-c', 'python /main.py < /input.txt'],
  HostConfig: {
    Memory: 256 * 1024 * 1024,
    CpuQuota: 100000,
    CapDrop: ['ALL'],
    NetworkMode: 'none'
  }
});`,
    tags: ['System Design', 'Docker', 'Security', 'Node.js'],
    upvotes: 342,
    commentsCount: 48,
    views: 1890,
    commentsList: [
      {
        id: 'c1',
        author: 'Alex Chen',
        avatarColor: '#10b981',
        badge: 'Meta Senior Eng',
        timeAgo: '1 hour ago',
        content: 'Super clean design! Dropping capabilities and isolating network by default is standard practice. Have you considered firejail for ultra low latency warm starts?',
        upvotes: 18
      },
      {
        id: 'c2',
        author: 'Priya Sharma',
        avatarColor: '#ec4899',
        badge: 'Knight 2150',
        timeAgo: '30 mins ago',
        content: 'Thanks for sharing this architecture breakdown! Very insightful for system design interview prep.',
        upvotes: 7
      }
    ]
  },
  {
    id: 'p2',
    title: 'Meta Staff Frontend Interview Experience (2026) - Passed & Offered $340k!',
    category: 'interview',
    author: 'Elena Rostova',
    avatarColor: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
    authorBadge: 'Guardian 2450',
    timeAgo: '5 hours ago',
    content: `Just wrapped up my loop at Meta for E5 Senior Frontend Engineer. Passed all rounds and got the official offer today!

Round breakdown:
1. Coding Round 1: Two Medium DP & Sliding Window questions.
2. Coding Round 2: Custom Data Structure Design + DOM Tree Traversal.
3. System Design: Design real-time collaborative code editor with WebSocket synchronization.
4. Behavioral: Standard Meta values around ownership and execution speed.

Tips: Master Array visualizations and practice writing bug-free code under time constraints.`,
    tags: ['Meta', 'Interview Experience', 'Frontend', 'Offer'],
    upvotes: 512,
    commentsCount: 94,
    views: 4120,
    commentsList: [
      {
        id: 'c3',
        author: 'Marcus Vance',
        avatarColor: '#f59e0b',
        timeAgo: '3 hours ago',
        content: 'Huge congratulations! How long did you spend preparing on JudgeX?',
        upvotes: 12
      }
    ]
  },
  {
    id: 'p3',
    title: 'Ultimate Dynamic Programming Blueprint: From 0 to DP Master in 14 Days',
    category: 'solutions',
    author: 'David K.',
    avatarColor: 'linear-gradient(135deg, #10b981, #3b82f6)',
    authorBadge: 'Grandmaster',
    timeAgo: '1 day ago',
    content: `Many candidates struggle with Dynamic Programming because they try to memorize solutions rather than identifying state transitions.

Framework for solving ANY DP problem:
1. Define state variables (e.g. dp[i][j]).
2. Identify recurrence relations.
3. Set base cases.
4. Bottom-up iteration space optimization.

Below is the 0/1 Knapsack template:`,
    codeSnippet: `def knapsack(weights, values, W):
    n = len(weights)
    dp = [0] * (W + 1)
    for i in range(n):
        for w in range(W, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    return dp[W]`,
    tags: ['Dynamic Programming', 'Tutorial', 'Algorithms', 'Python'],
    upvotes: 689,
    commentsCount: 112,
    views: 6450,
    commentsList: []
  },
  {
    id: 'p4',
    title: 'JudgeX Release v2.4: Realtime AI Code Intelligence & Multi-Language Support',
    category: 'announcements',
    author: 'JudgeX Team',
    avatarColor: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    authorBadge: 'Official',
    timeAgo: '2 days ago',
    content: `We are thrilled to announce the latest JudgeX update!

New Features:
✨ Automated Big-O Time & Space Complexity analysis powered by GPT-4o.
✨ TypeScript, Go & Rust sandboxed compilers.
✨ Interactive Data Structure Visualizers (Arrays, Linked Lists, DP Matrices).

Try them out in the Problem Workspace today!`,
    tags: ['Announcement', 'JudgeX Update', 'AI', 'Release'],
    upvotes: 890,
    commentsCount: 65,
    views: 8200,
    commentsList: []
  },
  {
    id: 'p5',
    title: 'How to Crack Top 1% Competitive Programming Contests: Rating 2000+ Guide',
    category: 'career',
    author: 'Vikram Singh',
    avatarColor: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    authorBadge: 'Candidate Master',
    timeAgo: '3 days ago',
    content: `In competitive programming, speed and accuracy on Div2 A, B, and C determine your trajectory.

Key Strategies:
• Practice problem solving without looking at editorial for at least 45 minutes.
• Learn standard Graph Algorithms (Tarjan's SCC, Segment Trees, Fenwick Trees).
• Debug using custom stress tests before submitting to avoid penalty points.`,
    tags: ['Competitive Programming', 'Contest Guide', 'C++', 'Rating'],
    upvotes: 420,
    commentsCount: 37,
    views: 3100,
    commentsList: []
  }
];

export default function DiscussPage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'hot' | 'top' | 'newest'>('hot');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Modals state
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'interview' | 'solutions' | 'system-design' | 'career' | 'announcements'>('interview');
  const [newTags, setNewTags] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCodeSnippet, setNewCodeSnippet] = useState('');

  // Comment Form State for selected post
  const [newCommentText, setNewCommentText] = useState('');

  const user = useSelector((state: any) => state.auth.user);

  // Show quick toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter & Sort Logic
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesCat = activeCategory === 'all' || post.category === activeCategory;
      const matchesTag = !selectedTag || post.tags.includes(selectedTag);
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCat && matchesTag && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'top') return b.upvotes - a.upvotes;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      return (b.upvotes + b.views * 0.1) - (a.upvotes + a.views * 0.1);
    });
  }, [posts, activeCategory, selectedTag, sortBy, searchQuery]);

  // Upvote Handler
  const handleUpvote = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isUpvoted = !p.isUpvoted;
        return {
          ...p,
          isUpvoted,
          upvotes: isUpvoted ? p.upvotes + 1 : p.upvotes - 1
        };
      }
      return p;
    }));

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prev => prev ? {
        ...prev,
        isUpvoted: !prev.isUpvoted,
        upvotes: !prev.isUpvoted ? prev.upvotes + 1 : prev.upvotes - 1
      } : null);
    }
  };

  // Bookmark Handler
  const handleBookmark = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isBookmarked = !p.isBookmarked;
        if (isBookmarked) triggerToast('Saved to your bookmarked topics!');
        return { ...p, isBookmarked };
      }
      return p;
    }));

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    }
  };

  // Submit New Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const parsedTags = newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : ['Discussion'];

    const newPostObj: Post = {
      id: 'p_' + Date.now(),
      title: newTitle,
      category: newCategory,
      author: user?.username || user?.email?.split('@')[0] || 'Developer',
      avatarColor: 'linear-gradient(135deg, #2563eb, #06b6d4)',
      authorBadge: 'Contributor',
      timeAgo: 'Just now',
      content: newContent,
      codeSnippet: newCodeSnippet.trim() || undefined,
      tags: parsedTags,
      upvotes: 1,
      isUpvoted: true,
      commentsCount: 0,
      views: 1,
      commentsList: []
    };

    setPosts([newPostObj, ...posts]);
    setIsNewPostModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewCodeSnippet('');
    setNewTags('');
    triggerToast('Discussion topic published successfully!');
  };

  // Submit New Comment inside Modal
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedPost) return;

    const commentObj: Comment = {
      id: 'c_' + Date.now(),
      author: user?.username || user?.email?.split('@')[0] || 'You',
      avatarColor: '#38bdf8',
      badge: 'Member',
      timeAgo: 'Just now',
      content: newCommentText,
      upvotes: 0
    };

    const updatedComments = [...(selectedPost.commentsList || []), commentObj];

    setSelectedPost({
      ...selectedPost,
      commentsCount: selectedPost.commentsCount + 1,
      commentsList: updatedComments
    });

    setPosts(prev => prev.map(p => {
      if (p.id === selectedPost.id) {
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          commentsList: updatedComments
        };
      }
      return p;
    }));

    setNewCommentText('');
    triggerToast('Reply posted!');
  };

  return (
    <div className="landing-page" style={{ position: 'relative', zIndex: 1 }}>
      <Navbar active="discuss" />

      <div className="discuss-container">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="discuss-toast animate-slide-down">
            <Zap size={16} color="#38bdf8" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. Header Hero */}
        <section className="discuss-hero glass-panel">
          <div className="discuss-badge">
            <Sparkles size={14} />
            <span>ENGINEERING COMMUNITY & DISCUSSIONS</span>
          </div>

          <div style={{ width: '100%', height: '100px', position: 'relative', margin: '0 auto 1rem' }}>
            <TechText
              text="Share Insights. Solve Architecture."
              fontWeight={900}
              fontSize={65}
              color="#ffffff"
              accentColor="#38bdf8"
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={15}
            />
          </div>

          <p className="discuss-subtitle">
            Join developers, architects, and competitive programmers sharing interview experiences, solution breakdowns, and backend engineering notes.
          </p>

          {/* Search Bar & Create Topic Trigger */}
          <div className="discuss-search-bar">
            <div className="discuss-search-box">
              <Search size={18} color="#38bdf8" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, companies (Meta, Google), algorithms..." 
                className="discuss-search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button onClick={() => setIsNewPostModalOpen(true)} className="btn-new-post">
              <Plus size={18} />
              <span>Create Topic</span>
            </button>
          </div>
        </section>

        {/* 2. Platform Stats Overview Banner */}
        <div className="discuss-stats-grid">
          <div className="glass-card stat-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div className="stat-icon-wrapper icon-blue"><MessageSquare size={20} /></div>
              <div>
                <div className="stat-val">1,240+</div>
                <div className="stat-lbl">Community Discussions</div>
              </div>
            </div>
          </div>

          <div className="glass-card stat-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div className="stat-icon-wrapper icon-cyan"><Users size={20} /></div>
              <div>
                <div className="stat-val">18.5k</div>
                <div className="stat-lbl">Active Engineers</div>
              </div>
            </div>
          </div>

          <div className="glass-card stat-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div className="stat-icon-wrapper icon-emerald"><CheckSquare size={20} /></div>
              <div>
                <div className="stat-val">98.4%</div>
                <div className="stat-lbl">Verified Solutions</div>
              </div>
            </div>
          </div>

          <div className="glass-card stat-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div className="stat-icon-wrapper icon-amber"><Flame size={20} /></div>
              <div>
                <div className="stat-val">45.2k</div>
                <div className="stat-lbl">Helpful Upvotes</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Category Navigation & Active Tag Filter */}
        <div className="discuss-categories">
          {[
            { id: 'all', label: 'All Discussions', icon: Layers },
            { id: 'interview', label: 'Interview Experience', icon: Award },
            { id: 'solutions', label: 'Solution Breakdown', icon: Code },
            { id: 'system-design', label: 'System Design', icon: Layers },
            { id: 'career', label: 'Career & Offers', icon: TrendingUp },
            { id: 'announcements', label: 'Announcements', icon: Sparkles },
          ].map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button 
                key={cat.id} 
                className={`category-tab ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedTag(null);
                }}
              >
                <Icon size={15} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {selectedTag && (
          <div className="active-tag-banner animate-fade-in">
            <span>Filtered by tag: <strong>#{selectedTag}</strong></span>
            <button onClick={() => setSelectedTag(null)} className="clear-tag-btn">
              <X size={14} /> Clear Tag
            </button>
          </div>
        )}

        {/* 4. Main Content Grid: Discussion Feed + Sidebar */}
        <div className="discuss-main-grid">
          {/* Feed Column */}
          <div>
            <div className="feed-toolbar">
              <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>
                Showing <span style={{ color: '#fff', fontWeight: 700 }}>{filteredPosts.length}</span> discussions
              </span>

              <div className="sort-group">
                <button 
                  className={`sort-btn ${sortBy === 'hot' ? 'active' : ''}`}
                  onClick={() => setSortBy('hot')}
                >
                  <Flame size={14} /> Hot
                </button>
                <button 
                  className={`sort-btn ${sortBy === 'top' ? 'active' : ''}`}
                  onClick={() => setSortBy('top')}
                >
                  <ThumbsUp size={14} /> Top
                </button>
                <button 
                  className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`}
                  onClick={() => setSortBy('newest')}
                >
                  <Clock size={14} /> Newest
                </button>
              </div>
            </div>

            {/* Discussion Post Cards */}
            {filteredPosts.length === 0 ? (
              <div className="glass-card discuss-empty-state">
                <MessageSquare size={44} color="#38bdf8" style={{ marginBottom: '1rem' }} />
                <h3>No discussions found matching criteria</h3>
                <p>Try clearing filters or be the first to publish a topic on this subject!</p>
                <button onClick={() => { setActiveCategory('all'); setSelectedTag(null); setSearchQuery(''); }} className="btn-secondary" style={{ marginTop: '1rem' }}>
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredPosts.map(post => (
                <div key={post.id} className="post-card" onClick={() => setSelectedPost(post)}>
                  <div className="post-header">
                    <div className="post-author-info">
                      <div className="avatar-circle" style={{ background: post.avatarColor }}>
                        {post.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="author-name">{post.author}</span>
                          {post.authorBadge && (
                            <span className="author-badge">{post.authorBadge}</span>
                          )}
                        </div>
                        <span className="post-time">{post.timeAgo}</span>
                      </div>
                    </div>

                    <span className="category-pill">
                      {post.category.replace('-', ' ')}
                    </span>
                  </div>

                  <h3 className="post-title">{post.title}</h3>

                  <p className="post-snippet">{post.content}</p>

                  {post.codeSnippet && (
                    <div className="post-code-preview">
                      <pre><code>{post.codeSnippet.split('\n').slice(0, 3).join('\n')}...</code></pre>
                    </div>
                  )}

                  <div className="post-tags">
                    {post.tags.map(tag => (
                      <span 
                        key={tag} 
                        className={`post-tag ${selectedTag === tag ? 'active-tag' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTag(tag === selectedTag ? null : tag);
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="post-footer">
                    <div className="post-stats-actions">
                      <button 
                        className={`action-btn ${post.isUpvoted ? 'upvoted' : ''}`}
                        onClick={(e) => handleUpvote(post.id, e)}
                      >
                        <ThumbsUp size={15} />
                        <span>{post.upvotes} Upvotes</span>
                      </button>

                      <button className="action-btn">
                        <MessageCircle size={15} />
                        <span>{post.commentsCount} Replies</span>
                      </button>

                      <div className="action-btn" style={{ cursor: 'default' }}>
                        <Eye size={15} />
                        <span>{post.views} Views</span>
                      </div>
                    </div>

                    <button 
                      className={`action-btn ${post.isBookmarked ? 'upvoted' : ''}`}
                      onClick={(e) => handleBookmark(post.id, e)}
                      title="Save Post"
                    >
                      <Bookmark size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar Column */}
          <div>
            {/* Trending Discussions Widget */}
            <div className="glass-card discuss-sidebar-card">
              <h4 className="sidebar-title">
                <Flame size={18} color="#f59e0b" />
                <span>Trending Discussions</span>
              </h4>

              <div>
                {posts.slice(0, 4).map((post, idx) => (
                  <div key={post.id} className="hot-item" onClick={() => setSelectedPost(post)}>
                    <span className="hot-rank">#{idx + 1}</span>
                    <div>
                      <div className="hot-item-title">{post.title}</div>
                      <div className="hot-item-meta">
                        {post.upvotes} upvotes • {post.commentsCount} replies
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Engineers Widget */}
            <div className="glass-card discuss-sidebar-card">
              <h4 className="sidebar-title">
                <Star size={18} color="#38bdf8" />
                <span>Top Community Engineers</span>
              </h4>

              <div>
                {[
                  { name: 'Samiran T.', role: 'JudgeX Architect', pts: '2,840 pts', color: '#3b82f6' },
                  { name: 'Elena Rostova', role: 'Guardian 2450', pts: '2,410 pts', color: '#ec4899' },
                  { name: 'David K.', role: 'Grandmaster', pts: '1,980 pts', color: '#10b981' },
                  { name: 'Alex Chen', role: 'Meta Senior Eng', pts: '1,650 pts', color: '#f59e0b' }
                ].map((item, idx) => (
                  <div key={idx} className="contributor-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: item.color, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#fff', 
                        fontWeight: 800, 
                        fontSize: '0.8rem' 
                      }}>
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>{item.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.role}</div>
                      </div>
                    </div>
                    <span className="pts-pill">{item.pts}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Tags Cloud Widget */}
            <div className="glass-card discuss-sidebar-card">
              <h4 className="sidebar-title">
                <Tag size={18} color="#06b6d4" />
                <span>Popular Tags</span>
              </h4>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {['System Design', 'Docker', 'Dynamic Programming', 'Meta', 'Google', 'Python', 'Algorithms', 'Frontend'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                    className={`post-tag ${selectedTag === t ? 'active-tag' : ''}`}
                    style={{ cursor: 'pointer' }}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Community Rules */}
            <div className="glass-card discuss-sidebar-card" style={{ background: 'rgba(59, 130, 246, 0.08)', borderColor: 'rgba(59, 130, 246, 0.25)' }}>
              <h4 className="sidebar-title" style={{ color: '#38bdf8' }}>
                <ShieldCheck size={18} />
                <span>Community Guidelines</span>
              </h4>
              <ul className="guidelines-list">
                <li>Provide clean, bug-free explanations & code snippets.</li>
                <li>Redact proprietary or NDA-protected interview questions.</li>
                <li>Be constructive and encourage peer learning.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Detailed Post Viewer Modal */}
      {selectedPost && (
        <div className="modal-overlay" onClick={() => setSelectedPost(null)}>
          <div className="modal-content glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div className="avatar-circle" style={{ background: selectedPost.avatarColor }}>
                  {selectedPost.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{selectedPost.author}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{selectedPost.timeAgo}</div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedPost(null)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span className="category-pill" style={{ display: 'inline-block', marginBottom: '0.6rem' }}>
                {selectedPost.category.replace('-', ' ')}
              </span>
              <h2 className="modal-post-title">{selectedPost.title}</h2>
            </div>

            <div className="modal-post-body">
              {selectedPost.content}
            </div>

            {selectedPost.codeSnippet && (
              <div className="modal-code-block">
                <div className="code-block-header">
                  <span>Source Code Snippet</span>
                </div>
                <pre><code>{selectedPost.codeSnippet}</code></pre>
              </div>
            )}

            <div className="post-tags" style={{ marginBottom: '1.5rem' }}>
              {selectedPost.tags.map(t => (
                <span key={t} className="post-tag">#{t}</span>
              ))}
            </div>

            <div className="modal-actions-bar">
              <button 
                className={`action-btn ${selectedPost.isUpvoted ? 'upvoted' : ''}`}
                onClick={() => handleUpvote(selectedPost.id)}
              >
                <ThumbsUp size={16} />
                <span>{selectedPost.upvotes} Upvotes</span>
              </button>

              <button 
                className={`action-btn ${selectedPost.isBookmarked ? 'upvoted' : ''}`}
                onClick={() => handleBookmark(selectedPost.id)}
              >
                <Bookmark size={16} />
                <span>{selectedPost.isBookmarked ? 'Bookmarked' : 'Save'}</span>
              </button>
            </div>

            {/* Replies Section */}
            <div className="replies-section">
              <h3 className="replies-heading">
                Discussion Replies ({selectedPost.commentsList?.length || 0})
              </h3>

              {/* Reply Form */}
              <form onSubmit={handleAddComment} className="reply-form">
                <input 
                  type="text" 
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share a helpful thought or feedback..."
                  className="form-input"
                />
                <button type="submit" className="btn-new-post" style={{ padding: '0.6rem 1.2rem' }}>
                  <Send size={15} />
                  <span>Reply</span>
                </button>
              </form>

              {/* Comment Cards */}
              <div className="comments-list">
                {selectedPost.commentsList?.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    No replies yet. Start the conversation!
                  </p>
                ) : (
                  selectedPost.commentsList?.map(c => (
                    <div key={c.id} className="comment-box">
                      <div className="comment-author-header">
                        <span className="comment-author-name">{c.author}</span>
                        {c.badge && <span className="author-badge">{c.badge}</span>}
                        <span className="comment-time">{c.timeAgo}</span>
                      </div>
                      <div className="comment-content">
                        {c.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Create New Discussion Topic Modal */}
      {isNewPostModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewPostModalOpen(false)}>
          <div className="modal-content glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Discussion Topic</h3>
              <button 
                onClick={() => setIsNewPostModalOpen(false)}
                className="modal-close-btn"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label className="form-label">Discussion Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Google L5 System Design: Isolated Code Sandboxes"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row-2">
                <div>
                  <label className="form-label">Category</label>
                  <select 
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="form-select"
                  >
                    <option value="interview">Interview Experience</option>
                    <option value="solutions">Solution Breakdown</option>
                    <option value="system-design">System Design</option>
                    <option value="career">Career & Offers</option>
                    <option value="announcements">Announcements</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="System Design, Docker, Python"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Discussion Body</label>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your interview round experience, algorithm intuition, or architecture breakdown..."
                  className="form-textarea"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Code Snippet (Optional)</label>
                <textarea 
                  value={newCodeSnippet}
                  onChange={(e) => setNewCodeSnippet(e.target.value)}
                  placeholder="Paste Python, C++, Java, JS or Go code snippet..."
                  className="form-textarea"
                  style={{ minHeight: '90px', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="modal-actions-right">
                <button 
                  type="button" 
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-new-post">
                  Publish Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="discuss-footer">
        <p>Copyright © 2026 JudgeX. Built with ⚡ for competitive programmers & software engineers.</p>
      </footer>
    </div>
  );
}

