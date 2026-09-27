/**
 * Adapters: backend DTO -> the shapes the existing UI components already consume.
 *
 * Rule: a field the backend does not provide is given a neutral value (0 / '' / []), never invented data.
 * Those gaps are listed in AUDIT_REPORT.md ("Fields the UI shows that the database does not store").
 */
import {
  ApiAddress, ApiBooking, ApiBookingStatus, ApiCategory, ApiProvider, ApiService,
} from '@/lib/api';
import type {
  Address, Booking, Provider, ServiceCategory, ServiceItem,
} from '@/lib/marketplace-data';
import type { JobStatus, ProviderJob } from '@/lib/provider-data';

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
export const FALLBACK_AVATAR = '/images/user-charan.jpg';

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
    price: Number(s.price),
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
 * The schema has no provider<->service link, so a provider "offers" every service in their own category
 * (the same rule the backend enforces when a booking is created).
 */
export function mapProvider(p: ApiProvider, categories: ServiceCategory[], services: ServiceItem[]): Provider {
  const cat = categories.find((c) => c.name.toLowerCase() === p.category.toLowerCase());
  const offered = services.filter((s) => s.category.toLowerCase() === p.category.toLowerCase());
  const img = providerImage(p.category);
  return {
    id: String(p.id),
    userId: String(p.userId),
    name: p.businessName,
    tagline: p.tagline ?? '',
    category: p.category,
    categoryId: cat ? cat.id : '',
    rating: p.rating,
    reviewsCount: 0,    // not returned by /providers (see GET /reviews/provider/{id})
    distanceKm: 0,      // not stored: no geo data
    basePrice: offered.length ? Math.min(...offered.map((s) => s.price)) : 0,
    avatar: img,
    coverImage: img,
    verified: p.verified,
    completedJobs: p.completedJobs,
    experienceYears: p.experienceYears,
    responseTime: p.responseTime ?? '',
    serviceArea: p.serviceArea ?? '',
    availability: p.availability ?? '',
    servicesOffered: offered.map((s) => ({ serviceId: s.id, title: s.title, price: s.price })),
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
    providerAvatar: FALLBACK_IMAGE,
    providerPhone: b.providerPhone ?? '',
    date: displayDate(b.date),
    timeSlot: b.timeSlot,
    address: {
      id: String(b.addressId),
      label: ADDRESS_LABEL[b.addressLabel] || 'Other',
      street: b.street, area: b.area, city: b.city, pincode: b.pincode,
    },
    problemDescription: b.problemDescription ?? '',
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
    customerAvatar: FALLBACK_AVATAR,
    serviceTitle: b.serviceTitle,
    category: categoryOfService || '',
    date: displayDate(b.date),
    dateISO: b.date,
    timeSlot: b.timeSlot,
    address: [b.street, b.area, b.city, b.pincode].filter(Boolean).join(', '),
    distanceKm: 0,   // not stored: no geo data
    estimatedEarnings: Number(b.totalAmount),
    customerNotes: b.problemDescription ?? '',
    status: JOB_STATUS[b.status],
    finalAmount: b.status === 'COMPLETED' ? Number(b.totalAmount) : undefined,
  };
}

import type { ApiReview } from '@/lib/api';
import type { ProviderReviewItem } from '@/lib/provider-data';

export function mapReview(r: ApiReview): ProviderReviewItem {
  return {
    id: String(r.id),
    customerName: r.customerName,
    customerAvatar: FALLBACK_AVATAR,
    rating: r.rating,
    date: displayDate((r.createdAt || '').slice(0, 10)),
    serviceTitle: '',     // not returned by GET /reviews/provider/{id}
    comment: r.comment ?? '',
  };
}
