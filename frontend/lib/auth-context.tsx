'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError, ApiLoginResponse, ApiProvider, ApiUser, setUnauthorizedHandler, tokenStore } from '@/lib/api';

export type UserRole = 'customer' | 'provider';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  /** Provider accounts only: id of provider_profiles row (used by /bookings/provider/{id}). Undefined until onboarding is done. */
  providerId?: number;
  businessName?: string;
  category?: string;
  rating?: number;
  completedJobs?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  /** false until localStorage has been read on the client; guards must wait for this. */
  isReady: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<UserProfile>;
  /** Verifies the OTP and logs in; creates the account first if this phone number is new. */
  loginWithPhone: (phone: string, otp: string, role: UserRole) => Promise<UserProfile>;
  /** idToken is the Google Identity Services credential (a JWT), not an access token. */
  loginWithGoogle: (idToken: string, role: UserRole) => Promise<UserProfile>;
  logout: () => void;
  /** Roles are fixed per account on the server, so this signs out and opens the login screen for the other role. */
  switchRole: (newRole: UserRole) => void;
  /** Re-reads the provider profile (call after provider onboarding). */
  refreshProviderProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'worksy_auth_state_v2';

function tokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

const toRole = (r: ApiUser['role']): UserRole => (r === 'PROVIDER' ? 'provider' : 'customer');

function toProfile(u: ApiUser, provider?: ApiProvider | null): UserProfile {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: toRole(u.role),
    phone: u.phone ?? undefined,
    avatar: u.avatarUrl ?? undefined,
    providerId: provider?.id,
    businessName: provider?.businessName,
    category: provider?.category,
    rating: provider?.rating,
    completedJobs: provider?.completedJobs,
  };
}

async function loadProviderProfile(userId: number): Promise<ApiProvider | null> {
  try {
    return await api.getMyProviderProfile(userId);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null; // provider has not completed onboarding yet
    throw e;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  const saveUser = useCallback((newUser: UserProfile | null) => {
    setUser(newUser);
    try {
      if (newUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* storage unavailable */ }
  }, []);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    saveUser(null);
  }, [saveUser]);

  // Restore session (only if a non-expired token exists)
  useEffect(() => {
    try {
      const token = tokenStore.get();
      const stored = localStorage.getItem(STORAGE_KEY);
      if (token && stored && !tokenExpired(token)) {
        setUser(JSON.parse(stored));
      } else {
        tokenStore.clear();
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to restore auth state:', e);
    }
    setIsReady(true);
  }, []);

  // Any protected API call that returns 401 with a token => session expired
  useEffect(() => {
    setUnauthorizedHandler(() => saveUser(null));
    return () => setUnauthorizedHandler(null);
  }, [saveUser]);

  // Shared by every login method (email, phone, Google): they all end up with the same
  // { token, user } shape from the backend's single JWT system, so the session is applied the
  // same way regardless of how the person signed in.
  const applySession = async (res: ApiLoginResponse): Promise<UserProfile> => {
    tokenStore.set(res.token); // must be stored before the profile call so it carries the Authorization header
    try {
      const provider = res.user.role === 'PROVIDER' ? await loadProviderProfile(res.user.id) : null;
      const profile = toProfile(res.user, provider);
      saveUser(profile);
      return profile;
    } catch (e) {
      tokenStore.clear();
      throw e;
    }
  };

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const res = await api.login({ email: email.trim(), password });
    return applySession(res);
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<UserProfile> => {
    await api.register({ name: name.trim(), email: email.trim(), password, role: role === 'provider' ? 'PROVIDER' : 'CUSTOMER' });
    return login(email, password);
  };

  const loginWithPhone = async (phone: string, otp: string, role: UserRole): Promise<UserProfile> => {
    const res = await api.verifyPhoneOtp({ phone, otp, role: role === 'provider' ? 'PROVIDER' : 'CUSTOMER' });
    return applySession(res);
  };

  const loginWithGoogle = async (idToken: string, role: UserRole): Promise<UserProfile> => {
    const res = await api.loginWithGoogle({ idToken, role: role === 'provider' ? 'PROVIDER' : 'CUSTOMER' });
    return applySession(res);
  };

  const logout = () => clearSession();

  const switchRole = (newRole: UserRole) => {
    clearSession();
    if (typeof window !== 'undefined') window.location.assign(`/login?role=${newRole}`);
  };

  const refreshProviderProfile = async () => {
    if (!user || user.role !== 'provider') return;
    const provider = await loadProviderProfile(user.id);
    saveUser({
      ...user,
      providerId: provider?.id,
      businessName: provider?.businessName,
      category: provider?.category,
      rating: provider?.rating,
      completedJobs: provider?.completedJobs,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isReady,
        login,
        register,
        loginWithPhone,
        loginWithGoogle,
        logout,
        switchRole,
        refreshProviderProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
