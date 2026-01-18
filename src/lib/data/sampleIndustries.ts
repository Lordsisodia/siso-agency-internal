import type { IndustryWithMeta } from '@/agency/industries/types/industry.types';

const now = () => new Date().toISOString();

export const sampleIndustries: IndustryWithMeta[] = [
  {
    id: 'sample-restaurants',
    user_id: null,
    name: 'Restaurants',
    slug: 'restaurants',
    description: 'Full-service and fast casual dining apps focused on loyalty and AI upsells.',
    status: 'in_development',
    focus_level: 'primary',
    pipeline_value: 75000,
    market_size_notes: 'Targeting 20+ venues with £8k average ACV.',
    go_to_market_notes: 'Build reference MVP with delivery automation and loyalty wallet.',
    positioning: 'Hospitality operators seeking modern ordering experiences.',
    target_launch_quarter: '2025-Q4',
    last_reviewed_at: now(),
    created_at: now(),
    updated_at: now(),
    clientsCount: 2,
    openTasksCount: 4,
    documentsCount: 3
  },
  {
    id: 'sample-bike-hire',
    user_id: null,
    name: 'Bike Hire',
    slug: 'bike-hire',
    description: 'Urban bike and e-bike rental platforms for tourism boards and private fleets.',
    status: 'prospecting',
    focus_level: 'secondary',
    pipeline_value: 42000,
    market_size_notes: 'Multi-city rollouts across EU tourist hubs.',
    go_to_market_notes: 'Integrate booking flows with Stripe and GPS tracking providers.',
    positioning: 'Operators needing white-label rentals with maintenance tracking.',
    target_launch_quarter: '2026-Q1',
    last_reviewed_at: now(),
    created_at: now(),
    updated_at: now(),
    clientsCount: 1,
    openTasksCount: 2,
    documentsCount: 1
  },
  {
    id: 'sample-tour-guides',
    user_id: null,
    name: 'Tour Guides',
    slug: 'tour-guides',
    description: 'Guided experience marketplaces for local tour operators and concierge services.',
    status: 'research',
    focus_level: 'experimental',
    pipeline_value: 28000,
    market_size_notes: 'High-intent inbound from concierge collectives.',
    go_to_market_notes: 'Validate itinerary builder and marketplace payments.',
    positioning: 'Small teams selling curated local adventures.',
    target_launch_quarter: '2026-Q2',
    last_reviewed_at: now(),
    created_at: now(),
    updated_at: now(),
    clientsCount: 0,
    openTasksCount: 1,
    documentsCount: 0
  }
];
