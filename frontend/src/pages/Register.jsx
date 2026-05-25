import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, Compass, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all details!");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    try {
      setLoading(true);
      const res = await register(name, email, password);
      
      if (res.success) {
        toast.success(`Welcome to Roamify, ${res.user.name}!`);
        navigate('/');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("An unexpected registration error occurred!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 sm:p-10 border border-slate-100 shadow-premium space-y-8">
        
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 group justify-center">
            <div className="bg-brand-500 text-white p-2 rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-slate-800">Roamify</span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Create Account</h2>
          <p className="text-xs sm:text-sm text-slate-400">Join Roamify and enjoy custom luxury voyages.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Full Name</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-brand-500 transition-colors">
              <User className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="text"
                id="name"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Email Address</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-brand-500 transition-colors">
              <Mail className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="email"
                id="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 focus:outline-none placeholder-slate-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Password</label>
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-brand-500 transition-colors">
              <Lock className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-700 focus:outline-none placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 shrink-0"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-teal-600 hover:from-brand-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transform transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Register Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          
        </form>

        <hr className="border-slate-100" />

        {/* Footer Toggle */}
        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 font-bold hover:underline">
            Sign In Here
          </Link>
        </p>

      </div>
    </div>
  );
};
