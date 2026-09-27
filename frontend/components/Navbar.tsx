'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ArrowUpRight, User, Briefcase, RefreshCw, LogOut, ChevronDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const guestLinks = [
  { label: 'Services', href: '/#services' },
  { label: 'How it works', href: '/#matching' },
  { label: 'For professionals', href: '/#professionals' },
  { label: 'Resources', href: '/#faq' },
];

const customerLinks = [
  { label: 'My Dashboard', href: '/customer' },
  { label: 'My Requests', href: '/customer#requests' },
  { label: 'Browse Local Pros', href: '/customer#pros' },
];

const providerLinks = [
  { label: 'Provider Portal', href: '/provider' },
  { label: 'Job Leads Marketplace', href: '/provider#leads' },
  { label: 'My Proposals', href: '/provider#quotes' },
  { label: 'Earnings & Metrics', href: '/provider#earnings' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { user, role, isAuthenticated, logout, switchRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = (targetRole: 'customer' | 'provider') => {
    switchRole(targetRole);
    setProfileOpen(false);
    setMobileOpen(false);
    if (targetRole === 'provider') {
      router.push('/provider');
    } else {
      router.push('/customer');
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    router.push('/');
  };

  const navLinks = !isAuthenticated || !role
    ? guestLinks
    : role === 'customer'
    ? customerLinks
    : providerLinks;

  const homeHref = !isAuthenticated
    ? '/'
    : role === 'customer'
    ? '/customer'
    : '/provider';

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-500 ease-editorial',
        scrolled || pathname !== '/'
          ? 'bg-ink/90 backdrop-blur-md border-b border-paper/10 py-4'
          : 'bg-transparent py-7'
      )}
    >
      <nav className="mx-auto flex max-w-content items-center justify-between px-6 md:px-10">
        
        {/* Brand Logo & Role Tag */}
        <div className="flex items-center gap-3">
          <Link href={homeHref} className="flex items-center gap-2 text-paper group">
            <span className="font-display text-2xl italic tracking-tightest group-hover:text-white transition-colors">
              Worksy
            </span>
          </Link>

          {isAuthenticated && role && (
            <span
              className={cn(
                'px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full border',
                role === 'customer'
                  ? 'bg-blue-950/60 border-blue-500/30 text-blue-300'
                  : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
              )}
            >
              {role === 'customer' ? 'Customer Mode' : 'Provider Pro'}
            </span>
          )}
        </div>

        {/* Desktop Links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-[13px] text-paper/80 transition-colors duration-300 hover:text-paper"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Action Buttons & Profile Area */}
        <div className="hidden items-center gap-4 md:flex">
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="text-[13px] text-paper/80 transition-colors duration-300 hover:text-paper font-medium px-2"
              >
                Log in
              </Link>
              <Link
                href="/login?mode=signup"
                className="group flex items-center gap-1.5 rounded-full bg-paper px-5 py-2.5 text-[13px] font-medium text-ink transition-colors duration-300 hover:bg-white"
              >
                Get started
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </>
          ) : (
            <>
              {role === 'customer' && (
                <Link
                  href="/customer#post"
                  className="flex items-center gap-1.5 rounded-full bg-paper text-ink px-4 py-2 text-[12px] font-bold tracking-wide uppercase hover:bg-white transition-colors"
                >
                  <PlusCircle size={14} />
                  <span>Post Job</span>
                </Link>
              )}

              {/* User Profile & Role Switch Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2.5 rounded-full bg-paper/10 border border-paper/20 px-3 py-1.5 text-paper hover:bg-paper/20 transition-all"
                >
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-paper/40"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-paper/20 flex items-center justify-center text-paper font-bold text-xs">
                      {user?.name?.[0] || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-medium max-w-[100px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown size={14} className={cn('transition-transform', profileOpen && 'rotate-180')} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-ink/95 border border-paper/20 shadow-2xl p-2 text-paper backdrop-blur-xl z-50"
                    >
                      {/* User Info Header */}
                      <div className="p-3 border-b border-paper/10">
                        <div className="text-xs font-bold text-white">{user?.name}</div>
                        <div className="text-[11px] text-paper/60 truncate">{user?.email}</div>
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-paper/80">
                          {role === 'customer' ? <User size={12} /> : <Briefcase size={12} />}
                          <span>Active Role: <strong className="text-white">{role === 'customer' ? 'Customer' : 'Service Pro'}</strong></span>
                        </div>
                      </div>

                      {/* Switch Role Action */}
                      <div className="p-1.5">
                        <button
                          onClick={() => handleRoleSwitch(role === 'customer' ? 'provider' : 'customer')}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-paper/90 hover:bg-paper/10 hover:text-white transition-colors text-left"
                        >
                          <RefreshCw size={14} className="text-paper/70" />
                          <div>
                            <div className="font-semibold">Switch to {role === 'customer' ? 'Provider View' : 'Customer View'}</div>
                            <div className="text-[10px] text-paper/50">
                              {role === 'customer' ? 'Offer services & take leads' : 'Find pros & post jobs'}
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="p-1.5 border-t border-paper/10">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-950/40 transition-colors text-left"
                        >
                          <LogOut size={14} />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
          className="text-paper md:hidden"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-ink md:hidden border-b border-paper/10"
          >
            <ul className="flex flex-col gap-1 px-6 pb-6 pt-2">
              {isAuthenticated && role && (
                <li className="py-3 border-b border-paper/10 flex items-center justify-between">
                  <div className="text-xs text-paper/70">
                    Logged in as <strong className="text-white">{user?.name}</strong> ({role})
                  </div>
                  <button
                    onClick={() => handleRoleSwitch(role === 'customer' ? 'provider' : 'customer')}
                    className="text-[11px] font-bold uppercase tracking-wider text-paper bg-paper/10 px-2.5 py-1 rounded"
                  >
                    Switch Role
                  </button>
                </li>
              )}

              {navLinks.map((l) => (
                <li key={l.label} className="border-b border-paper/10 py-3.5">
                  <Link
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-display text-xl italic text-paper"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}

              <li className="flex items-center gap-4 pt-6">
                {!isAuthenticated ? (
                  <>
                    <Link href="/login" className="text-sm font-medium text-paper/80" onClick={() => setMobileOpen(false)}>
                      Log in
                    </Link>
                    <Link
                      href="/login?mode=signup"
                      className="rounded-full bg-paper px-5 py-2.5 text-sm font-medium text-ink"
                      onClick={() => setMobileOpen(false)}
                    >
                      Get started
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-400 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
