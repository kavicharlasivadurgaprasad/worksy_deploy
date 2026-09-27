/**
 * Single place that talks to the Spring Boot backend.
 *  - Base URL comes from NEXT_PUBLIC_API_URL (default: local backend on :8080)
 *  - Attaches "Authorization: Bearer <jwt>" to every request that has a stored token
 *  - Converts every failure into an ApiError carrying the backend's { status, message, fieldErrors }
 */

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');

const TOKEN_KEY = 'worksy_token_v1';

export const tokenStore = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(token: string) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* storage unavailable */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
  },
};

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

let unauthorizedHandler: (() => void) | null = null;
/** AuthProvider registers this so an expired/invalid token logs the user out everywhere. */
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = tokenStore.get();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, `Cannot reach the server at ${API_BASE_URL}. Is the backend running?`);
  }

  if (res.status === 204) return undefined as T;

  let data: any = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = null; }
  }

  if (!res.ok) {
    // 401 on a protected call = expired/invalid token. Login/register failures also use 401/409 but
    // are surfaced to the form, so only trigger the global logout when we actually sent a token.
    if (res.status === 401 && token && !path.startsWith('/auth/')) {
      tokenStore.clear();
      unauthorizedHandler?.();
    }
    throw new ApiError(
      res.status,
      (data && data.message) || `Request failed (${res.status})`,
      data && data.fieldErrors ? data.fieldErrors : undefined
    );
  }
  return data as T;
}

/* ------------------------------------------------------------------ */
/* Backend DTO shapes (mirror the Java DTOs exactly)                   */
/* ------------------------------------------------------------------ */
export type ApiRole = 'CUSTOMER' | 'PROVIDER';
export type ApiBookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ApiAddressLabel = 'HOME' | 'OFFICE' | 'OTHER';

