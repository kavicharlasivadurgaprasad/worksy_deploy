export type JobStatus = 'New Requests' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface ProviderJob {
  id: string;
  /** The customer's account (User) id, used to open a chat with them. */
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  serviceTitle: string;
  category: string;
  date: string;
  /** Raw yyyy-MM-dd booking date (backend LocalDate), for real date-based calculations. */
  dateISO?: string;
  timeSlot: string;
  address: string;
  distanceKm: number;
  estimatedEarnings: number;
  customerNotes: string;
  specialRequirements?: string[];
  photos?: string[];
  /** Problem photos attached by the customer (private; load via api.fetchImageBlob). */
  images?: { id: string; fileName: string; sizeBytes: number; url: string }[];
  status: JobStatus;
  otp?: string;
  etaMinutes?: number;
  completedAt?: string;
  /** yyyy-MM-dd the backend recorded as the completion day. Undefined when not completed or not recorded. */
  completedDateISO?: string;
  partsUsed?: { name: string; price: number }[];
  additionalWork?: string;
  finalAmount?: number;
  customerSignature?: string;
}

/** A real customer of the signed-in provider, built by the backend from that provider's own bookings. */
export interface ProviderCustomer {
  /** The customer's account (User) id; also used to open a chat with them. */
  id: string;
  name: string;
  /** Resolved picture URL, or '' when the customer has not uploaded one (the UI shows the default avatar). */
  avatar: string;
  phone: string;
  /** Non-cancelled bookings with this provider. */
  totalBookings: number;
  completedBookings: number;
  /** Total of this customer's COMPLETED bookings with this provider. */
  totalSpent: number;
  lastBookingDate: string;
  lastServiceTitle: string;
  lastStatus: string;
  /** "Area, City" of the latest booking, or ''. */
  lastLocation: string;
}

export interface ProviderTransaction {
  id: string;
  date: string;
  jobId: string;
  serviceTitle: string;
  customerName: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  type: 'credit' | 'payout' | 'bonus';
  status: 'Completed' | 'Processing';
}

export interface ProviderReviewItem {
  id: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  date: string;
  serviceTitle: string;
  comment: string;
  reply?: string;
  repliedAt?: string;
}

export interface ProviderNotification {
  id: string;
  type: 'lead' | 'booking' | 'payment' | 'review' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  jobId?: string;
}

export interface WorkingHoursDay {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export const MARKETPLACE_SKILLS: string[] = [
  'AC Care',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Appliance Repair',
  'Painting & Carpentry'
];

export const DEFAULT_PROVIDER_SKILLS: string[] = ['AC Care', 'Electrical'];

export function matchesProviderSkills(jobCategory: string, skills: string[]): boolean {
  if (!skills || skills.length === 0) return true;
  return skills.some((skill) => {
    const s = skill.toLowerCase().trim();
    const c = jobCategory.toLowerCase().trim();
    return s === c || c.includes(s) || s.includes(c);
  });
}

export const initialWorkingHours: WorkingHoursDay[] = [
  { day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '16:00' },
  { day: 'Sunday', isOpen: false, openTime: 'Closed', closeTime: 'Closed' }
];

export type JobItem = ProviderJob;
