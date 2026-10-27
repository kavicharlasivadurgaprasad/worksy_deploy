export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  servicesCount: number;
  popular?: boolean;
}

export interface ServiceAddon {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  /** Lowest price any provider charges (0 when no provider has set one: check hasPrice). The payable price is the chosen provider's own, see Provider.servicesOffered. */
  price: number;
  hasPrice?: boolean;
  providerCount?: number;
  /** Services have no ratings in the schema: always 0 / 0, so the UI must not display them. */
  rating: number;
  reviewsCount: number;
  duration: string;
  image: string;
  badge?: string;
  description: string;
  included: string[];
  excluded?: string[];
  addons: ServiceAddon[];
  faqs: { question: string; answer: string }[];
  cancellationPolicy: string;
}

export interface ProviderReview {
  id: string;
  customerName: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  service: string;
  verified: boolean;
}

export interface Provider {
  id: string;
  /** The provider's underlying account (User) id - distinct from `id` (their provider-profile id). Used to open a chat with them. */
  userId?: string;
  name: string;
  tagline: string;
  category: string;
  categoryId: string;
  /** Average of real customer ratings. Only meaningful when reviewsCount > 0; otherwise show "No ratings yet". */
  rating: number;
  /** Number of real reviews behind `rating`. */
  reviewsCount: number;
  distanceKm: number;
  /** Lowest price this provider has set (0 = no price set yet). */
  basePrice: number;
  avatar: string;
  coverImage: string;
  verified: boolean;
  completedJobs: number;
  experienceYears: number;
  responseTime: string;
  serviceArea: string;
  availability: string;
  servicesOffered: { serviceId: string; title: string; price: number }[];
  portfolio: string[];
  reviews: ProviderReview[];
  phone: string;
  badge?: string;
}

export interface BookingImage {
  id: string;
  fileName: string;
  sizeBytes: number;
  /** API path under the base URL, e.g. /bookings/5/images/9 */
  url: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  category: string;
  providerId: string;
  /** The provider's underlying account (User) id - distinct from `providerId` (their provider-profile id). Used to open a chat with them. */
  providerUserId?: string;
  providerName: string;
  providerAvatar: string;
  providerPhone: string;
  date: string;
  timeSlot: string;
  address: {
    id: string;
    label: string;
    street: string;
    area: string;
    city: string;
    pincode: string;
  };
  problemDescription: string;
  addons: { id: string; name: string; price: number }[];
  /** Problem photos the customer attached (private; load via api.fetchImageBlob). */
  images?: BookingImage[];
  basePrice: number;
  addonsTotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Card' | 'Wallet' | 'Cash on Service';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  trackingStep: 1 | 2 | 3 | 4 | 5; // 1: Confirmed, 2: Assigned, 3: On the way, 4: Started, 5: Completed
  etaMinutes?: number;
  otp?: string;
  createdAt: string;
  reviewed?: boolean;
  ratingGiven?: number;
  reviewGiven?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'provider' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
}

export interface ChatThread {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  serviceTitle: string;
  bookingId?: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  online: boolean;
  messages: ChatMessage[];
}

