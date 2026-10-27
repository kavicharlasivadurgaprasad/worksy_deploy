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
  // FormData: never set Content-Type ourselves - the browser must add multipart/form-data with its boundary.
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
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

async function requestBlob(path: string): Promise<Blob> {
  const headers: Record<string, string> = {};
  const token = tokenStore.get();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { headers });
  } catch {
    throw new ApiError(0, 'Cannot reach the server.');
  }
  if (!res.ok) throw new ApiError(res.status, `Could not load image (${res.status})`);
  return res.blob();
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
  id: number; categoryId: number; categoryName: string; title: string; duration: string;
  /** Lowest price any provider charges for this service; null = no provider has set a price yet. Not a payable price. */
  startingPrice: number | null; providerCount: number;
  description: string | null; imageUrl: string | null; badge: string | null; cancellationPolicy: string | null;
  addons: ApiAddon[];
}
/** A service a provider has priced: this is the price customers see and are charged for that provider. */
export interface ApiProviderOffer { serviceId: number; title: string; duration: string; price: number }
/** One row of the provider's own "Manage Services and Prices" list. price is null until the provider sets it. */
export interface ApiProviderServicePrice {
  serviceId: number; title: string; categoryName: string; duration: string; description: string | null;
  price: number | null; priceSet: boolean; updatedAt: string | null;
}
/** Private dashboard numbers of the signed-in provider, derived by the backend from their bookings and reviews. */
export interface ApiProviderSummary {
  completedJobs: number; reviewCount: number; averageRating: number | null;
  grossEarnings: number; commissionRate: number; platformFee: number; netEarnings: number;
}
export interface ApiProvider {
  id: number; userId: number; businessName: string; tagline: string | null; category: string;
  /** The provider's saved profile picture (path relative to the API base) or null. Use resolveAvatarUrl(). */
  avatarUrl?: string | null;
  /** Average of real customer ratings; null = no ratings yet (never a default value). */
  rating: number | null; reviewCount: number;
  /** Prices this provider has set (empty = none set) and the lowest of them (null = none set). */
  services: ApiProviderOffer[]; startingPrice: number | null;
  completedJobs: number; experienceYears: number; responseTime: string | null; serviceArea: string | null;
  availability: string | null; verified: boolean; badge: string | null;
  /** Longer "about the business" text (Edit Profile). */
  description?: string | null;
  /** Nearby-search fields. Coordinates are never sent to the client, only whether a location is set. */
  acceptingBookings?: boolean; serviceRadiusKm?: number | null; locationSet?: boolean;
}
/** One result of GET /providers/nearby: a provider card plus its distance from the search location. */
export interface ApiNearbyProvider extends ApiProvider { distanceKm: number }
export interface NearbyQuery {
  latitude: number; longitude: number; radiusKm?: number; category: string;
  /** Optional, both or neither: leaves out providers already booked at that date (yyyy-MM-dd) and slot. */
  date?: string; timeSlot?: string;
}
export interface ProviderLocationPayload {
  latitude?: number; longitude?: number; serviceRadiusKm?: number; acceptingBookings?: boolean;
  /** Readable service area that matches the coordinates, e.g. "Madanapalle, Andhra Pradesh". */
  serviceArea?: string;
}
/** One place from GET /geocode/search. Coordinates come from OpenStreetMap via the backend, never guessed. */
export interface ApiGeocodeResult {
  id: string; label: string; displayName: string; latitude: number; longitude: number; type: string;
}
export interface ApiAddress {
  id: number; label: ApiAddressLabel; street: string; area: string; city: string; pincode: string; defaultAddress: boolean;
  /** Added by Edit Profile; addresses saved before that have no state. */
  state?: string | null;
}
/** GET/PUT /profile/me. Customers get `address`, providers get `provider`. Never contains secrets. */
export interface ApiProfile {
  id: number; role: ApiRole; name: string; email: string | null; phone: string | null; phoneVerified: boolean;
  /** Path relative to the API base (e.g. /users/7/avatar?v=1) or null. Use resolveAvatarUrl() before putting it in <img src>. */
  avatarUrl: string | null;
  address: ApiAddress | null;
  provider: ApiProvider | null;
}
/**
 * PUT /profile/me body. For text fields: omitted = unchanged, '' = clear. A changed `phone` needs the
 * `phoneOtp` sent to that new number. There is no id / role / email here on purpose.
 */
