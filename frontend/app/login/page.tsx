'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  User,
  Briefcase,
} from 'lucide-react';
import { useAuth, UserRole, UserProfile } from '@/lib/auth-context';
import { api, ApiError } from '@/lib/api';
import { useGoogleSignInOverlay } from '@/lib/social-auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    login,
    register,
    loginWithGoogle,
    isReady,
    isAuthenticated,
    user: sessionUser,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole>('customer');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot Password flow
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Google Sign-In
  const googleContainerRef = useRef<HTMLDivElement>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const { configured: googleConfigured } = useGoogleSignInOverlay(
    googleContainerRef,
    (idToken) => {
      setErrorMsg('');
      setGoogleBusy(true);
      loginWithGoogle(idToken, role)
        .then(redirectForRole)
        .catch((err) => setErrorMsg(err instanceof ApiError ? err.message : 'Google sign-in failed. Please try again.'))
        .finally(() => setGoogleBusy(false));
    },
    (message) => setErrorMsg(message)
  );

  const anyBusy = isLoading || googleBusy;

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const roleParam = searchParams.get('role');
    if (modeParam === 'signup') setMode('signup');
    if (roleParam === 'provider' || roleParam === 'pro') setRole('provider');
    if (roleParam === 'customer' || roleParam === 'client') setRole('customer');
  }, [searchParams]);

  const redirectForRole = (profile: UserProfile) => {
    router.push(profile.role === 'provider' ? '/provider' : '/customer');
  };

  // Already signed in (valid, unexpired token) -> skip the form
  useEffect(() => {
    if (isReady && isAuthenticated && sessionUser) redirectForRole(sessionUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (mode === 'signup' && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      // The account's role is decided by the server (registration role / stored role), not by the toggle on login.
      const profile =
        mode === 'signup'
          ? await register(fullName, email, password, role)
          : await login(email, password);
      redirectForRole(profile);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFallbackClick = () => {
    if (!googleConfigured) {
      setErrorMsg('Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      await api.forgotPassword(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-black flex flex-col justify-between font-sans antialiased">
      
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-6 md:px-14">
        <Link href="/" className="font-serif italic text-2xl font-bold tracking-tight text-black">
          Worksy
        </Link>

        {/* Mode Toggle Button in Header */}
        {mode === 'login' ? (
          <button
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className="text-[11px] font-bold tracking-widest text-black uppercase hover:opacity-70 transition-opacity"
          >
            CREATE ACCOUNT
          </button>
        ) : (
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className="text-[11px] font-bold tracking-widest text-black uppercase hover:opacity-70 transition-opacity"
          >
            LOG IN
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-4xl px-6 py-8 my-auto">
        {forgotOpen ? (
          /* Forgot Password View */
          <div className="max-w-md mx-auto py-8">
            <button
              onClick={() => {
                setForgotOpen(false);
                setResetSent(false);
                setErrorMsg('');
              }}
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-black mb-8 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Log In
            </button>

            {resetSent ? (
              <div className="text-center py-6">
                <h3 className="text-2xl font-bold text-black">Check your inbox</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Instructions to reset your password have been sent to <span className="font-semibold text-black">{resetEmail}</span>.
                </p>
                <button
                  onClick={() => setResetSent(false)}
                  className="mt-8 w-full border border-black py-3 text-xs font-bold tracking-widest uppercase text-black hover:bg-black hover:text-white transition-colors"
                >
                  Resend Email
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-black tracking-tight">Forgot Password</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Enter your email address below and we&apos;ll send you a link to reset your password.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full border-b border-gray-300 pb-2 text-sm text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'SEND RESET LINK'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Main Login / Signup Form */
          <div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-black mb-6">
              {mode === 'login' ? 'Log into Worksy' : 'Create your Worksy account'}
            </h1>

            {/* Role Selection Box */}
            <div className="max-w-md mx-auto mb-10">
              <label className="block text-center text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
                SELECT YOUR ROLE TO CONTINUE
              </label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex flex-col items-center justify-center py-3 px-4 rounded-md text-xs font-bold transition-all ${
                    role === 'customer'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:text-black hover:bg-white/50'
                  }`}
                >
                  <User size={18} className="mb-1" />
                  <span>CUSTOMER</span>
                  <span className={`text-[10px] font-normal mt-0.5 ${role === 'customer' ? 'text-gray-300' : 'text-gray-500'}`}>
                    I need a service
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`flex flex-col items-center justify-center py-3 px-4 rounded-md text-xs font-bold transition-all ${
                    role === 'provider'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:text-black hover:bg-white/50'
                  }`}
                >
                  <Briefcase size={18} className="mb-1" />
                  <span>SERVICE PROVIDER</span>
                  <span className={`text-[10px] font-normal mt-0.5 ${role === 'provider' ? 'text-gray-300' : 'text-gray-500'}`}>
                    I offer services
                  </span>
                </button>
              </div>
            </div>

            {/* 2-Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-10 md:gap-14 max-w-3xl mx-auto">
              
              {/* Left Column: Direct Form */}
              <form onSubmit={handleSubmit} className="flex flex-col justify-between space-y-6">
                <div>
                  {errorMsg && (
                    <div className="mb-4 p-3 text-xs bg-red-50 text-red-600 border border-red-200">
                      {errorMsg}
                    </div>
                  )}

                  {mode === 'signup' && (
                    <div className="mb-6">
                      <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={role === 'provider' ? 'Alex Morgan (Business / Pro Name)' : 'Jordan Smith'}
                        className="w-full border-b border-gray-300 pb-2 text-sm text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full border-b border-gray-300 pb-2 text-sm text-black placeholder-gray-400 focus:border-black focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="relative mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                        PASSWORD
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setForgotOpen(true);
                            setErrorMsg('');
                          }}
                          className="text-[10px] font-bold tracking-wider text-gray-400 hover:text-black uppercase transition-colors"
                        >
                          FORGOT PASSWORD?
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center border-b border-gray-300 focus-within:border-black transition-colors">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full pb-2 text-sm text-black placeholder-gray-400 focus:outline-none pr-8 bg-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 bottom-2 text-black hover:opacity-70 transition-opacity"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || googleBusy}
                  className={`w-full py-3.5 text-xs font-bold tracking-widest uppercase transition-colors duration-200 mt-2 flex items-center justify-center gap-2 ${
                    email && password
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-[#f2f2f2] text-gray-400 cursor-pointer hover:bg-black hover:text-white'
                  } disabled:opacity-50`}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    `CONTINUE AS ${role === 'provider' ? 'PROVIDER' : 'CUSTOMER'}`
                  )}
                </button>
              </form>

              {/* Middle Vertical Divider */}
              <div className="relative flex md:flex-col items-center justify-center my-4 md:my-0">
                <div className="w-full md:w-px h-px md:h-full bg-gray-200" />
                <span className="absolute bg-white px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  OR
                </span>
              </div>

              {/* Right Column: Social Login Buttons */}
              <div className="flex flex-col justify-center space-y-3.5">
                {/* Google: a real (invisible) GSI button is overlaid on top of this custom-styled
                    button, so the click that opens the OAuth popup is a genuine user gesture on
                    Google's own element, while the person only ever sees our design. */}
                <div className="relative w-full">
                  {googleConfigured && (
                    <div
                      ref={googleContainerRef}
                      className={`peer absolute inset-0 z-10 overflow-hidden opacity-0 ${
                        googleBusy || isLoading ? 'pointer-events-none' : ''
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    tabIndex={googleConfigured ? -1 : 0}
                    onClick={googleConfigured ? undefined : handleGoogleFallbackClick}
                    disabled={googleBusy}
                    aria-label="Continue with Google"
                    className="relative z-0 w-full border border-black bg-white py-3.5 px-5 text-xs font-bold text-black transition-colors duration-200 flex items-center justify-center peer-hover:bg-black peer-hover:text-white disabled:opacity-50"
                  >
                    {googleBusy ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" /> Signing in with Google...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 absolute left-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span className="w-full text-center pl-4">Continue with Google</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>

            {/* Bottom Link: FORGOT PASSWORD? */}
            <div className="mt-16 text-center">
              <button
                type="button"
                onClick={() => {
                  setForgotOpen(true);
                  setErrorMsg('');
                }}
                className="text-[11px] font-bold tracking-widest text-black hover:opacity-60 uppercase transition-opacity"
              >
                FORGOT PASSWORD?
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer / Bottom Spacing */}
      <footer className="w-full py-6 text-center text-[10px] text-gray-400 uppercase tracking-widest">
        Worksy Marketplace © {new Date().getFullYear()}
      </footer>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f7f6f2]"><Loader2 className="w-8 h-8 animate-spin text-black" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