export interface ApiUser {
  id: number; name: string; email: string; role: ApiRole; phone: string | null; avatarUrl: string | null;
}
export interface ApiLoginResponse { token: string; user: ApiUser }
export interface ApiOtpSentResponse { message: string; expiresInSeconds: number; resendCooldownSeconds: number }
export interface ApiCategory { id: number; name: string; icon: string; description: string | null }
export interface ApiAddon { id: number; name: string; price: number; description: string | null }
export interface ApiService {
  id: number; categoryId: number; categoryName: string; title: string; price: number; duration: string;
  description: string | null; imageUrl: string | null; badge: string | null; cancellationPolicy: string | null;
  addons: ApiAddon[];
}
export interface ApiProvider {
  id: number; userId: number; businessName: string; tagline: string | null; category: string; rating: number;
  completedJobs: number; experienceYears: number; responseTime: string | null; serviceArea: string | null;
  availability: string | null; verified: boolean; badge: string | null;
}
export interface ApiAddress {
  id: number; label: ApiAddressLabel; street: string; area: string; city: string; pincode: string; defaultAddress: boolean;
}
export interface ApiBookingAddon { addonId: number; name: string; priceAtBooking: number }
export interface ApiBooking {
  id: number; customerId: number; customerName: string; providerId: number; providerUserId: number; providerBusinessName: string;
  serviceId: number; serviceTitle: string; addressId: number; addressLabel: ApiAddressLabel;
  street: string; area: string; city: string; pincode: string; customerPhone: string | null; providerPhone: string | null;
  date: string; timeSlot: string; problemDescription: string | null;
  basePrice: number; addonsTotal: number; totalAmount: number; paymentMethod: string | null;
  status: ApiBookingStatus; otp: string; addons: ApiBookingAddon[];
  reviewed: boolean; ratingGiven: number | null; reviewGiven: string | null;
}
export interface ApiReview {
  id: number; bookingId: number; customerName: string; rating: number; comment: string | null; createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Chat                                                                 */
/* ------------------------------------------------------------------ */
export interface ApiChatMessage {
  id: number; senderId: number; senderName: string; receiverId: number; receiverName: string;
  content: string; createdAt: string; read: boolean; type?: string;
}
export interface ApiConversation {
  otherUserId: number; otherUserName: string; otherUserAvatarUrl: string | null; otherUserRole: ApiRole;
  otherUserPhone: string | null; lastMessage: string; lastMessageAt: string; lastMessageMine: boolean;
  unreadCount: number;
}

export interface BookingPayload {
  customerId: number; providerId: number; serviceId: number; addressId: number;
  date: string; timeSlot: string; problemDescription?: string; paymentMethod?: string; addonIds: number[];
}
export interface ProviderProfilePayload {
  businessName: string; tagline?: string; category: string; experienceYears: number;
  responseTime?: string; serviceArea?: string; availability?: string;
}
export interface AddressPayload {
  label: ApiAddressLabel; street: string; area: string; city: string; pincode: string; defaultAddress: boolean;
}

/* ------------------------------------------------------------------ */
/* Endpoints (one function per backend endpoint)                       */
/* ------------------------------------------------------------------ */
export const api = {
  // auth
  register: (b: { name: string; email: string; password: string; role: ApiRole }) => request<ApiUser>('POST', '/auth/register', b),
  login: (b: { email: string; password: string }) => request<ApiLoginResponse>('POST', '/auth/login', b),
  sendPhoneOtp: (phone: string) => request<ApiOtpSentResponse>('POST', '/auth/phone/send-otp', { phone }),
  verifyPhoneOtp: (b: { phone: string; otp: string; role?: ApiRole }) =>
    request<ApiLoginResponse>('POST', '/auth/phone/verify-otp', b),
  loginWithGoogle: (b: { idToken: string; role?: ApiRole }) => request<ApiLoginResponse>('POST', '/auth/google', b),

  // catalogue (public)
  getCategories: () => request<ApiCategory[]>('GET', '/categories'),
  getServices: (categoryId?: number) => request<ApiService[]>('GET', categoryId ? `/services?categoryId=${categoryId}` : '/services'),
  getService: (id: number) => request<ApiService>('GET', `/services/${id}`),

  // providers
  getProviders: (category?: string) => request<ApiProvider[]>('GET', category ? `/providers?category=${encodeURIComponent(category)}` : '/providers'),
  getProvider: (id: number) => request<ApiProvider>('GET', `/providers/${id}`),
  getMyProviderProfile: (userId: number) => request<ApiProvider>('GET', `/users/${userId}/provider-profile`),
  createProviderProfile: (userId: number, b: ProviderProfilePayload) => request<ApiProvider>('POST', `/users/${userId}/provider-profile`, b),

  // addresses
  getAddresses: (userId: number) => request<ApiAddress[]>('GET', `/users/${userId}/addresses`),
  createAddress: (userId: number, b: AddressPayload) => request<ApiAddress>('POST', `/users/${userId}/addresses`, b),
  deleteAddress: (userId: number, addressId: number) => request<void>('DELETE', `/users/${userId}/addresses/${addressId}`),

  // bookings
  createBooking: (b: BookingPayload) => request<ApiBooking>('POST', '/bookings', b),
  getCustomerBookings: (customerId: number) => request<ApiBooking[]>('GET', `/bookings/customer/${customerId}`),
  getProviderBookings: (providerId: number) => request<ApiBooking[]>('GET', `/bookings/provider/${providerId}`),
  acceptBooking: (id: number) => request<ApiBooking>('PATCH', `/bookings/${id}/accept`),
  declineBooking: (id: number) => request<ApiBooking>('PATCH', `/bookings/${id}/decline`),
  startBooking: (id: number, otp: string) => request<ApiBooking>('PATCH', `/bookings/${id}/start`, { otp }),
  completeBooking: (id: number) => request<ApiBooking>('PATCH', `/bookings/${id}/complete`),
  cancelBooking: (id: number) => request<ApiBooking>('PATCH', `/bookings/${id}/cancel`),

  // reviews
  submitReview: (b: { bookingId: number; rating: number; comment?: string }) => request<ApiReview>('POST', '/reviews', b),
  getProviderReviews: (providerId: number) => request<ApiReview[]>('GET', `/reviews/provider/${providerId}`),

  // chat (REST: conversation list + history + fallback send; real-time delivery is over the WebSocket, see lib/chat.ts)
  getConversations: () => request<ApiConversation[]>('GET', '/chat/conversations'),
  getUnreadChatCount: () => request<{ unreadCount: number }>('GET', '/chat/unread-count'),
  getMessages: (otherUserId: number) => request<ApiChatMessage[]>('GET', `/chat/conversations/${otherUserId}/messages`),
  sendChatMessage: (otherUserId: number, content: string) =>
    request<ApiChatMessage>('POST', `/chat/conversations/${otherUserId}/messages`, { content }),
  markConversationRead: (otherUserId: number) => request<void>('PATCH', `/chat/conversations/${otherUserId}/read`),
};