export interface Address {
  id: string;
  label: 'Home' | 'Office' | 'Other';
  street: string;
  area: string;
  city: string;
  pincode: string;
  /** Optional: addresses saved before Edit Profile have no state. */
  state?: string;
  isDefault: boolean;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minBooking: number;
  description: string;
  category?: string;
  expiry: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'offer' | 'payment' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Initial Data
export const serviceCategories: ServiceCategory[] = [
  { id: 'ac-repair', name: 'AC Repair', icon: '❄️', description: 'Deep cleaning, gas refill, repair & installation', servicesCount: 14, popular: true },
  { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Switchboard, wiring, fans, lights & invertors', servicesCount: 22, popular: true },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹', description: 'Full home, kitchen, bathroom & sofa deep cleaning', servicesCount: 18, popular: true },
  { id: 'plumbing', name: 'Plumbing', icon: '🔧', description: 'Taps, leakage, pipe fittings, geyser & motors', servicesCount: 19, popular: true },
  { id: 'appliances', name: 'Appliance Repair', icon: '🧺', description: 'Washing machines, microwave, refrigerators & TV', servicesCount: 16, popular: true },
  { id: 'beauty', name: 'Beauty & Salon', icon: '💇', description: 'Salon at home, waxing, facials, haircut & spa', servicesCount: 25, popular: true },
  { id: 'car-repair', name: 'Car/Bike Service', icon: '🚗', description: 'Doorstep vehicle wash, battery check & servicing', servicesCount: 12 },
  { id: 'painting', name: 'Painting & Carpentry', icon: '🪵', description: 'Furniture repair, wall painting & drill work', servicesCount: 15 },
];

// Mock services/providers (with made-up ratings and prices) were removed: the UI loads real data from the API.

export const initialBookings: Booking[] = [
  {
    id: 'WRK-8921',
    serviceId: 'srv-ac-1',
    serviceTitle: 'AC Comprehensive Deep Cleaning',
    category: 'AC Repair',
    providerId: 'pro-ravi',
    providerName: 'Ravi Electricals & AC Care',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    providerPhone: '+91 98450 12345',
    date: 'Today, Sept 5',
    timeSlot: '4:00 PM - 5:00 PM',
    address: {
      id: 'addr-1',
      label: 'Home',
      street: '#42, 12th Main Road, 4th Cross',
      area: 'Indiranagar',
      city: 'Bangalore',
      pincode: '560038'
    },
    problemDescription: 'AC is not cooling properly and water is dripping from the indoor unit right corner.',
    addons: [
      { id: 'add-1', name: 'Anti-Rust Coating for Coils', price: 299 }
    ],
    basePrice: 499,
    addonsTotal: 299,
    tax: 72,
    discount: 100,
    totalAmount: 770,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Upcoming',
    trackingStep: 3, // On the way
    etaMinutes: 15,
    otp: '4829',
    createdAt: 'Today, 11:30 AM'
  },
  {
    id: 'WRK-7814',
    serviceId: 'srv-app-1',
    serviceTitle: 'Washing Machine Repair & Service',
    category: 'Appliance Repair',
    providerId: 'pro-voltedge',
    providerName: 'VoltEdge Smart Repairs',
    providerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    providerPhone: '+91 97410 44556',
    date: 'Tomorrow, Sept 6',
    timeSlot: '11:00 AM - 12:00 PM',
    address: {
      id: 'addr-1',
      label: 'Home',
      street: '#42, 12th Main Road, 4th Cross',
      area: 'Indiranagar',
      city: 'Bangalore',
      pincode: '560038'
    },
    problemDescription: 'Heavy vibration and screeching noise during spin cycle.',
    addons: [],
    basePrice: 399,
    addonsTotal: 0,
    tax: 40,
    discount: 0,
    totalAmount: 439,
    paymentMethod: 'Cash on Service',
    paymentStatus: 'Pending',
    status: 'Upcoming',
    trackingStep: 1, // Confirmed
    etaMinutes: 120,
    otp: '9134',
    createdAt: 'Yesterday, 6:15 PM'
  },
  {
    id: 'WRK-6430',
    serviceId: 'srv-clean-1',
    serviceTitle: 'Full Home Deep Cleaning & Sanitization',
    category: 'Cleaning',
    providerId: 'pro-cleanpro',
    providerName: 'CleanPro Express Services',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    providerPhone: '+91 98860 98765',
    date: 'Aug 28, 2026',
    timeSlot: '10:00 AM - 2:00 PM',
    address: {
      id: 'addr-1',
      label: 'Home',
      street: '#42, 12th Main Road, 4th Cross',
      area: 'Indiranagar',
      city: 'Bangalore',
      pincode: '560038'
    },
    problemDescription: 'Pre-festival thorough cleaning for 2BHK.',
    addons: [
      { id: 'add-clean-1', name: 'Kitchen Chimney Degreasing', price: 499 }
    ],
    basePrice: 1499,
    addonsTotal: 499,
    tax: 180,
    discount: 200,
    totalAmount: 1978,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Completed',
    trackingStep: 5,
    createdAt: 'Aug 26, 2026',
    reviewed: true,
    ratingGiven: 5,
    reviewGiven: 'Outstanding job! Kitchen and bathrooms look sparkling new.'
  },
  {
    id: 'WRK-5109',
    serviceId: 'srv-elec-1',
    serviceTitle: 'Switchboard & Fan Installation',
    category: 'Electrician',
    providerId: 'pro-ravi',
    providerName: 'Ravi Electricals & AC Care',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    providerPhone: '+91 98450 12345',
    date: 'Aug 14, 2026',
    timeSlot: '2:00 PM - 3:00 PM',
    address: {
      id: 'addr-2',
      label: 'Office',
      street: 'Tower B, Embassy TechVillage, Outer Ring Road',
      area: 'Bellandur',
      city: 'Bangalore',
      pincode: '560103'
    },
    problemDescription: 'Ceiling fan regulator replacement.',
    addons: [],
    basePrice: 199,
    addonsTotal: 0,
    tax: 20,
    discount: 0,
    totalAmount: 219,
    paymentMethod: 'UPI',
    paymentStatus: 'Refunded',
    status: 'Cancelled',
    trackingStep: 1,
    createdAt: 'Aug 14, 2026'
  }
];

export const initialChatThreads: ChatThread[] = [
  {
    id: 'chat-ravi',
    providerId: 'pro-ravi',
    providerName: 'Ravi Electricals & AC Care',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    serviceTitle: 'AC Comprehensive Deep Cleaning',
    bookingId: 'WRK-8921',
    lastMessage: 'Your technician will arrive at 4 PM. I am on the way now!',
    lastTimestamp: '3:45 PM',
    unreadCount: 1,
    online: true,
    messages: [
      {
        id: 'm1',
        sender: 'system',
        senderName: 'Worksy System',
        text: 'Booking #WRK-8921 confirmed for AC Deep Cleaning today at 4:00 PM.',
        timestamp: '11:30 AM'
      },
      {
        id: 'm2',
        sender: 'provider',
        senderName: 'Ravi',
        text: 'Hello Charan! Thank you for booking with Ravi Electricals. I have the power jet kit and eco foam bottles ready.',
        timestamp: '1:15 PM',
        status: 'read'
      },
      {
        id: 'm3',
        sender: 'customer',
        senderName: 'Charan',
        text: 'Great Ravi! Please make sure to check the water dripping issue on the right side of the split AC unit.',
        timestamp: '1:20 PM',
        status: 'read'
      },
      {
        id: 'm4',
        sender: 'provider',
        senderName: 'Ravi',
        text: 'Understood, that sounds like a drain tray blockage. I will flush it completely.',
        timestamp: '1:22 PM',
        status: 'read'
      },
      {
        id: 'm5',
        sender: 'provider',
        senderName: 'Ravi',
        text: 'Your technician will arrive at 4 PM. I am on the way now! ETA is 15 minutes.',
        timestamp: '3:45 PM',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'chat-cleanpro',
    providerId: 'pro-cleanpro',
    providerName: 'CleanPro Express',
    providerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    serviceTitle: 'Full Home Deep Cleaning',
    bookingId: 'WRK-6430',
    lastMessage: 'Thank you for booking with CleanPro! How was the service?',
    lastTimestamp: 'Aug 28',
    unreadCount: 0,
    online: false,
    messages: [
      {
        id: 'cp-1',
        sender: 'system',
        senderName: 'Worksy System',
        text: 'Booking #WRK-6430 marked as Completed.',
        timestamp: 'Aug 28, 2:10 PM'
      },
      {
        id: 'cp-2',
        sender: 'provider',
        senderName: 'CleanPro Support',
        text: 'Thank you for booking with CleanPro! We hope your home looks spotless. Let us know if you need any follow-up touch ups!',
        timestamp: 'Aug 28, 2:30 PM',
        status: 'read'
      },
      {
        id: 'cp-3',
        sender: 'customer',
        senderName: 'Charan',
        text: 'It was fantastic, left a 5-star review!',
        timestamp: 'Aug 28, 3:00 PM',
        status: 'read'
      }
    ]
  },
  {
    id: 'chat-support',
    providerId: 'pro-support',
    providerName: 'Worksy Customer Support',
    providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    serviceTitle: 'Help & Resolutions Desk',
    lastMessage: 'Hi Charan, how can we assist you today?',
    lastTimestamp: 'Aug 20',
    unreadCount: 0,
    online: true,
    messages: [
      {
        id: 'sup-1',
        sender: 'system',
        senderName: 'Worksy AI Bot',
        text: 'Welcome to Worksy Help & Support. We are available 24/7 for booking queries, payments, and cancellations.',
        timestamp: 'Aug 20, 10:00 AM'
      },
      {
        id: 'sup-2',
        sender: 'provider',
        senderName: 'Support Agent Ayesha',
        text: 'Hi Charan, how can we assist you today? Feel free to ask about any ongoing service or invoice.',
        timestamp: 'Aug 20, 10:01 AM',
        status: 'read'
      }
    ]
  }
];

export const initialAddresses: Address[] = [
  {
    id: 'addr-1',
    label: 'Home',
    street: '#42, 12th Main Road, 4th Cross',
    area: 'Indiranagar',
    city: 'Bangalore',
    pincode: '560038',
    isDefault: true
  },
  {
    id: 'addr-2',
    label: 'Office',
    street: 'Tower B, 4th Floor, Embassy TechVillage, Outer Ring Road',
    area: 'Bellandur',
    city: 'Bangalore',
    pincode: '560103',
    isDefault: false
  },
  {
    id: 'addr-3',
    label: 'Other',
    street: 'Plot 18, 7th Sector, HSR Layout',
    area: 'HSR Layout',
    city: 'Bangalore',
    pincode: '560102',
    isDefault: false
  }
];

export const activeCoupons: Coupon[] = [
  {
    code: 'CLEAN20',
    discountType: 'percentage',
    discountValue: 20,
    minBooking: 499,
    description: '20% OFF on all Cleaning & AC Services (up to ₹250)',
    expiry: 'Valid till Sept 15'
  },
  {
    code: 'FIRST100',
    discountType: 'flat',
    discountValue: 100,
    minBooking: 299,
    description: 'Flat ₹100 OFF on your next booking',
    expiry: 'Valid till Sept 30'
  },
  {
    code: 'SUMMERAC',
    discountType: 'flat',
    discountValue: 250,
    minBooking: 999,
    description: 'Flat ₹250 OFF on AC Repair & Gas Charging packages',
    category: 'ac-repair',
    expiry: 'Valid this weekend'
  },
  {
    code: 'FESTIVE50',
    discountType: 'percentage',
    discountValue: 15,
    minBooking: 799,
    description: '15% OFF on Salon & Home Painting services',
    expiry: 'Valid till Sept 20'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Ravi is on the way! 🛵',
    message: 'Your technician Ravi has left for your location. Estimated arrival in 15 mins.',
    type: 'booking',
    timestamp: '15 mins ago',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Payment Successful 💳',
    message: '₹770 paid via UPI for AC Deep Cleaning (#WRK-8921). Invoice is ready.',
    type: 'payment',
    timestamp: '4 hours ago',
    read: false
  },
  {
    id: 'notif-3',
    title: '🎁 You received a ₹100 coupon!',
    message: 'Use code FIRST100 to get ₹100 flat discount on your next home service.',
    type: 'offer',
    timestamp: 'Yesterday',
    read: true
  },
  {
    id: 'notif-4',
    title: 'Booking Confirmed ✓',
    message: 'Your slot for Washing Machine Repair on Sept 6, 11:00 AM is reserved with VoltEdge.',
    type: 'booking',
    timestamp: 'Yesterday',
    read: true
  }
];

export const popularLocations = [
  'Indiranagar, Bangalore',
  'Koramangala, Bangalore',
  'HSR Layout, Bangalore',
  'Whitefield, Bangalore',
  'Jayanagar, Bangalore',
  'Bandra West, Mumbai',
  'Andheri West, Mumbai',
  'Powai, Mumbai'
];