export interface UpdateProfilePayload {
  name: string;
  phone?: string;
  phoneOtp?: string;
  address?: { street: string; area: string; city: string; state?: string; pincode: string };
  provider?: {
    businessName: string; tagline?: string; description?: string; category?: string;
    experienceYears: number; responseTime?: string; serviceArea?: string;
  };
}

/** Turns the backend's API-relative avatar path into a URL an <img> can load. Absolute URLs pass through. */
export function resolveAvatarUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export interface ApiBookingAddon { addonId: number; name: string; priceAtBooking: number }
export interface ApiBookingImage {
  id: number; fileName: string; contentType: string; sizeBytes: number;
  /** Path under the API base (e.g. /bookings/5/images/9). Private: fetch it with the JWT, see api.fetchImageBlob. */
  url: string;
}
export interface ApiBooking {
  id: number; customerId: number; customerName: string; providerId: number; providerUserId: number; providerBusinessName: string;
  /** Saved profile pictures of both parties (path relative to the API base) or null. Use resolveAvatarUrl(). */
  customerAvatarUrl?: string | null; providerAvatarUrl?: string | null;
  serviceId: number; serviceTitle: string; addressId: number; addressLabel: ApiAddressLabel;
  street: string; area: string; city: string; pincode: string; customerPhone: string | null; providerPhone: string | null;
  date: string; timeSlot: string; problemDescription: string | null;
  basePrice: number; addonsTotal: number; totalAmount: number; paymentMethod: string | null;
  status: ApiBookingStatus; otp: string; addons: ApiBookingAddon[]; images?: ApiBookingImage[];
  /** When the booking was marked COMPLETED (ISO instant) and that calendar day (yyyy-MM-dd, app time zone). null if not completed or completed before this was recorded. */
  completedAt?: string | null; completedDate?: string | null;
  reviewed: boolean; ratingGiven: number | null; reviewGiven: string | null;
}
export interface ApiReview {
  id: number; bookingId: number; customerName: string; customerAvatarUrl?: string | null;
  rating: number; comment: string | null; createdAt: string;
}
/** One row of GET /provider/customers: a customer with a real, non-cancelled booking with the signed-in provider. */
export interface ApiProviderCustomer {
  customerId: number; name: string; avatarUrl: string | null; phone: string | null;
  totalBookings: number; completedBookings: number; totalSpent: number;
  /** yyyy-MM-dd of the most recent non-cancelled booking, its service title, status and "Area, City". */
  lastBookingDate: string; lastServiceTitle: string; lastStatus: ApiBookingStatus; lastLocation: string | null;
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
  /** Optional prices (₹) entered during onboarding, saved atomically with the profile. */
  servicePrices?: { serviceId: number; price: number }[];
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
  forgotPassword: (email: string) => request<{ message: string }>('POST', '/auth/forgot-password', { email }),

  // catalogue (public)
  getCategories: () => request<ApiCategory[]>('GET', '/categories'),
  getServices: (categoryId?: number) => request<ApiService[]>('GET', categoryId ? `/services?categoryId=${categoryId}` : '/services'),
  getService: (id: number) => request<ApiService>('GET', `/services/${id}`),

