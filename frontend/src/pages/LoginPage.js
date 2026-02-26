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
  const [form, setForm] = useState({ email: '', password: '', role: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.role) {
      setError('Please select Customer or Provider before signing in.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: form.email,
        password: form.password
      });

      const { token, user } = response.data;

      // Role restriction
      if (user.role.toLowerCase() !== form.role.toLowerCase()) {
        setError(`You are registered as ${user.role}. Please select correct role.`);
        setLoading(false);
        return;
      }

      login(user, token);
      navigate(`/${user.role}/dashboard`);

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }

    setLoading(false);
  };

  const fillDemo = (account) => {
    setForm({
      email: account.email,
      password: account.password,
      role: account.role
    });
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
          <p className="text-dark-400 mt-1 text-sm">
            Your neighborhood service marketplace
          </p>
        </div>

        {/* Card */}
        <div className="bg-glass rounded-2xl p-6 shadow-2xl">
          <h2 className="font-display font-semibold text-xl text-white mb-6 text-center">
            Welcome back
          </h2>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['customer', 'provider'].map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={`p-3 rounded-xl border-2 transition-all capitalize ${
                  form.role === role
                    ? 'border-brand-500 bg-brand-500/10 text-white'
                    : 'border-dark-600 bg-dark-800 text-dark-400 hover:border-dark-500'
                }`}
              >
                {role === 'customer' ? '👤 Customer' : '🛠️ Provider'}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                Email address
              </label>
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
              <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                Password
              </label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign in
                </>
              )}
            </button>

          </form>

          <p className="text-center text-dark-400 text-sm mt-5">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
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
                className="p-2.5 rounded-xl bg-dark-800 border border-dark-600 hover:border-brand-500 hover:bg-dark-700 transition-all text-center"
              >
                <div className="text-lg mb-1">
                  {acc.role === 'customer' ? '👤' : '🛠️'}
                </div>
                <p className="text-xs font-semibold text-white capitalize">
                  {acc.role}
                </p>
                <p className="text-[10px] text-dark-400">
                  Click to fill
                </p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};