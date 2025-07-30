import React from 'react';
import { Timeline } from '@/components/ui/timeline';
import { TimelineHeader } from './TimelineHeader';
import { MilestoneCard } from './MilestoneCard';

const milestones = [
  {
    title: "Initial Setup & Planning",
    date: "May 2, 2025 (Week 1)",
    description: "Project setup and initial technical architecture design phase.",
    status: "completed" as const,
    deliverables: [
      "Project setup on SISO AGENCY platform",
      "Initial technical architecture design",
      "Development environment setup"
    ],
    criteria: [
      "Project environment is live on SISO AGENCY",
      "Client can see the initial setup"
    ]
  },
  {
    title: "Web3 Wallet Integration",
    date: "May 5, 2025 (Week 1.5)",
    description: "Integration of Web3 wallet functionality and basic authentication.",
    status: "in-progress" as const,
    payment: {
      amount: 1200,
      trigger: "Due within 7 days of client approval"
    },
    deliverables: [
      "Web3 wallet integration (MetaMask, Trust Wallet, Coinbase Wallet)",
      "Basic authentication via wallet connection"
    ],
    criteria: [
      "Client can connect a wallet and authenticate in a test environment"
    ]
  },
  {
    title: "Basic UI & Dashboard",
    date: "May 9, 2025 (Week 2)",
    description: "Implementation of core UI components and initial portfolio overview.",
    status: "upcoming" as const,
    deliverables: [
      "Basic UI layout (dashboard, navigation)",
      "Initial portfolio overview"
    ],
    criteria: [
      "Client can view the dashboard UI with navigation",
      "Placeholder portfolio section is visible in demo"
    ]
  },
  {
    title: "P2P Trading System",
    date: "May 16, 2025 (Week 3)",
    description: "Development of the peer-to-peer trading system with escrow protection.",
    status: "upcoming" as const,
    payment: {
      amount: 1200,
      trigger: "Due within 7 days of client approval"
    },
    deliverables: [
      "P2P trading system with escrow protection",
      "Trading interface for buying/selling crypto"
    ],
    criteria: [
      "Client can perform test trades using the escrow system"
    ]
  },
  {
    title: "Staking System & Transaction History",
    date: "May 23, 2025 (Week 4)",
    description: "Implementation of staking functionality and transaction tracking.",
    status: "upcoming" as const,
    deliverables: [
      "Staking system with token locking (3, 6, 12 months)",
      "Transaction history display"
    ],
    criteria: [
      "Client can stake tokens for different periods",
      "Transaction history is visible in test environment"
    ]
  },
  {
    title: "Security Features & Market Data",
    date: "May 26, 2025 (Week 4.5)",
    description: "Integration of security features and real-time market data.",
    status: "upcoming" as const,
    payment: {
      amount: 1200,
      trigger: "Due within 7 days of client approval"
    },
    deliverables: [
      "2FA setup",
      "Basic KYC for high-value transactions",
      "Live market data integration"
    ],
    criteria: [
      "Security features are active",
      "Market data shows real-time updates in demo"
    ]
  },
  {
    title: "Community Features",
    date: "May 30, 2025 (Week 5)",
    description: "Development of community engagement and educational features.",
    status: "upcoming" as const,
    deliverables: [
      "Referral rewards system",
      "Educational content section",
      "Social trading forum"
    ],
    criteria: [
      "Client can view and interact with the referral system",
      "Educational content and forum are accessible"
    ]
  },
  {
    title: "Final Testing & Deployment",
    date: "June 6, 2025 (Week 6)",
    description: "Final testing phase and production deployment.",
    status: "upcoming" as const,
    payment: {
      amount: 1500,
      trigger: "Due within 7 days of client approval and final delivery"
    },
    deliverables: [
      "SSL encryption and DDoS protection setup",
      "Final testing (UI, smart contracts, security)",
      "Deployment to live server",
      "Bug fixes and client handover"
    ],
    criteria: [
      "All features work as expected",
      "App is live and launch-ready after client review"
    ]
  }
];

export function TimelineSection() {
  return (
    <div className="space-y-8">
      <TimelineHeader />
      <Timeline 
        data={milestones.map(milestone => ({
          title: milestone.title,
          content: (
            <MilestoneCard
              {...milestone}
            />
          )
        }))}
      />
    </div>
  );
}
