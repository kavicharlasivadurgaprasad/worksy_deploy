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
  status: JobStatus;
  otp?: string;
  etaMinutes?: number;
  completedAt?: string;
  partsUsed?: { name: string; price: number }[];
  additionalWork?: string;
  finalAmount?: number;
  customerSignature?: string;
}

export interface ProviderCustomer {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  totalBookings: number;
  rating: number;
  lastServiceDate: string;
  totalSpent: number;
  notes: string;
  preferredSlot: string;
  address: string;
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

export interface ProviderOffer {
  id: string;
  title: string;
  discountPercentage: number;
  validUntil: string;
  maxBookings: number;
  usedBookings: number;
  applicableCategory: string;
  status: 'Active' | 'Expired' | 'Paused';
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

export const initialProviderJobs: ProviderJob[] = [
  {
    id: 'WK-28491',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98451 22334',
    customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'AC Comprehensive Deep Cleaning',
    category: 'AC Care',
    date: 'Today',
    timeSlot: '10:00 AM - 10:45 AM',
    address: 'Flat 402, Oakwood Manor, 12th Main Road, Indiranagar, Bengaluru',
    distanceKm: 2.4,
    estimatedEarnings: 499,
    customerNotes: 'AC is making unusual vibrating noise and cooling has slowed down.',
    specialRequirements: ['Bring high-pressure jet catch bag', 'Step ladder needed'],
    status: 'Upcoming',
    otp: '4821',
    etaMinutes: 12
  },
  {
    id: 'WK-28492',
    customerName: 'Priya Sundaram',
    customerPhone: '+91 98452 33445',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'Switchboard & Fan Installation',
    category: 'Electrical',
    date: 'Today',
    timeSlot: '01:30 PM - 02:15 PM',
    address: '#78, 4th Cross, Defence Colony, Indiranagar, Bengaluru',
    distanceKm: 4.1,
    estimatedEarnings: 799,
    customerNotes: 'Living room ceiling fan regulator sparking, needs Anchor modular replacement.',
    status: 'Upcoming',
    otp: '9312'
  },
  {
    id: 'WK-28493',
    customerName: 'Arjun Menon',
    customerPhone: '+91 98453 44556',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'Main Distribution MCB Tripping Fix',
    category: 'Electrical',
    date: 'Today',
    timeSlot: '04:00 PM - 04:45 PM',
    address: 'Villa 14, Palm Grove, Domlur, Bengaluru',
    distanceKm: 1.8,
    estimatedEarnings: 399,
    customerNotes: 'Heavy load appliances trip the 32A MCB breaker after 10 minutes.',
    status: 'Upcoming',
    otp: '6043'
  },
  // New Requests (Leads)
  {
    id: 'WK-28501',
    customerName: 'Anil Verma',
    customerPhone: '+91 98454 55667',
    customerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'Split AC Gas Charging & Leak Diagnosis',
    category: 'AC Care',
    date: 'Today',
    timeSlot: '05:00 PM - 06:00 PM',
    address: 'B-201, Sterling Terrace, 100 Feet Road, Indiranagar, Bengaluru',
    distanceKm: 3.2,
    estimatedEarnings: 1400,
    customerNotes: 'Daikin 1.5 Ton AC blowing normal ambient air. Gas pressure seems completely drained.',
    status: 'New Requests'
  },
  {
    id: 'WK-28502',
    customerName: 'Meera Rao',
    customerPhone: '+91 98455 66778',
    customerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'Emergency Inverter Wiring & Socket Fix',
    category: 'Electrical',
    date: 'Today',
    timeSlot: '06:30 PM - 07:15 PM',
    address: 'No 45, 1st Stage, HAL 2nd Stage, Bengaluru',
    distanceKm: 1.5,
    estimatedEarnings: 450,
    customerNotes: 'Inverter output socket burnt during power outage. Urgent replacement needed.',
    status: 'New Requests'
  },
  {
    id: 'WK-28503',
    customerName: 'Vikram Sethi',
    customerPhone: '+91 98456 77889',
    customerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'Outdoor AC Unit Water Flush & Relocation',
    category: 'AC Care',
    date: 'Tomorrow',
    timeSlot: '11:00 AM - 12:30 PM',
    address: 'Penthouse 5, Embassy Habitat, Domlur, Bengaluru',
    distanceKm: 2.8,
    estimatedEarnings: 1100,
    customerNotes: 'Outdoor condenser bracket vibrating loose on balcony wall.',
    status: 'New Requests'
  },
  // Ongoing
  {
    id: 'WK-28489',
    customerName: 'Kavita Krishnan',
    customerPhone: '+91 98457 88990',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'AC Coil Anti-Bacterial Foam Treatment',
    category: 'AC Care',
    date: 'Today',
    timeSlot: 'Ongoing Now',
    address: '#19, 12th A Main, HAL 2nd Stage, Bengaluru',
    distanceKm: 2.1,
    estimatedEarnings: 699,
    customerNotes: 'Bad odor coming from vents when AC starts.',
    status: 'Ongoing',
    otp: '5519',
    etaMinutes: 8
  },
  // Completed
  {
    id: 'WK-28470',
    customerName: 'Sanjay Dutt',
    customerPhone: '+91 98458 99001',
    customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'Ceiling Fan Hook Installation (Set of 3)',
    category: 'Electrical',
    date: 'Yesterday',
    timeSlot: '03:00 PM',
    address: 'Koramangala 4th Block, Bengaluru',
    distanceKm: 3.5,
    estimatedEarnings: 599,
    finalAmount: 749,
    partsUsed: [{ name: 'Heavy Duty Anchor Fasteners', price: 150 }],
    completedAt: 'Yesterday at 4:10 PM',
    customerNotes: 'Flawless job, clean wiring.',
    status: 'Completed'
  },
  {
    id: 'WK-28465',
    customerName: 'Deepa Nair',
    customerPhone: '+91 98459 00112',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'AC PCB Board Capacitor Replacement',
    category: 'AC Care',
    date: 'Sep 3, 2026',
    timeSlot: '11:00 AM',
    address: 'Ulsoor Road, Bengaluru',
    distanceKm: 4.8,
    estimatedEarnings: 850,
    finalAmount: 1150,
    partsUsed: [{ name: 'Dual Run 45+5 uF Capacitor', price: 300 }],
    completedAt: 'Sep 3 at 12:05 PM',
    customerNotes: 'AC compressor was humming without turning on. Repaired on spot.',
    status: 'Completed'
  },
  // Cancelled
  {
    id: 'WK-28440',
    customerName: 'Manish Pandey',
    customerPhone: '+91 98460 11223',
    customerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'Geyser Heating Element Replacement',
    category: 'Electrical',
    date: 'Sep 1, 2026',
    timeSlot: '02:00 PM',
    address: 'HSR Layout Sector 2, Bengaluru',
    distanceKm: 6.2,
    estimatedEarnings: 400,
    customerNotes: 'Customer had to travel urgently for emergency.',
    status: 'Cancelled'
  },
  // Plumbing Jobs
  {
    id: 'WK-28510',
    customerName: 'Suresh Kumar',
    customerPhone: '+91 98461 22334',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'Kitchen Sink Tap & Drain Leakage Repair',
    category: 'Plumbing',
    date: 'Today',
    timeSlot: '03:00 PM - 03:45 PM',
    address: 'B-404, Prestige Ozone, Whitefield, Bengaluru',
    distanceKm: 5.1,
    estimatedEarnings: 349,
    customerNotes: 'Under-sink siphon pipe joint is leaking heavily onto modular kitchen floor.',
    status: 'New Requests'
  },
  {
    id: 'WK-28513',
    customerName: 'Karthik Rao',
    customerPhone: '+91 98462 33445',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'Concealed Bathroom Pipe Seepage Fix',
    category: 'Plumbing',
    date: 'Today',
    timeSlot: '05:30 PM - 06:30 PM',
    address: '#12, 5th Cross, Indiranagar, Bengaluru',
    distanceKm: 2.2,
    estimatedEarnings: 699,
    customerNotes: 'Master bathroom shower wall showing dampness and tile grout cracks.',
    status: 'Upcoming',
    otp: '7823'
  },
  // Cleaning Jobs
  {
    id: 'WK-28511',
    customerName: 'Ananya Deshmukh',
    customerPhone: '+91 98463 44556',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    serviceTitle: '3-BHK Full Deep Cleaning & Sanitization',
    category: 'Cleaning',
    date: 'Tomorrow',
    timeSlot: '09:00 AM - 01:00 PM',
    address: 'Flat 602, Ferns Paradise, Outer Ring Road, Bengaluru',
    distanceKm: 4.6,
    estimatedEarnings: 1899,
    customerNotes: 'Move-in deep cleaning including kitchen degreasing and balcony scrub.',
    status: 'New Requests'
  },
  {
    id: 'WK-28514',
    customerName: 'Tanvi Shah',
    customerPhone: '+91 98464 55667',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'Sofa & Fabric Upholstery Shampooing',
    category: 'Cleaning',
    date: 'Sep 2, 2026',
    timeSlot: '04:00 PM',
    address: 'Koramangala 3rd Block, Bengaluru',
    distanceKm: 3.8,
    estimatedEarnings: 699,
    finalAmount: 799,
    completedAt: 'Sep 2 at 5:15 PM',
    customerNotes: '5-seater fabric sofa cleaned with hot extraction.',
    status: 'Completed'
  },
  // Appliance Repair Jobs
  {
    id: 'WK-28512',
    customerName: 'Rohan Mehta',
    customerPhone: '+91 98465 66778',
    customerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
    serviceTitle: 'Front-Load Washing Machine Drum Balancing',
    category: 'Appliance Repair',
    date: 'Tomorrow',
    timeSlot: '02:00 PM - 03:00 PM',
    address: 'Sobha Iris, Devarabisanahalli, Bengaluru',
    distanceKm: 6.0,
    estimatedEarnings: 550,
    customerNotes: 'Bosch washing machine vibrating intensely on 1200 RPM spin cycle.',
    status: 'New Requests'
  }
];

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

export const initialCustomers: ProviderCustomer[] = [
  {
    id: 'cust-1',
    name: 'Rahul Sharma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    phone: '+91 98451 22334',
    email: 'rahul.s@email.com',
    totalBookings: 8,
    rating: 4.9,
    lastServiceDate: 'Aug 28, 2026',
    totalSpent: 3840,
    notes: 'Prefers morning appointments before 11 AM. Has a friendly Golden Retriever.',
    preferredSlot: 'Morning (10:00 AM)',
    address: 'Indiranagar 12th Main Road, Bengaluru'
  },
  {
    id: 'cust-2',
    name: 'Priya Sundaram',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    phone: '+91 98452 33445',
    email: 'priya.sundaram@email.com',
    totalBookings: 5,
    rating: 5.0,
    lastServiceDate: 'Aug 19, 2026',
    totalSpent: 4200,
    notes: 'Very meticulous about shoe covers and keeping balcony floor dry.',
    preferredSlot: 'Afternoon (01:30 PM)',
    address: 'Defence Colony, Indiranagar, Bengaluru'
  },
  {
    id: 'cust-3',
    name: 'Arjun Menon',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    phone: '+91 98453 44556',
    email: 'arjun.menon@email.com',
    totalBookings: 3,
    rating: 4.8,
    lastServiceDate: 'Sep 2, 2026',
    totalSpent: 1450,
    notes: 'Always pays instantly via UPI. Works remotely from home office.',
    preferredSlot: 'Late Afternoon (04:00 PM)',
    address: 'Palm Grove, Domlur, Bengaluru'
  },
  {
    id: 'cust-4',
    name: 'Kavita Krishnan',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    phone: '+91 98457 88990',
    email: 'kavita.k@email.com',
    totalBookings: 4,
    rating: 5.0,
    lastServiceDate: 'Sep 4, 2026',
    totalSpent: 2600,
    notes: 'Requests invoice copy via WhatsApp immediately after service.',
    preferredSlot: 'Anytime',
    address: 'HAL 2nd Stage, Bengaluru'
  }
];

export const initialOffers: ProviderOffer[] = [
  {
    id: 'off-1',
    title: 'Monsoon AC Pre-Winter Checkup',
    discountPercentage: 20,
    validUntil: '30 Sep 2026',
    maxBookings: 50,
    usedBookings: 38,
    applicableCategory: 'AC Care',
    status: 'Active'
  },
  {
    id: 'off-2',
    title: 'First-Time Electrical Inspection',
    discountPercentage: 15,
    validUntil: '15 Oct 2026',
    maxBookings: 30,
    usedBookings: 12,
    applicableCategory: 'Electrical',
    status: 'Active'
  }
];

export const initialNotifications: ProviderNotification[] = [
  {
    id: 'notif-1',
    type: 'lead',
    title: 'New Service Request',
    message: 'Anil Verma requested AC Gas Charging for Today at 5:00 PM (3.2 km away).',
    timestamp: '5 mins ago',
    read: false,
    jobId: 'WK-28501'
  },
  {
    id: 'notif-2',
    type: 'payment',
    title: 'Payment Received: ₹749',
    message: 'Sanjay Dutt completed UPI payment for Job #WK-28470.',
    timestamp: '1 hour ago',
    read: false,
    jobId: 'WK-28470'
  },
  {
    id: 'notif-3',
    type: 'review',
    title: 'New 5-Star Review Received ⭐',
    message: 'Priya Sharma left a 5-star review: "Ravi was extremely punctual and carried all professional tools..."',
    timestamp: '3 hours ago',
    read: true
  },
  {
    id: 'notif-4',
    type: 'reminder',
    title: 'Upcoming Job Reminder',
    message: 'Job #WK-28491 with Rahul Sharma starts in 45 minutes.',
    timestamp: 'Yesterday',
    read: true,
    jobId: 'WK-28491'
  }
];

// Aliases for compatibility
export type JobItem = ProviderJob;
export const mockJobs = initialProviderJobs;
export const mockCustomerCrm = initialCustomers;
export const mockProviderOffers = initialOffers;
export const mockNotifications = initialNotifications;
