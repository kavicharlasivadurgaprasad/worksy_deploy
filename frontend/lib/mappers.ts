/**
 * Adapters: backend DTO -> the shapes the existing UI components already consume.
 *
 * Rule: a field the backend does not provide is given a neutral value (0 / '' / []), never invented data.
 * Those gaps are listed in AUDIT_REPORT.md ("Fields the UI shows that the database does not store").
 */
import {
  ApiAddress, ApiBooking, ApiBookingStatus, ApiCategory, ApiNearbyProvider, ApiProvider, ApiProviderCustomer, ApiService,
  resolveAvatarUrl,
} from '@/lib/api';
import type {
  Address, Booking, Provider, ServiceCategory, ServiceItem,
} from '@/lib/marketplace-data';
import type { JobStatus, ProviderCustomer, ProviderJob } from '@/lib/provider-data';

const CATEGORY_IMAGES: Record<string, string> = {
  'AC Repair': '/images/category-ac.jpg',
  'Electrician': '/images/category-electrician.jpg',
  'Cleaning': '/images/category-cleaning.jpg',
  'Plumbing': '/images/category-plumbing.jpg',
  'Appliance Repair': '/images/category-appliance.jpg',
  'Beauty & Salon': '/images/category-beauty.jpg',
};
const PROVIDER_IMAGES: Record<string, string> = {
  'AC Repair': '/images/provider-ac.jpg',
  'Electrician': '/images/provider-electrician.jpg',
  'Cleaning': '/images/provider-cleaning.jpg',
  'Plumbing': '/images/provider-plumbing.jpg',
};
export const FALLBACK_IMAGE = '/images/category-cleaning.jpg';

export const categoryImage = (name: string) => CATEGORY_IMAGES[name] || FALLBACK_IMAGE;
const providerImage = (category: string) => PROVIDER_IMAGES[category] || CATEGORY_IMAGES[category] || FALLBACK_IMAGE;

export function mapCategory(c: ApiCategory, servicesCount: number): ServiceCategory {
  return { id: String(c.id), name: c.name, icon: c.icon, description: c.description ?? '', servicesCount };
}

export function mapService(s: ApiService): ServiceItem {
  return {
    id: String(s.id),
    title: s.title,
    category: s.categoryName,
    categoryId: String(s.categoryId),
    price: s.startingPrice != null ? Number(s.startingPrice) : 0,   // lowest provider price, NOT a payable price
    hasPrice: s.startingPrice != null,
    providerCount: s.providerCount ?? 0,
    rating: 0,          // not stored: services have no ratings in the schema
    reviewsCount: 0,    // not stored
    duration: s.duration,
    image: s.imageUrl || categoryImage(s.categoryName),
    badge: s.badge ?? undefined,
    description: s.description ?? '',
    included: [],       // not stored
    addons: s.addons.map((a) => ({ id: String(a.id), name: a.name, price: Number(a.price), description: a.description ?? '' })),
    faqs: [],           // not stored
    cancellationPolicy: s.cancellationPolicy ?? '',
  };
}

/**
 * A provider offers the services in their own category for which THEY have set a price
 * (provider_service_prices). Prices come from the backend; a service with no price is not offered.
 */
export function mapProvider(p: ApiProvider | ApiNearbyProvider, categories: ServiceCategory[], services: ServiceItem[]): Provider {
  const cat = categories.find((c) => c.name.toLowerCase() === p.category.toLowerCase());
  const offered = (p.services ?? []).map((o) => ({ serviceId: String(o.serviceId), title: o.title, price: Number(o.price) }));
  const img = providerImage(p.category);
  return {
    id: String(p.id),
    userId: String(p.userId),
    name: p.businessName,
    tagline: p.tagline ?? '',
    category: p.category,
    categoryId: cat ? cat.id : '',
    rating: p.rating ?? 0,                 // meaningful only when reviewsCount > 0
    reviewsCount: p.reviewCount ?? 0,      // real number of reviews
    // Only the nearby search knows a distance; the plain provider list has none (0 = unknown).
    distanceKm: 'distanceKm' in p ? p.distanceKm : 0,
    basePrice: p.startingPrice != null ? Number(p.startingPrice) : 0,   // 0 = no price set
    // The provider's own uploaded picture, or '' (the UI then shows the default avatar). The category
    // image is only the decorative cover, never presented as the provider's face.
    avatar: resolveAvatarUrl(p.avatarUrl) ?? '',
    coverImage: img,
    verified: p.verified,
    completedJobs: p.completedJobs,
    experienceYears: p.experienceYears,
    responseTime: p.responseTime ?? '',
    serviceArea: p.serviceArea ?? '',
    availability: p.availability ?? '',
    servicesOffered: offered,
    portfolio: [],
    reviews: [],
    phone: '',
    badge: p.badge ?? undefined,
  };
}

const ADDRESS_LABEL: Record<string, Address['label']> = { HOME: 'Home', OFFICE: 'Office', OTHER: 'Other' };
export const toApiLabel = (l: Address['label']) => l.toUpperCase() as 'HOME' | 'OFFICE' | 'OTHER';

export function mapAddress(a: ApiAddress): Address {
  return {
    id: String(a.id),
    label: ADDRESS_LABEL[a.label] || 'Other',
    street: a.street,
    area: a.area,
    city: a.city,
    pincode: a.pincode,
    state: a.state ?? undefined,
    isDefault: a.defaultAddress,
  };
}

/** yyyy-MM-dd (backend LocalDate) -> "Sat, 20 Sep 2026" for display */
export function displayDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

