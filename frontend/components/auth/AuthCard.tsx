'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Briefcase,
  Sparkles,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface AuthCardProps {
  initialMode?: 'login' | 'signup';
  initialRole?: 'client' | 'pro';
}

export default function AuthCard({
  initialMode = 'login',
  initialRole = 'client',
}: AuthCardProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'client' | 'pro'>(initialRole);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Flow & State
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password || (mode === 'signup' && !fullName)) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    // Simulate Network Request
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1200);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
    }, 1000);
  };

  const resetForm = () => {
    setIsSuccess(false);
    setErrorMsg('');
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Outer Card Container */}
      <div className="relative overflow-hidden rounded-3xl border border-paper/15 bg-ink-soft/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Glow Ambient Effect */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-paper/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-paper/5 blur-3xl" />

        {isSuccess ? (
          /* Success Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-paper/10 text-paper border border-paper/20">
              <CheckCircle2 size={36} className="text-paper" />
            </div>
            <h3 className="mt-6 font-display text-2xl italic text-paper">
              {mode === 'login' ? 'Welcome Back!' : 'Account Created!'}
            </h3>
            <p className="mt-2 text-sm text-paper/70">
              {mode === 'login'
                ? `Signed in as ${email}`
                : `Welcome to Worksy as a ${role === 'client' ? 'Client' : 'Professional'}!`}
            </p>

            <div className="mt-8 rounded-2xl bg-paper/5 p-4 border border-paper/10 text-left">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-paper/80 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-paper">Authentication Verified</p>
                  <p className="text-[12px] text-paper/60">Redirecting to your personalized workspace...</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <a
                href="/"
                className="w-full rounded-full bg-paper py-3.5 text-center text-sm font-medium text-ink transition-all hover:bg-white"
              >
                Go to Dashboard
              </a>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-paper/60 hover:text-paper underline underline-offset-4"
              >
                Sign into another account
              </button>
            </div>
          </motion.div>
        ) : forgotPasswordOpen ? (
          /* Forgot Password View */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <button
              onClick={() => {
                setForgotPasswordOpen(false);
                setResetSent(false);
                setErrorMsg('');
              }}
              className="inline-flex items-center gap-2 text-xs text-paper/70 hover:text-paper mb-6 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Log In
            </button>

            {resetSent ? (
              <div className="text-center py-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper/10 text-paper">
                  <Mail size={24} />
                </div>
                <h3 className="mt-4 font-display text-xl italic text-paper">Check your inbox</h3>
                <p className="mt-2 text-xs text-paper/70">
                  We sent a password reset link to <span className="text-paper font-medium">{resetEmail}</span>.
                </p>
                <button
                  onClick={() => setResetSent(false)}
                  className="mt-6 w-full rounded-full border border-paper/30 py-3 text-xs text-paper hover:bg-paper/10"
                >
                  Resend Link
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <h3 className="font-display text-2xl italic text-paper">Reset password</h3>
                  <p className="mt-1 text-xs text-paper/70">
                    Enter the email linked to your account and we&apos;ll send instructions to reset your password.
                  </p>
                </div>

                {errorMsg && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-paper/80 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-paper/40" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl bg-ink/70 border border-paper/15 pl-10 pr-4 py-3 text-sm text-paper placeholder-paper/30 focus:border-paper focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-paper py-3.5 text-sm font-medium text-ink transition-all hover:bg-white disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            )}
          </motion.div>
        ) : (
          /* Log In / Sign Up Main View */
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-full bg-ink/70 p-1 border border-paper/15 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className={`relative flex-1 py-2 text-xs font-medium transition-colors ${
                  mode === 'login' ? 'text-ink' : 'text-paper/70 hover:text-paper'
                }`}
              >
                {mode === 'login' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-paper rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Log In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className={`relative flex-1 py-2 text-xs font-medium transition-colors ${
                  mode === 'signup' ? 'text-ink' : 'text-paper/70 hover:text-paper'
                }`}
              >
                {mode === 'signup' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-paper rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Create Account</span>
              </button>
            </div>

            {/* Header Title */}
            <div className="mb-6">
              <h2 className="font-display text-3xl italic tracking-tightest text-paper">
                {mode === 'login' ? 'Welcome back.' : 'Join Worksy.'}
              </h2>
              <p className="mt-1 text-xs text-paper/70">
                {mode === 'login'
                  ? 'Access your local jobs, messages, and saved professionals.'
                  : 'Connect with local talent or offer your professional services.'}
              </p>
            </div>

            {/* Role Selection Pill Switch (For Signup or Login filter) */}
            <div className="mb-6 rounded-2xl bg-paper/5 p-3 border border-paper/10">
              <span className="block text-[11px] font-semibold tracking-wider text-paper/50 uppercase mb-2">
                I am using Worksy as:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-medium transition-all ${
                    role === 'client'
                      ? 'bg-paper text-ink shadow'
                      : 'bg-transparent text-paper/70 hover:text-paper hover:bg-paper/10'
                  }`}
                >
                  <User size={14} /> Client / Homeowner
                </button>
                <button
                  type="button"
                  onClick={() => setRole('pro')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-medium transition-all ${
                    role === 'pro'
                      ? 'bg-paper text-ink shadow'
                      : 'bg-transparent text-paper/70 hover:text-paper hover:bg-paper/10'
                  }`}
                >
                  <Briefcase size={14} /> Service Professional
                </button>
              </div>
            </div>

            {/* Social Logins */}
            <div className="space-y-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    setIsSuccess(true);
                  }, 800);
                }}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-paper/20 bg-paper/5 py-3 text-xs font-medium text-paper transition-all hover:bg-paper/15"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="w-full border-t border-paper/15" />
              <span className="absolute bg-ink-soft px-3 text-[11px] uppercase tracking-wider text-paper/40">
                Or with email
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300">
                  {errorMsg}
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-paper/80 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-paper/40" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full rounded-xl bg-ink/70 border border-paper/15 pl-10 pr-4 py-3 text-sm text-paper placeholder-paper/30 focus:border-paper focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-paper/80 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-paper/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full rounded-xl bg-ink/70 border border-paper/15 pl-10 pr-4 py-3 text-sm text-paper placeholder-paper/30 focus:border-paper focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-paper/80">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-[11px] text-paper/60 hover:text-paper transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-paper/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-ink/70 border border-paper/15 pl-10 pr-10 py-3 text-sm text-paper placeholder-paper/30 focus:border-paper focus:outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-paper/40 hover:text-paper transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'login' ? (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-paper/20 bg-ink/80 text-paper focus:ring-0 accent-paper"
                  />
                  <label htmlFor="remember" className="text-xs text-paper/70 select-none cursor-pointer">
                    Remember login for 30 days
                  </label>
                </div>
              ) : (
                <p className="text-[11px] text-paper/50 leading-relaxed pt-1">
                  By creating an account, you agree to Worksy&apos;s{' '}
                  <a href="#" className="underline text-paper/70 hover:text-paper">Terms of Service</a> and{' '}
                  <a href="#" className="underline text-paper/70 hover:text-paper">Privacy Policy</a>.
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-paper py-3.5 text-sm font-medium text-ink transition-all hover:bg-white hover:shadow-lg disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : `Register as ${role === 'client' ? 'Client' : 'Pro'}`}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
