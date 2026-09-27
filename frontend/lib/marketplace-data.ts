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
  price: number;
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
  rating: number;
  reviewsCount: number;
  distanceKm: number;
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

export const initialServices: ServiceItem[] = [
  {
    id: 'srv-ac-1',
    title: 'AC Comprehensive Deep Cleaning',
    category: 'AC Repair',
    categoryId: 'ac-repair',
    price: 499,
    rating: 4.85,
    reviewsCount: 1245,
    duration: '45-60 mins',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
    badge: 'Bestseller',
    description: 'High-pressure foam power-jet cleaning of indoor coils and outdoor unit. Restores cooling efficiency by up to 30% and reduces power consumption.',
    included: [
      'Indoor unit coil deep foam cleaning',
      'High-pressure water jet cleaning of filters & blower',
      'Outdoor unit inspection and water flush',
      'Drain tray & pipe unclogging',
      'Gas pressure level check & temperature test'
    ],
    excluded: [
      'Gas charging (can be added as addon)',
      'Spare parts replacement (charged at standard rate)'
    ],
    addons: [
      { id: 'add-1', name: 'Anti-Rust Coating for Coils', price: 299, description: 'Protective hydrophobic spray to prevent copper corrosion' },
      { id: 'add-2', name: 'Indoor Air Purifier Filter', price: 349, description: 'PM2.5 micro-allergen filtration mesh' },
      { id: 'add-3', name: 'R32/R410A Refrigerant Top-up', price: 1200, description: 'Full gas recharge with leak diagnosis' }
    ],
    faqs: [
      { question: 'How often should I get my AC serviced?', answer: 'We recommend servicing twice a year: once before summer starts and once mid-season for peak efficiency.' },
      { question: 'Will water spill on my walls or floor during jet cleaning?', answer: 'No, our technicians use a specialized waterproof catch jacket that funnels all runoff into a bucket.' },
      { question: 'Is there a warranty on this service?', answer: 'Yes, 30 days hassle-free Worksy service guarantee covers any leakage or cooling issues.' }
    ],
    cancellationPolicy: 'Free cancellation up to 2 hours before the scheduled slot. ₹100 visit fee applies thereafter.'
  },
  {
    id: 'srv-elec-1',
    title: 'Switchboard & Fan Installation / Repair',
    category: 'Electrician',
    categoryId: 'electrician',
    price: 199,
    rating: 4.9,
    reviewsCount: 890,
    duration: '30-45 mins',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=600',
    badge: 'Verified Pro',
    description: 'Diagnosis and repair of faulty sockets, MCB tripping, ceiling fan replacement, regulator fixing, or new modular switchboard installation.',
    included: [
      'Digital multimeter voltage & ground diagnosis',
      'Switch/socket replacement or connection tightening',
      'Ceiling fan hook fitting & speed regulator calibration',
      'Safety check on main electrical distribution board'
    ],
    addons: [
      { id: 'add-elec-1', name: 'Anchor Modular Switch (Pack of 2)', price: 150, description: 'Genuine 16A modular switch with indicator' },
      { id: 'add-elec-2', name: 'Heavy-Duty MCB 32A', price: 350, description: 'Overload and short circuit protection breaker' }
    ],
    faqs: [
      { question: 'Are materials included in the price?', answer: 'Inspection and labor are included. Any consumable replacement switches or wires are billed at standard MRP.' }
    ],
    cancellationPolicy: 'Free cancellation anytime before pro dispatches.'
  },
  {
    id: 'srv-clean-1',
    title: 'Full Home Deep Cleaning & Sanitization',
    category: 'Cleaning',
    categoryId: 'cleaning',
    price: 1499,
    rating: 4.88,
    reviewsCount: 2150,
    duration: '3-4 hours',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
    badge: 'Popular',
    description: 'Thorough top-to-bottom cleaning of bedrooms, living room, balconies, floor scrubbing with single-disc machine, and window degreasing.',
    included: [
      'Machine scrubbing of tiles & hardwood floors',
      'Cobweb removal, ceiling fans & light fixtures wiping',
      'Window panes, mesh tracks & grills steam cleaning',
      'Balcony washing & sanitization of high-touch points'
    ],
    addons: [
      { id: 'add-clean-1', name: 'Kitchen Chimney Degreasing', price: 499, description: 'Baffle filter soaking & interior grease removal' },
      { id: 'add-clean-2', name: '3-Seater Sofa Shampooing', price: 699, description: 'Wet vacuum extraction of dust mites and stains' }
    ],
    faqs: [
      { question: 'Do I need to supply cleaning liquids or machines?', answer: 'No! Our 2-person crew brings professional Taski chemicals, vacuums, and scrubbers.' }
    ],
    cancellationPolicy: 'Free cancellation up to 4 hours before the appointment.'
  },
  {
    id: 'srv-plumb-1',
    title: 'Tap, Pipe Leakage & Geyser Installation',
    category: 'Plumbing',
    categoryId: 'plumbing',
    price: 249,
    rating: 4.79,
    reviewsCount: 760,
    duration: '30-60 mins',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
    badge: 'Quick Fix',
    description: 'Fix dripping taps, internal wall pipe seepages, drain blockage removal, or install bathroom shower sets and instant water heaters.',
    included: [
      'Water pressure and joint seal inspection',
      'Teflon tape seal replacement and washer fitting',
      'Flush tank syphon adjustment and block clearance',
      'Leak test under full water mains pressure'
    ],
    addons: [
      { id: 'add-plumb-1', name: 'High-Pressure Braided Hose Pipe', price: 180, description: 'Stainless steel 24-inch inlet pipe' },
      { id: 'add-plumb-2', name: 'Brass Angle Cock Valve', price: 320, description: 'Heavy chrome plated quarter-turn shutoff valve' }
    ],
    faqs: [
      { question: 'Can the plumber fix concealed wall leakages?', answer: 'Yes, our certified plumbers have acoustic pipe detectors to locate concealed leaks with minimal tile damage.' }
    ],
    cancellationPolicy: 'Free cancellation up to 1 hour before scheduled time.'
  },
  {
    id: 'srv-app-1',
    title: 'Washing Machine Repair & Service',
    category: 'Appliance Repair',
    categoryId: 'appliances',
    price: 399,
    rating: 4.82,
    reviewsCount: 940,
    duration: '45 mins',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=600',
    badge: 'Certified',
    description: 'Complete inspection of front-load and top-load machines. Fix error codes, spin drum vibrations, water inlet failure, and motor issues.',
    included: [
      'Complete mechanical and electronic board diagnosis',
      'Drum bearing, belt tension, and suspension damper inspection',
      'Inlet solenoid valve and drain pump filter clean',
      'Test cycle run with vibration calibration'
    ],
    addons: [
      { id: 'add-app-1', name: 'Descaling & Tub Clean Treatment', price: 299, description: 'Removes limescale buildup and eliminates odors' }
    ],
    faqs: [
      { question: 'Do you cover all brands?', answer: 'Yes, our technicians are certified for LG, Samsung, Bosch, Whirlpool, IFB, and Godrej.' }
    ],
    cancellationPolicy: 'Free cancellation up to 2 hours prior.'
  },
  {
    id: 'srv-beauty-1',
    title: 'Salon at Home: Glow Facial & Waxing',
    category: 'Beauty & Salon',
    categoryId: 'beauty',
    price: 799,
    rating: 4.93,
    reviewsCount: 3400,
    duration: '60-90 mins',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=600',
    badge: 'Top Rated',
    description: 'Pampering salon experience in the comfort of your home with single-use sterile kits, organic facial creams, and painless roll-on waxing.',
    included: [
      'O3+ or Cheryls radiant brightening facial',
      'Gentle exfoliating steam and blackhead vacuum',
      'Full arms and half legs Rica peel waxing',
      'Relaxing 15-minute face, neck & shoulder acupressure massage'
    ],
    addons: [
      { id: 'add-b-1', name: 'Classic Pedicure with Foot Massage', price: 499, description: 'Cuticle trimming, heel filing, and foot soak' }
    ],
    faqs: [
      { question: 'Is hygiene guaranteed?', answer: '100%. Our beauticians wear masks, sanitize tools, and use disposable bedsheets and towels.' }
    ],
    cancellationPolicy: 'Free cancellation up to 3 hours before appointment.'
  }
];