  // providers
  getProviders: (category?: string) => request<ApiProvider[]>('GET', category ? `/providers?category=${encodeURIComponent(category)}` : '/providers'),
  getProvider: (id: number) => request<ApiProvider>('GET', `/providers/${id}`),
  /** Public: the services one provider has priced, with that provider's own prices. */
  getProviderOffers: (providerId: number) => request<ApiProviderOffer[]>('GET', `/providers/${providerId}/services`),
  /** Provider only: every service in my category with my price for it (null = not set). */
  getMyServicePrices: (userId: number) =>
    request<ApiProviderServicePrice[]>('GET', `/users/${userId}/provider-profile/services`),
  /** Provider only: set / update my price for one service. The backend validates the amount. */
  setMyServicePrice: (userId: number, serviceId: number, price: number) =>
    request<ApiProviderServicePrice>('PUT', `/users/${userId}/provider-profile/services/${serviceId}/price`, { price }),
  /** Provider only: save several prices in one all-or-nothing request. Services not listed are untouched. */
  setMyServicePrices: (userId: number, prices: { serviceId: number; price: number }[]) =>
    request<ApiProviderServicePrice[]>('PUT', `/users/${userId}/provider-profile/services/prices`, { prices }),
  /** Provider only: remove my price for one service (back to "Price not set"). */
  clearMyServicePrice: (userId: number, serviceId: number) =>
    request<ApiProviderServicePrice>('DELETE', `/users/${userId}/provider-profile/services/${serviceId}/price`),
  /** Available providers near a location for one category, nearest first. Requires the JWT. */
  getNearbyProviders: (q: NearbyQuery) => {
    const params = new URLSearchParams({
      latitude: String(q.latitude), longitude: String(q.longitude), category: q.category,
    });
    if (q.radiusKm !== undefined) params.set('radiusKm', String(q.radiusKm));
    if (q.date && q.timeSlot) { params.set('date', q.date); params.set('timeSlot', q.timeSlot); }
    return request<ApiNearbyProvider[]>('GET', `/providers/nearby?${params.toString()}`);
  },
  /** A provider sets their own location / radius / availability (owner only). */
  updateProviderLocation: (userId: number, b: ProviderLocationPayload) =>
    request<ApiProvider>('PUT', `/users/${userId}/provider-profile/location`, b),
  getMyProviderProfile: (userId: number) => request<ApiProvider>('GET', `/users/${userId}/provider-profile`),
  createProviderProfile: (userId: number, b: ProviderProfilePayload) => request<ApiProvider>('POST', `/users/${userId}/provider-profile`, b),

  // Edit Profile (the signed-in user only: the backend takes the user from the JWT, never from an id we send)
  getMyProfile: () => request<ApiProfile>('GET', '/profile/me'),
  updateMyProfile: (b: UpdateProfilePayload) => request<ApiProfile>('PUT', '/profile/me', b),
  /** multipart, one part named "image" (JPEG / PNG / WEBP, max 2 MB). */
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('image', file, file.name);
    return request<ApiProfile>('POST', '/profile/me/avatar', form);
  },
  removeAvatar: () => request<ApiProfile>('DELETE', '/profile/me/avatar'),

  // location search (typed city / locality / address / PIN code -> verified coordinates; requires the JWT)
  geocodeSearch: (q: string) => request<ApiGeocodeResult[]>('GET', `/geocode/search?q=${encodeURIComponent(q)}`),

  // addresses
  getAddresses: (userId: number) => request<ApiAddress[]>('GET', `/users/${userId}/addresses`),
  createAddress: (userId: number, b: AddressPayload) => request<ApiAddress>('POST', `/users/${userId}/addresses`, b),
  deleteAddress: (userId: number, addressId: number) => request<void>('DELETE', `/users/${userId}/addresses/${addressId}`),

  // bookings
  /** No photos -> the original JSON request. With photos -> multipart: part "booking" (JSON) + repeated part "images". */
  createBooking: (b: BookingPayload, images: File[] = []) => {
    if (images.length === 0) return request<ApiBooking>('POST', '/bookings', b);
    const form = new FormData();
    form.append('booking', new Blob([JSON.stringify(b)], { type: 'application/json' }));
    images.forEach((file) => form.append('images', file, file.name));
    return request<ApiBooking>('POST', '/bookings', form);
  },
  /** Booking photos are private (JWT-protected), so <img src> cannot load them directly: fetch the bytes with the token. */
  fetchImageBlob: (path: string) => requestBlob(path),
  getCustomerBookings: (customerId: number) => request<ApiBooking[]>('GET', `/bookings/customer/${customerId}`),
  getProviderBookings: (providerId: number) => request<ApiBooking[]>('GET', `/bookings/provider/${providerId}`),
  /** Provider only: my real customers (people with a non-cancelled booking with me). The backend takes the provider from the JWT. */
  getMyCustomers: () => request<ApiProviderCustomer[]>('GET', '/provider/customers'),
  /** Provider only: completed jobs, rating, review count and earnings, calculated by the backend. */
  getProviderSummary: (providerId: number) => request<ApiProviderSummary>('GET', `/bookings/provider/${providerId}/summary`),
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
