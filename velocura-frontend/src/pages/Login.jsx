import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect them directly to dashboard
    if (user) {
      redirectUser(user.role);
    }

    if (searchParams.get('expired') === 'true') {
      setExpiredMsg(true);
    }
  }, [user]);

  const redirectUser = (role) => {
    if (role === 'PATIENT') navigate('/patient/dashboard', { replace: true });
    else if (role === 'DOCTOR') navigate('/doctor/dashboard', { replace: true });
    else if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
    else navigate('/', { replace: true });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExpiredMsg(false);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, email: userEmail, role, firstName, lastName } = response.data;
      
      login(token, userEmail, role, firstName, lastName);
      redirectUser(role);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password.');
      } else if (err.response && err.response.data && typeof err.response.data === 'string') {
        setError(err.response.data);
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden px-4">
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] left-[-15%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse-glow" />

      <div className="w-full max-w-md z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 items-center justify-center shadow-lg shadow-cyan-500/20 mb-4 hover:scale-105 transition-transform duration-300">
            <svg className="w-7 h-7 text-slate-950 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Welcome Back</h2>
          <p className="text-sm text-slate-400 mt-2 font-mono">Access your VeloCura medical portal</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl relative">
          
          {/* Notifications */}
          {expiredMsg && (
            <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Session expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            
            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Email Address</label>
              <input
                id="email"
                type="email"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all duration-200"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Password</label>
              <input
                id="password"
                type="password"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all duration-200 flex items-center justify-center text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-2.5" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Redirect to Register link */}
          <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-900/60 pt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200">
              Create an account
            </Link>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-slate-500 hover:text-slate-400 text-xs transition-colors duration-200 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to homepage
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