export const initialProviders: Provider[] = [
  {
    id: 'pro-ravi',
    name: 'Ravi Electricals & AC Care',
    tagline: 'Licensed Master Electrician & HVAC Specialist',
    category: 'Electrical & AC Services',
    categoryId: 'electrician',
    rating: 4.86,
    reviewsCount: 348,
    distanceKm: 2.3,
    basePrice: 300,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
    verified: true,
    completedJobs: 412,
    experienceYears: 8,
    responseTime: 'Under 10 mins',
    serviceArea: 'Indiranagar, Domlur, Koramangala, HAL',
    availability: 'Available Today',
    badge: 'Super Pro',
    phone: '+91 98450 12345',
    servicesOffered: [
      { serviceId: 'srv-ac-1', title: 'AC Comprehensive Deep Cleaning', price: 499 },
      { serviceId: 'srv-elec-1', title: 'Switchboard & Fan Installation', price: 199 },
      { serviceId: 'srv-ac-gas', title: 'AC Gas Charging & Leak Fix', price: 1400 }
    ],
    portfolio: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400'
    ],
    reviews: [
      {
        id: 'rev-1',
        customerName: 'Priya Sharma',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
        rating: 5,
        date: '3 days ago',
        comment: 'Ravi was extremely punctual and carried all professional tools. My Daikin AC is cooling like brand new now. Very polite and cleaned up afterward!',
        service: 'AC Comprehensive Deep Cleaning',
        verified: true
      },
      {
        id: 'rev-2',
        customerName: 'Karthik Raman',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
        rating: 5,
        date: 'Last week',
        comment: 'Fixed a persistent short circuit tripping my entire 3BHK flat within 30 minutes. Transparent pricing with genuine parts.',
        service: 'Switchboard & Fan Installation',
        verified: true
      }
    ]
  },
  {
    id: 'pro-cleanpro',
    name: 'CleanPro Express Services',
    tagline: 'Eco-friendly Residential & Kitchen Deep Cleaning',
    category: 'Home Cleaning',
    categoryId: 'cleaning',
    rating: 4.91,
    reviewsCount: 520,
    distanceKm: 1.8,
    basePrice: 599,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    verified: true,
    completedJobs: 630,
    experienceYears: 6,
    responseTime: 'Under 15 mins',
    serviceArea: 'Indiranagar, Ulsoor, MG Road, HSR Layout',
    availability: 'Available Today',
    badge: 'Top Rated',
    phone: '+91 98860 98765',
    servicesOffered: [
      { serviceId: 'srv-clean-1', title: 'Full Home Deep Cleaning', price: 1499 },
      { serviceId: 'srv-sofa', title: 'Sofa & Carpet Wet Extraction', price: 699 }
    ],
    portfolio: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400'
    ],
    reviews: [
      {
        id: 'rev-3',
        customerName: 'Ananya Deshmukh',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        rating: 5,
        date: '2 days ago',
        comment: 'The team did magic to our kitchen tiles and chimney. Zero grease left behind. Highly recommended!',
        service: 'Full Home Deep Cleaning',
        verified: true
      }
    ]
  },
  {
    id: 'pro-voltedge',
    name: 'VoltEdge Smart Repairs',
    tagline: 'Appliance & Smart Home Electronics Expert',
    category: 'Appliance & Gadget Repair',
    categoryId: 'appliances',
    rating: 4.82,
    reviewsCount: 290,
    distanceKm: 3.4,
    basePrice: 350,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    coverImage: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=800',
    verified: true,
    completedJobs: 380,
    experienceYears: 7,
    responseTime: 'Within 20 mins',
    serviceArea: 'Koramangala, BTM, HSR Layout, Bellandur',
    availability: 'Slots at 4 PM',
    badge: 'Verified Pro',
    phone: '+91 97410 44556',
    servicesOffered: [
      { serviceId: 'srv-app-1', title: 'Washing Machine Repair', price: 399 },
      { serviceId: 'srv-fridge', title: 'Refrigerator Gas & Thermostat', price: 499 }
    ],
    portfolio: [
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&q=80&w=400'
    ],
    reviews: [
      {
        id: 'rev-4',
        customerName: 'Vikram Mehta',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
        rating: 5,
        date: '1 week ago',
        comment: 'Replaced my IFB washing machine drain pump on the spot. Great technical knowledge.',
        service: 'Washing Machine Repair',
        verified: true
      }
    ]
  },
  {
    id: 'pro-aqua',
    name: 'AquaFlow Plumbing Care',
    tagline: 'Sanitaryware, Pipe Relining & Motor Installations',
    category: 'Plumbing Solutions',
    categoryId: 'plumbing',
    rating: 4.78,
    reviewsCount: 215,
    distanceKm: 2.9,
    basePrice: 250,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250',
    coverImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    verified: true,
    completedJobs: 285,
    experienceYears: 5,
    responseTime: 'Under 15 mins',
    serviceArea: 'Indiranagar, Murphy Town, Cox Town',
    availability: 'Available Today',
    badge: 'Fast Responder',
    phone: '+91 99010 77889',
    servicesOffered: [
      { serviceId: 'srv-plumb-1', title: 'Tap, Pipe Leakage & Geyser', price: 249 }
    ],
    portfolio: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400'
    ],
    reviews: [
      {
        id: 'rev-5',
        customerName: 'Suresh N.',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150',
        rating: 4.8,
        date: '4 days ago',
        comment: 'Quick and clean geyser installation. Ensured no wall tile cracks.',
        service: 'Tap, Pipe Leakage & Geyser',
        verified: true
      }
    ]
  }
];

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