const CUSTOMER_STATUS: Record<ApiBookingStatus, { status: Booking['status']; step: Booking['trackingStep'] }> = {
  PENDING: { status: 'Upcoming', step: 1 },     // waiting for provider to accept
  CONFIRMED: { status: 'Upcoming', step: 2 },   // provider accepted
  IN_PROGRESS: { status: 'Ongoing', step: 4 },
  COMPLETED: { status: 'Completed', step: 5 },
  CANCELLED: { status: 'Cancelled', step: 1 },
};

const PAYMENT_METHODS: Booking['paymentMethod'][] = ['UPI', 'Card', 'Wallet', 'Cash on Service'];

function mapImages(b: ApiBooking) {
  return (b.images ?? []).map((i) => ({ id: String(i.id), fileName: i.fileName, sizeBytes: i.sizeBytes, url: i.url }));
}

export function mapBooking(b: ApiBooking, categoryOfService?: string): Booking {
  const m = CUSTOMER_STATUS[b.status];
  const method = PAYMENT_METHODS.find((x) => x === b.paymentMethod) || 'Cash on Service';
  return {
    id: String(b.id),
    serviceId: String(b.serviceId),
    serviceTitle: b.serviceTitle,
    category: categoryOfService || '',
    providerId: String(b.providerId),
    providerUserId: String(b.providerUserId),
    providerName: b.providerBusinessName,
    providerAvatar: resolveAvatarUrl(b.providerAvatarUrl) ?? '',
    providerPhone: b.providerPhone ?? '',
    date: displayDate(b.date),
    timeSlot: b.timeSlot,
    address: {
      id: String(b.addressId),
      label: ADDRESS_LABEL[b.addressLabel] || 'Other',
      street: b.street, area: b.area, city: b.city, pincode: b.pincode,
    },
    problemDescription: b.problemDescription ?? '',
    images: mapImages(b),
    addons: b.addons.map((a) => ({ id: String(a.addonId), name: a.name, price: Number(a.priceAtBooking) })),
    basePrice: Number(b.basePrice),
    addonsTotal: Number(b.addonsTotal),
    tax: 0,
    discount: 0,
    totalAmount: Number(b.totalAmount),
    paymentMethod: method,
    paymentStatus: b.status === 'CANCELLED' ? 'Refunded' : 'Pending', // no payment processing exists in the backend
    status: m.status,
    trackingStep: m.step,
    otp: b.otp ?? undefined,
    createdAt: displayDate(b.date),
    reviewed: b.reviewed,
    ratingGiven: b.ratingGiven ?? undefined,
    reviewGiven: b.reviewGiven ?? undefined,
  };
}

const JOB_STATUS: Record<ApiBookingStatus, JobStatus> = {
  PENDING: 'New Requests',
  CONFIRMED: 'Upcoming',
  IN_PROGRESS: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function mapJob(b: ApiBooking, categoryOfService?: string): ProviderJob {
  return {
    id: String(b.id),
    customerId: String(b.customerId),
    customerName: b.customerName,
    customerPhone: b.customerPhone ?? '',
    customerAvatar: resolveAvatarUrl(b.customerAvatarUrl) ?? '',
    serviceTitle: b.serviceTitle,
    category: categoryOfService || '',
    date: displayDate(b.date),
    dateISO: b.date,
    timeSlot: b.timeSlot,
    address: [b.street, b.area, b.city, b.pincode].filter(Boolean).join(', '),
    distanceKm: 0,   // not stored: no geo data
    estimatedEarnings: Number(b.totalAmount),
    customerNotes: b.problemDescription ?? '',
    images: mapImages(b),
    status: JOB_STATUS[b.status],
    finalAmount: b.status === 'COMPLETED' ? Number(b.totalAmount) : undefined,
    // Real completion day from the backend. Absent for bookings completed before it was recorded: never guessed.
    completedDateISO: b.status === 'COMPLETED' ? (b.completedDate ?? undefined) : undefined,
  };
}

import type { ApiReview } from '@/lib/api';
import type { ProviderReviewItem } from '@/lib/provider-data';

export function mapReview(r: ApiReview): ProviderReviewItem {
  return {
    id: String(r.id),
    customerName: r.customerName,
    customerAvatar: resolveAvatarUrl(r.customerAvatarUrl) ?? '',
    rating: r.rating,
    date: displayDate((r.createdAt || '').slice(0, 10)),
    serviceTitle: '',     // not returned by GET /reviews/provider/{id}
    comment: r.comment ?? '',
  };
}

const CUSTOMER_STATUS_LABEL: Record<ApiBookingStatus, string> = {
  PENDING: 'Awaiting your response',
  CONFIRMED: 'Upcoming',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

/** One real customer of the signed-in provider (GET /provider/customers). Nothing here is invented. */
export function mapProviderCustomer(c: ApiProviderCustomer): ProviderCustomer {
  return {
    id: String(c.customerId),
    name: c.name,
    avatar: resolveAvatarUrl(c.avatarUrl) ?? '',
    phone: c.phone ?? '',
    totalBookings: c.totalBookings,
    completedBookings: c.completedBookings,
    totalSpent: Number(c.totalSpent),
    lastBookingDate: displayDate(c.lastBookingDate),
    lastServiceTitle: c.lastServiceTitle,
    lastStatus: CUSTOMER_STATUS_LABEL[c.lastStatus] ?? c.lastStatus,
    lastLocation: c.lastLocation ?? '',
  };
}
