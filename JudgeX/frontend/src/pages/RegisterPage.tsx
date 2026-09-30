import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import { setCredentials } from '../store/slices/authSlice';
import { supabase } from '../config/supabase';
import { API_URL } from '../config';
import axios from 'axios';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePic: '',
    country: '',
    institution: '',
    github: '',
    linkedin: '',
    agreeTerms: false,
    agreePrivacy: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const errParam = searchParams.get('error');
    if (errParam) {
      setError(decodeURIComponent(errParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setIsLoading(true);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    try {
      if (isSupabaseConfigured) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              username: formData.username,
              avatar_url: formData.profilePic
            }
          }
        });

        if (signUpError) throw new Error(signUpError.message);

        if (data.session && data.user) {
          try {
            await axios.post(`${API_URL}/api/auth/sync`, {
              fullName: formData.fullName,
              profilePic: formData.profilePic,
              country: formData.country,
              institution: formData.institution,
              github: formData.github,
              linkedin: formData.linkedin,
            }, {
              headers: { Authorization: `Bearer ${data.session.access_token}` }
            });
          } catch (syncErr) {
            console.warn('Profile sync warning:', syncErr);
          }

          dispatch(setCredentials({
            user: {
              id: data.user.id,
              email: data.user.email || '',
              username: formData.username
            },
            token: data.session.access_token
          }));

          navigate('/problems');
        } else {
          alert('Registration successful! Please check your email to verify your account.');
          navigate('/login');
        }
      } else {
        const devUser = {
          id: 'dev-user-id-' + Date.now(),
          email: formData.email,
          username: formData.username || formData.email.split('@')[0],
          fullName: formData.fullName
        };
        dispatch(setCredentials({ user: devUser, token: 'dev-jwt-token' }));
        navigate('/problems');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    setIsLoading(true);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

    try {
      if (isSupabaseConfigured) {
        const { error: oauthErr } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/home`,
          },
        });
        if (oauthErr) {
          console.warn(`Supabase ${provider} OAuth failed, trying backend:`, oauthErr.message);
          await redirectBackendOAuth(provider);
        }
      } else {
        await redirectBackendOAuth(provider);
      }
    } catch (err: any) {
      setError(err.message || `Failed to initiate ${provider} login.`);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectBackendOAuth = async (provider: 'google' | 'github') => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      await fetch(`${API_URL}/api/auth/google`, { method: 'HEAD', mode: 'no-cors', signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (e) {
      throw new Error(`Backend server is not running on ${API_URL}. Please start the backend server by running 'npm run dev' inside the backend directory.`);
    }
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <Link to="/" className="register-logo-link">
            <img src="/logo.png" alt="JudgeX Logo" className="register-logo-img" />
            <span className="logo-text">Judge<span style={{ color: '#3b82f6' }}>X</span></span>
          </Link>
          <h2>Create Your Account</h2>
          <p className="register-subtitle">
            Join JudgeX to solve coding problems, participate in contests, and track your progress.
          </p>
        </div>

        {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
        
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="input-group">
              <label htmlFor="fullName">Full Name</label>
              <input type="text" id="fullName" value={formData.fullName} onChange={handleChange} placeholder="Samiran Das" required />
            </div>
            
            <div className="input-group">
              <label htmlFor="username">Username (must be unique)</label>
              <input type="text" id="username" value={formData.username} onChange={handleChange} placeholder="samirandas" required />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="samiran@example.com" required />
            </div>

            <div className="input-row">
              <div className="input-group password-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input type={showPassword ? "text" : "password"} id="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="input-group password-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Optional Information</h3>
            <div className="input-group">
              <label htmlFor="profilePic">Profile Picture URL</label>
              <input type="url" id="profilePic" value={formData.profilePic} onChange={handleChange} placeholder="https://example.com/avatar.jpg" />
            </div>
            
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="country">Country</label>
                <input type="text" id="country" value={formData.country} onChange={handleChange} placeholder="United States" />
              </div>
              <div className="input-group">
                <label htmlFor="institution">Institution/University</label>
                <input type="text" id="institution" value={formData.institution} onChange={handleChange} placeholder="Stanford University" />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="github">GitHub Profile</label>
                <input type="url" id="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/username" />
              </div>
              <div className="input-group">
                <label htmlFor="linkedin">LinkedIn Profile</label>
                <input type="url" id="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
              </div>
            </div>
          </div>

          <div className="form-section terms-section">
            <label className="checkbox-label">
              <input type="checkbox" id="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} required />
              <span>I agree to the <a href="#">Terms of Service</a></span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" id="agreePrivacy" checked={formData.agreePrivacy} onChange={handleChange} required />
              <span>I agree to the <a href="#">Privacy Policy</a></span>
            </label>
          </div>

          <button type="submit" className="btn-primary-register" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="social-divider">
            <span>or</span>
          </div>

          <div className="social-buttons">
            <button 
              type="button" 
              className="btn-social google" 
              onClick={() => handleOAuth('google')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button 
              type="button" 
              className="btn-social github"
              onClick={() => handleOAuth('github')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>
        </form>

        <div className="register-footer">
          <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
