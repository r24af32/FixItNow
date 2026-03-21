import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const DEMO_ACCOUNTS = [
  { role: 'customer', email: 'customer@demo.com', password: 'demo123', name: 'Priya Nair' },
  { role: 'provider', email: 'provider@demo.com', password: 'demo123', name: 'Ravi Kumar' },
  
];


export const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: form.email,
        password: form.password
      });

      const { token, user } = response.data;

      // Save to context
      login(user, token);

      // Redirect based on role
      navigate(`/${user.role.toLowerCase()}/dashboard`);
      
    } catch (err) {
      // Integration of Yashashri's backend status codes
      if (err.response) {
        const status = err.response.status;
        const backendMessage =
          typeof err.response.data === "string"
            ? err.response.data
            : err.response.data?.message;
        
        if (status === 400) {
          setError(backendMessage || "Please provide both email and password.");
        } else if (status === 401) {
          setError("Incorrect email or password.");
        } else if (status === 403) {
          setError(backendMessage || "Your account is suspended or pending approval. You can message admin, but booking and service features are disabled until approval.");
        } else {
          setError(backendMessage || "Server error. Please try again later.");
        }
      } else {
        setError("Network error. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setForm({ email: account.email, password: account.password });
    setError('');
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl shadow-glow-orange mb-4">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white">
            FixIt<span className="text-brand-500">Now</span>
          </h1>
          <p className="text-dark-400 mt-1 text-sm">Your neighborhood service marketplace</p>
        </div>

        {/* Card */}
        <div className="bg-glass rounded-2xl p-6 shadow-2xl">
          <h2 className="font-display font-semibold text-xl text-white mb-6 text-center">Welcome back</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm mb-4 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-dark-300 mb-1.5 block">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-dark-300 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-brand-500" />
                <span className="text-dark-400">Remember me</span>
              </label>
              <button type="button" className="text-brand-400 hover:text-brand-300 transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <><LogIn className="w-5 h-5" /> Sign in</>
              )}
            </button>
          </form>

          <p className="text-center text-dark-400 text-sm mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="mt-4 bg-glass-light rounded-2xl p-4">
          <p className="text-xs font-mono uppercase tracking-wider text-dark-400 text-center mb-3">
            ✨ Quick Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.role}
                onClick={() => fillDemo(acc)}
                className="p-2.5 rounded-xl bg-dark-800 border border-dark-600 hover:border-brand-500 hover:bg-dark-700 transition-all text-center group"
              >
                <div className="text-lg mb-1">
                  {acc.role === 'customer' ? '👤' : acc.role === 'provider' ? '🛠️' : '⚙️'}
                </div>
                <p className="text-xs font-semibold text-white capitalize">{acc.role}</p>
                <p className="text-[10px] text-dark-400 group-hover:text-dark-300 transition-colors">Click to fill</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};