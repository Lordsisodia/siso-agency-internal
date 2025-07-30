export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: PortfolioCategory;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'live' | 'demo' | 'custom' | 'coming-soon';
  features: string[];
  technologies: string[];
  liveUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  clientTestimonial?: {
    quote: string;
    author: string;
    company: string;
  };
  metrics?: {
    label: string;
    value: string;
  }[];
}

export type PortfolioCategory = 
  | 'events' 
  | 'restaurant' 
  | 'beauty' 
  | 'fintech' 
  | 'real-estate'
  | 'client-work';

export const portfolioItems: PortfolioItem[] = [
  {
    id: 'majorca-events',
    title: 'Event Management Majorca',
    description: 'Complete event booking and management system for Majorca activities and experiences',
    category: 'events',
    priceRange: {
      min: 2500,
      max: 5000,
      currency: '€'
    },
    status: 'live',
    features: [
      'Multi-language support (EN/ES/DE)',
      'Real-time booking system',
      'Payment integration (Stripe/PayPal)',
      'Admin dashboard',
      'Email automation',
      'Mobile responsive design'
    ],
    technologies: ['React', 'TypeScript', 'Supabase', 'Stripe', 'Tailwind CSS'],
    liveUrl: 'https://majorca-events.com',
    demoUrl: 'https://demo.majorca-events.com',
    imageUrl: '/images/portfolio/majorca-events.png',
    clientTestimonial: {
      quote: "Increased our bookings by 300% in the first month. The system is intuitive and powerful.",
      author: "Maria Rodriguez",
      company: "Majorca Adventures"
    },
    metrics: [
      { label: 'Bookings Increase', value: '+300%' },
      { label: 'Load Time', value: '<2s' },
      { label: 'Mobile Users', value: '65%' }
    ]
  },
  {
    id: 'restaurant-system',
    title: 'Restaurant Management System',
    description: 'Full-featured restaurant management with menu, reservations, and POS integration',
    category: 'restaurant',
    priceRange: {
      min: 1500,
      max: 3500,
      currency: '€'
    },
    status: 'live',
    features: [
      'Digital menu management',
      'Table reservation system',
      'Order management',
      'Staff scheduling',
      'Inventory tracking',
      'Analytics dashboard'
    ],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Square API', 'Material UI'],
    liveUrl: 'https://restaurant-demo.siso.agency',
    demoUrl: 'https://restaurant-demo.siso.agency/demo',
    imageUrl: '/images/portfolio/restaurant-system.png',
    clientTestimonial: {
      quote: "Streamlined our entire operation. Orders are faster, customers are happier.",
      author: "Giuseppe Italiano",
      company: "Bella Vista Restaurant"
    },
    metrics: [
      { label: 'Order Efficiency', value: '+40%' },
      { label: 'Customer Satisfaction', value: '4.8/5' },
      { label: 'Revenue Growth', value: '+25%' }
    ]
  },
  {
    id: 'barber-template',
    title: 'Barber Shop Template',
    description: 'Modern booking system for barbershops and salons with staff management',
    category: 'beauty',
    priceRange: {
      min: 800,
      max: 2000,
      currency: '€'
    },
    status: 'live',
    features: [
      'Appointment booking',
      'Staff availability management',
      'Service catalog',
      'Payment processing',
      'SMS notifications',
      'Customer profiles'
    ],
    technologies: ['React', 'Firebase', 'Stripe', 'Twilio', 'Chakra UI'],
    liveUrl: 'https://barber-template.siso.agency',
    demoUrl: 'https://barber-template.siso.agency/demo',
    imageUrl: '/images/portfolio/barber-template.png',
    metrics: [
      { label: 'Booking Efficiency', value: '+60%' },
      { label: 'No-Shows Reduction', value: '-30%' },
      { label: 'Customer Retention', value: '+45%' }
    ]
  },
  {
    id: 'crypto-app',
    title: 'Crypto Trading App',
    description: 'Advanced cryptocurrency trading platform with real-time analytics and wallet integration',
    category: 'fintech',
    priceRange: {
      min: 5000,
      max: 15000,
      currency: '€'
    },
    status: 'live',
    features: [
      'Real-time trading',
      'Advanced charting',
      'Multi-wallet support',
      'DeFi integration',
      'Security features',
      'Mobile app'
    ],
    technologies: ['React', 'Node.js', 'Web3', 'TradingView', 'Redux'],
    liveUrl: 'https://crypto-platform.siso.agency',
    demoUrl: 'https://crypto-platform.siso.agency/demo',
    imageUrl: '/images/portfolio/crypto-app.png',
    clientTestimonial: {
      quote: "Professional-grade platform that rival the big exchanges. Excellent user experience.",
      author: "Alex Chen",
      company: "CryptoMax Trading"
    },
    metrics: [
      { label: 'Trading Volume', value: '$2.5M+' },
      { label: 'Active Users', value: '10K+' },
      { label: 'Uptime', value: '99.9%' }
    ]
  },
  {
    id: 'property-management',
    title: 'Property Management System',
    description: 'Comprehensive property management solution for landlords and real estate agencies',
    category: 'real-estate',
    priceRange: {
      min: 3000,
      max: 8000,
      currency: '€'
    },
    status: 'live',
    features: [
      'Property listings',
      'Tenant management',
      'Rent collection',
      'Maintenance requests',
      'Financial reporting',
      'Document storage'
    ],
    technologies: ['React', 'Python', 'Django', 'PostgreSQL', 'AWS'],
    liveUrl: 'https://property-mgmt.siso.agency',
    demoUrl: 'https://property-mgmt.siso.agency/demo',
    imageUrl: '/images/portfolio/property-management.png',
    metrics: [
      { label: 'Properties Managed', value: '500+' },
      { label: 'Rent Collection', value: '98%' },
      { label: 'Response Time', value: '<4h' }
    ]
  }
];

export const categoryLabels: Record<PortfolioCategory, string> = {
  'events': 'Events & Activities',
  'restaurant': 'Food & Beverage',
  'beauty': 'Beauty & Wellness',
  'fintech': 'Fintech & Crypto',
  'real-estate': 'Real Estate',
  'client-work': 'Client Projects'
};

export const categoryColors: Record<PortfolioCategory, string> = {
  'events': 'bg-purple-500/30 text-purple-200',
  'restaurant': 'bg-green-500/30 text-green-200',
  'beauty': 'bg-pink-500/30 text-pink-200',
  'fintech': 'bg-yellow-500/30 text-yellow-200',
  'real-estate': 'bg-blue-500/30 text-blue-200',
  'client-work': 'bg-orange-500/30 text-orange-200'
}; 