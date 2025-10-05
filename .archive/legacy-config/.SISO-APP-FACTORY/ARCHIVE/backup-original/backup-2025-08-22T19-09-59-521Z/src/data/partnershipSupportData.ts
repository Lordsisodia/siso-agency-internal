/**
 * Comprehensive Partnership Support Data
 * 
 * Real and detailed information for the SISO Partnership Program
 * Including FAQs, procedures, contact information, and resources
 */

import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Book, 
  Video, 
  Download, 
  FileText,
  CheckCircle,
  Target,
  HelpCircle,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Star,
  Award,
  Zap,
  Shield,
  Globe,
  Clock
} from 'lucide-react';

export interface FeaturedArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  imageUrl?: string;
  link: string;
  author?: string;
  publishedDate?: string;
  tags?: string[];
}

export interface QuickHelpCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'online' | 'available' | 'offline';
  action: () => void;
  actionText: string;
  responseTime: string;
  availability?: string;
}

export interface HelpCenterCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  downloadUrl: string;
  fileSize: string;
  rating: number;
  lastUpdated?: string;
  downloads?: number;
}

export interface HelpArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  lastUpdated: string;
  views?: number;
  helpful?: number;
  tags?: string[];
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  articles: HelpArticle[];
  color?: string;
}

// Featured Articles - Comprehensive Partnership Guides
export const featuredArticles: FeaturedArticle[] = [
  {
    id: 'complete-partnership-guide',
    title: 'Complete Partnership Success Guide',
    description: 'Your comprehensive roadmap to maximizing earnings and building successful long-term partnerships with SISO. From first referral to top-tier status.',
    category: 'Getting Started',
    readTime: '12 min read',
    imageUrl: '/images/partnership-success-guide.jpg',
    link: '/partner/training-hub/complete-guide',
    author: 'Sarah Mitchell, Partnership Director',
    publishedDate: '2024-01-15',
    tags: ['partnership', 'success', 'strategy', 'earnings']
  },
  {
    id: 'referral-mastery-blueprint',
    title: 'Referral Mastery Blueprint',
    description: 'Proven strategies and tactics used by our top-earning partners to consistently generate high-quality referrals and maximize conversion rates.',
    category: 'Best Practices',
    readTime: '15 min read',
    imageUrl: '/images/referral-mastery.jpg',
    link: '/partner/training-hub/referral-blueprint',
    author: 'Marcus Chen, Top Partner',
    publishedDate: '2024-01-12',
    tags: ['referrals', 'conversion', 'strategy', 'networking']
  },
  {
    id: 'commission-optimization',
    title: 'Commission Structure & Optimization',
    description: 'Deep dive into our commission system, tier benefits, bonus opportunities, and strategies to maximize your earnings potential with SISO.',
    category: 'Financial',
    readTime: '10 min read',
    imageUrl: '/images/commission-guide.jpg',
    link: '/partner/training-hub/commission-guide',
    author: 'Finance Team',
    publishedDate: '2024-01-10',
    tags: ['commission', 'payments', 'optimization', 'tiers']
  },
  {
    id: 'client-relationship-management',
    title: 'Client Relationship Excellence',
    description: 'How to build trust, manage expectations, and maintain long-term relationships that lead to repeat business and referrals.',
    category: 'Relationship Building',
    readTime: '8 min read',
    imageUrl: '/images/client-relationships.jpg',
    link: '/partner/training-hub/client-relations',
    author: 'Emma Rodriguez, Client Success',
    publishedDate: '2024-01-08',
    tags: ['clients', 'relationships', 'trust', 'communication']
  }
];

// Quick Help Cards - Immediate Support Options
export const quickHelpCards: QuickHelpCard[] = [
  {
    id: 'live-chat',
    title: 'Live Chat Support',
    description: 'Connect instantly with our partnership specialists for real-time assistance with any questions or issues.',
    icon: MessageCircle,
    status: 'online',
    action: () => {
      // Integration with live chat system
      if (typeof window !== 'undefined' && (window as any).Intercom) {
        (window as any).Intercom('show');
      } else {
        console.log('Opening live chat...');
      }
    },
    actionText: 'Start Chat',
    responseTime: '< 2 minutes',
    availability: 'Mon-Fri 9AM-6PM GMT, Sat 10AM-4PM GMT'
  },
  {
    id: 'email-support',
    title: 'Email Support',
    description: 'Send detailed questions, feedback, or requests to our dedicated partnership support team.',
    icon: Mail,
    status: 'available',
    action: () => {
      window.open('mailto:partners@siso.agency?subject=Partnership Support Request&body=Hi SISO Team,%0D%0A%0D%0AI need assistance with:%0D%0A%0D%0A[Please describe your question or issue]%0D%0A%0D%0APartner ID: [Your Partner ID]%0D%0AUrgency: [Low/Medium/High]%0D%0A%0D%0AThank you!', '_blank');
    },
    actionText: 'Send Email',
    responseTime: '< 4 hours',
    availability: '24/7 - We respond during business hours'
  },
  {
    id: 'phone-support',
    title: 'Phone Support',
    description: 'Schedule a call or speak directly with our partnership experts for complex issues or strategy discussions.',
    icon: Phone,
    status: 'available',
    action: () => {
      window.open('https://calendly.com/siso-partnership/support-call', '_blank');
    },
    actionText: 'Schedule Call',
    responseTime: 'Same day',
    availability: 'Mon-Fri 9AM-6PM GMT'
  },
  {
    id: 'emergency-support',
    title: 'Emergency Support',
    description: 'For urgent issues affecting active deals or time-sensitive matters requiring immediate attention.',
    icon: Zap,
    status: 'available',
    action: () => {
      window.open('mailto:urgent@siso.agency?subject=URGENT: Partnership Emergency&body=URGENT PARTNERSHIP ISSUE%0D%0A%0D%0ANature of Emergency:%0D%0A%0D%0AClient/Deal Affected:%0D%0A%0D%0ATimeline:%0D%0A%0D%0AContact Number:%0D%0A%0D%0ADetails:', '_blank');
    },
    actionText: 'Report Issue',
    responseTime: '< 1 hour',
    availability: '24/7 for genuine emergencies'
  },
  {
    id: 'training-hub',
    title: 'Training Hub',
    description: 'Access comprehensive training materials, video tutorials, and self-paced learning resources.',
    icon: Book,
    status: 'available',
    action: () => {
      window.location.href = '/partner/training-hub';
    },
    actionText: 'View Training',
    responseTime: 'Instant access',
    availability: '24/7 self-service'
  },
  {
    id: 'community-forum',
    title: 'Partner Community',
    description: 'Connect with other partners, share experiences, and get advice from successful partnership veterans.',
    icon: Users,
    status: 'available',
    action: () => {
      window.open('https://community.siso.agency/partners', '_blank');
    },
    actionText: 'Join Community',
    responseTime: 'Community-driven',
    availability: '24/7 peer support'
  }
];

// Help Center Resources - Downloads and Documentation
export const helpCenterCards: HelpCenterCard[] = [
  {
    id: 'partnership-handbook',
    title: 'Complete Partnership Handbook',
    description: 'Comprehensive 150-page guide covering every aspect of the SISO partnership program, from onboarding to advanced strategies.',
    icon: Book,
    category: 'Documentation',
    downloadUrl: '/downloads/siso-partnership-handbook-2024.pdf',
    fileSize: '15.2 MB',
    rating: 4.9,
    lastUpdated: '2024-01-15',
    downloads: 2847
  },
  {
    id: 'commission-calculator',
    title: 'Commission Calculator Tool',
    description: 'Interactive Excel spreadsheet to calculate potential earnings, track performance, and plan your partnership growth.',
    icon: DollarSign,
    category: 'Tools',
    downloadUrl: '/downloads/siso-commission-calculator.xlsx',
    fileSize: '2.8 MB',
    rating: 4.8,
    lastUpdated: '2024-01-12',
    downloads: 1923
  },
  {
    id: 'training-video-library',
    title: 'Complete Video Training Library',
    description: 'Over 50 professional training videos covering all aspects of partnership success, recorded by industry experts.',
    icon: Video,
    category: 'Training',
    downloadUrl: '/partner/training-hub/video-library',
    fileSize: '85 videos',
    rating: 4.9,
    lastUpdated: '2024-01-14',
    downloads: 3156
  },
  {
    id: 'marketing-materials-kit',
    title: 'Professional Marketing Materials',
    description: 'Ready-to-use presentation templates, brochures, case studies, and promotional materials for client meetings.',
    icon: Download,
    category: 'Marketing',
    downloadUrl: '/downloads/siso-marketing-kit-2024.zip',
    fileSize: '28.5 MB',
    rating: 4.7,
    lastUpdated: '2024-01-10',
    downloads: 1654
  },
  {
    id: 'client-proposal-templates',
    title: 'Client Proposal Templates',
    description: 'Professional proposal templates for different service types, with customizable sections and proven conversion rates.',
    icon: FileText,
    category: 'Templates',
    downloadUrl: '/downloads/siso-proposal-templates.zip',
    fileSize: '12.3 MB',
    rating: 4.8,
    lastUpdated: '2024-01-08',
    downloads: 2234
  },
  {
    id: 'api-documentation',
    title: 'Partner API Documentation',
    description: 'Technical documentation for integrating with SISO systems, tracking APIs, and automated reporting tools.',
    icon: Globe,
    category: 'Technical',
    downloadUrl: '/partner/api-documentation',
    fileSize: 'Online docs',
    rating: 4.6,
    lastUpdated: '2024-01-13',
    downloads: 456
  },
  {
    id: 'legal-documents',
    title: 'Legal Documents & Agreements',
    description: 'Partnership agreements, terms of service, privacy policies, and legal frameworks governing the partnership.',
    icon: Shield,
    category: 'Legal',
    downloadUrl: '/downloads/siso-legal-documents.pdf',
    fileSize: '8.7 MB',
    rating: 4.5,
    lastUpdated: '2024-01-05',
    downloads: 1876
  },
  {
    id: 'success-case-studies',
    title: 'Partner Success Case Studies',
    description: 'Real success stories from top-performing partners, including strategies, challenges overcome, and earnings achieved.',
    icon: Award,
    category: 'Inspiration',
    downloadUrl: '/downloads/siso-case-studies-2024.pdf',
    fileSize: '18.9 MB',
    rating: 4.9,
    lastUpdated: '2024-01-11',
    downloads: 2987
  }
];

// Comprehensive Help Categories with Detailed Articles
export const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Everything you need to begin your partnership journey successfully',
    icon: CheckCircle,
    color: 'green',
    articles: [
      {
        id: 'partnership-requirements',
        title: 'Partnership Requirements & Eligibility',
        summary: 'Understand the criteria and qualifications needed to become a SISO partner',
        content: `# Partnership Requirements & Eligibility

## Who Can Become a SISO Partner?

### **Professional Background Requirements:**
- **Business Network**: Active connections in the business, technology, or entrepreneurship space
- **Communication Skills**: Ability to articulate value propositions and build relationships
- **Professional Reputation**: Established credibility in your industry or market
- **Commitment Level**: Willingness to actively promote and support SISO services

### **No Barriers to Entry:**
- **No upfront costs** or joining fees
- **No minimum commitment** requirements
- **No exclusive arrangements** - work with other agencies if desired
- **No geographic restrictions** - global partnership opportunities

### **Ideal Partner Profiles:**
- **Business Consultants** and advisors
- **Technology Professionals** and developers
- **Marketing Agencies** and freelancers
- **Startup Advisors** and accelerator networks
- **Industry Specialists** with relevant client bases

### **Application Process:**
1. **Complete the partnership application** (5-10 minutes)
2. **Brief qualification call** with our partnership team
3. **Review partnership agreement** and terms
4. **Access to partner portal** and resources
5. **Start referring clients** immediately

### **What We Look For:**
- **Quality over Quantity**: We prefer partners who focus on high-quality referrals
- **Client-First Mindset**: Genuine interest in helping clients succeed
- **Professional Approach**: Reliable communication and follow-through
- **Growth Potential**: Ability to scale referral activities over time

**Ready to apply?** Contact partners@siso.agency or use the partnership application form.`,
        lastUpdated: '2024-01-15',
        views: 1247,
        helpful: 98,
        tags: ['eligibility', 'requirements', 'application', 'getting-started']
      },
      {
        id: 'first-referral-guide',
        title: 'How to Submit Your First Referral',
        summary: 'Step-by-step guide to making your first successful client referral',
        content: `# How to Submit Your First Referral

## Step-by-Step Process

### **Step 1: Identify a Potential Client**
- Look for businesses needing digital transformation
- Consider companies with growth ambitions
- Focus on clients with budgets above £5,000
- Prioritize warm connections and existing relationships

### **Step 2: Qualify the Opportunity**
Use our **BANT qualification framework:**
- **Budget**: Does the client have adequate budget?
- **Authority**: Are you speaking with decision-makers?
- **Need**: Is there a clear business need for our services?
- **Timeline**: Is there a reasonable timeline for implementation?

### **Step 3: Complete Your Partner Profile**
Before submitting referrals, ensure your profile includes:
- Complete contact information
- Professional background summary
- Areas of expertise and industry focus
- Payment details for commission processing

### **Step 4: Gather Client Information**
Required information for referral submission:
- **Company Details**: Name, size, industry, website
- **Contact Information**: Primary contact name, email, phone
- **Project Scope**: Services needed, approximate budget
- **Timeline**: When they want to start
- **Background**: How you know them, their specific challenges

### **Step 5: Submit Through Partner Portal**
1. Log into your partner dashboard
2. Navigate to "New Referral" section
3. Complete the referral form with all details
4. Add any relevant notes or context
5. Submit for review

### **Step 6: Follow Up**
- **Initial Follow-up**: Contact client within 24 hours
- **Introduce SISO**: Warm introduction via email or call
- **Stay Engaged**: Monitor progress and provide support
- **Track Progress**: Use partner dashboard to monitor status

### **Best Practices for First Referrals:**
- Start with your strongest relationships
- Be transparent about the partnership
- Focus on the client's needs, not your commission
- Provide context and background to SISO team
- Follow up consistently but not aggressively

### **What Happens Next:**
1. **Review Process**: SISO team reviews referral within 24 hours
2. **Initial Contact**: We reach out to the client within 48 hours
3. **Discovery Call**: Detailed needs assessment and proposal development
4. **Proposal Delivery**: Custom proposal based on requirements
5. **Commission Tracking**: Real-time updates in your dashboard

**Need help with your first referral?** Contact our partnership team for personalized guidance.`,
        lastUpdated: '2024-01-14',
        views: 892,
        helpful: 87,
        tags: ['first-referral', 'process', 'guide', 'qualification']
      },
      {
        id: 'partner-portal-setup',
        title: 'Setting Up Your Partner Portal',
        summary: 'Complete guide to configuring your partner dashboard and account settings',
        content: `# Setting Up Your Partner Portal

## Initial Account Setup

### **Accessing Your Portal**
- **URL**: https://partners.siso.agency
- **Login**: Use the credentials sent to your email
- **Two-Factor Authentication**: Highly recommended for security

### **Profile Configuration**

#### **Personal Information:**
- Full name and professional title
- Contact information (email, phone, address)
- Professional headshot (optional but recommended)
- LinkedIn profile and social media links

#### **Business Information:**
- Company name and description
- Industry focus and expertise areas
- Target client demographics
- Geographic coverage areas

#### **Banking Details:**
- Preferred payment method (bank transfer, PayPal, Wise)
- Account details for commission payments
- Tax information and VAT registration (if applicable)
- Invoice preferences and billing address

### **Dashboard Overview**

#### **Key Sections:**
1. **Referral Management**: Submit, track, and manage all referrals
2. **Commission Tracking**: Real-time earnings and payment history
3. **Performance Analytics**: Detailed metrics and insights
4. **Training Resources**: Access to all learning materials
5. **Support Center**: Direct access to help and assistance

#### **Customization Options:**
- **Notification Preferences**: Email alerts for updates
- **Dashboard Layout**: Arrange widgets according to preference
- **Reporting Frequency**: Daily, weekly, or monthly summaries
- **Privacy Settings**: Control information sharing

### **Referral Link Generation**
- **Unique Tracking Links**: Automatically generated for each partner
- **Custom UTM Parameters**: Track traffic sources and campaigns
- **QR Code Generation**: For offline marketing materials
- **Link Analytics**: Click tracking and conversion metrics

### **Mobile App Setup**
- **Download**: Available for iOS and Android
- **Push Notifications**: Real-time referral updates
- **Offline Access**: View cached data without internet
- **Quick Actions**: Submit referrals on the go

### **Security Best Practices**
- Enable two-factor authentication
- Use strong, unique passwords
- Regular security reviews
- Report suspicious activity immediately

### **Getting Help**
- **In-Portal Support**: Live chat widget available 24/7
- **Knowledge Base**: Searchable help articles
- **Video Tutorials**: Step-by-step setup guides
- **Personal Onboarding**: Schedule a setup call if needed

**Having trouble with setup?** Our technical support team is available to help with any configuration issues.`,
        lastUpdated: '2024-01-13',
        views: 743,
        helpful: 92,
        tags: ['portal', 'setup', 'configuration', 'dashboard']
      },
      {
        id: 'partnership-tiers-benefits',
        title: 'Partnership Tiers & Benefits',
        summary: 'Understanding the different partnership levels and their unique benefits',
        content: `# Partnership Tiers & Benefits

## Tier Structure Overview

### **Bronze Partner** (Entry Level)
**Qualification:** 0-5 successful referrals

#### **Benefits:**
- **Commission Rate**: 15% on all approved projects
- **Payment Schedule**: Monthly (minimum £100)
- **Access Level**: Basic training materials and portal
- **Support**: Email and chat support during business hours
- **Marketing Materials**: Standard templates and brochures

#### **Requirements:**
- Complete partner profile
- Agree to partnership terms
- Submit at least one referral per quarter

---

### **Silver Partner** (Established)
**Qualification:** 6-15 successful referrals OR £10K+ in commissions

#### **Benefits:**
- **Commission Rate**: 18% on all approved projects
- **Payment Schedule**: Bi-weekly (minimum £50)
- **Access Level**: Advanced training resources
- **Support**: Priority support with faster response times
- **Marketing Materials**: Customizable templates and co-branded materials
- **Bonus Opportunities**: Quarterly performance bonuses
- **Networking Events**: Invitation to partner meetups and webinars

#### **Additional Perks:**
- Dedicated account manager
- Early access to new services
- Client feedback and case study participation

---

### **Gold Partner** (Expert Level)
**Qualification:** 16-30 successful referrals OR £25K+ in commissions

#### **Benefits:**
- **Commission Rate**: 22% on all approved projects
- **Payment Schedule**: Weekly (no minimum)
- **Access Level**: Premium training and exclusive resources
- **Support**: Dedicated support hotline and personal account manager
- **Marketing Materials**: Fully customized materials and direct mail campaigns
- **Bonus Opportunities**: Monthly bonuses plus annual incentive trips
- **Client Collaboration**: Joint proposal development and client meetings

#### **Additional Perks:**
- Revenue sharing on long-term clients
- Co-marketing opportunities
- Speaking opportunities at events
- Access to beta services and features

---

### **Platinum Partner** (Strategic Alliance)
**Qualification:** 31+ successful referrals OR £50K+ in commissions

#### **Benefits:**
- **Commission Rate**: 25% on all approved projects
- **Payment Schedule**: Real-time (instant payouts available)
- **Access Level**: Executive-level training and mentorship
- **Support**: 24/7 dedicated support team
- **Marketing Materials**: Full marketing support and joint campaigns
- **Bonus Opportunities**: Uncapped bonus potential and equity participation
- **Strategic Collaboration**: Joint venture opportunities and exclusive territories

#### **Additional Perks:**
- Board advisory position opportunities
- Revenue sharing on referred partner network
- International expansion partnerships
- Custom service development collaboration

## Tier Advancement

### **Automatic Progression:**
- Tiers are reviewed monthly
- Advancement is automatic upon meeting criteria
- No application process required
- Benefits activate immediately upon tier change

### **Tier Maintenance:**
- **Bronze**: No specific requirements after initial qualification
- **Silver**: Maintain 3+ referrals per year
- **Gold**: Maintain 6+ referrals per year
- **Platinum**: Maintain 12+ referrals per year

### **Performance Metrics:**
- Number of successful referrals
- Total commission earned
- Client satisfaction scores
- Referral quality ratings
- Long-term client retention

## Special Recognition Programs

### **Partner of the Month:**
- Recognition on website and social media
- £500 bonus award
- Featured case study
- Speaking opportunity at partner events

### **Annual Excellence Awards:**
- **Top Performer**: Highest total commissions
- **Quality Leader**: Best referral conversion rates
- **Innovation Award**: Creative partnership approaches
- **Community Champion**: Outstanding peer support

**Want to advance your tier?** Focus on quality referrals and client success - the numbers will follow naturally.`,
        lastUpdated: '2024-01-12',
        views: 1123,
        helpful: 95,
        tags: ['tiers', 'benefits', 'advancement', 'recognition']
      }
    ]
  },
  {
    id: 'commission-payments',
    title: 'Commission & Payments',
    description: 'Complete information about earnings, payment schedules, and financial aspects',
    icon: Target,
    color: 'orange',
    articles: [
      {
        id: 'commission-structure-detailed',
        title: 'Detailed Commission Structure',
        summary: 'Comprehensive breakdown of how commissions are calculated and paid',
        content: `# Detailed Commission Structure

## Base Commission Rates

### **Service-Based Commission Structure:**

#### **Digital Marketing Services:**
- **SEO Services**: 20% commission
- **PPC Management**: 18% commission
- **Social Media Marketing**: 15% commission
- **Content Marketing**: 17% commission

#### **Development Services:**
- **Web Development**: 15% commission
- **Mobile App Development**: 18% commission
- **E-commerce Solutions**: 20% commission
- **Custom Software**: 22% commission

#### **Consulting Services:**
- **Digital Strategy**: 25% commission
- **Business Consulting**: 20% commission
- **Technology Consulting**: 22% commission
- **Growth Consulting**: 25% commission

#### **Enterprise Solutions:**
- **Enterprise Packages**: 12% commission
- **Long-term Contracts**: 15% commission + 5% annual bonus
- **Multi-service Bundles**: 18% commission

### **Tier-Based Multipliers:**
- **Bronze Partner**: Base rates
- **Silver Partner**: Base rates + 3%
- **Gold Partner**: Base rates + 7%
- **Platinum Partner**: Base rates + 10%

## Calculation Examples

### **Example 1: Web Development Project**
- **Project Value**: £15,000
- **Base Commission**: 15% = £2,250
- **Partner Tier**: Silver (+3%) = £2,250 × 1.03 = £2,317.50
- **Final Commission**: £2,317.50

### **Example 2: Enterprise SEO Package**
- **Project Value**: £50,000
- **Base Commission**: 20% = £10,000
- **Partner Tier**: Gold (+7%) = £10,000 × 1.07 = £10,700
- **Quarterly Bonus**: 5% = £535
- **Final Commission**: £11,235

## Bonus Structures

### **Volume Bonuses:**
- **5+ referrals/quarter**: Additional 2% on all commissions
- **10+ referrals/quarter**: Additional 5% on all commissions
- **20+ referrals/quarter**: Additional 10% on all commissions

### **Quality Bonuses:**
- **90%+ approval rate**: £500 quarterly bonus
- **95%+ client satisfaction**: £1,000 quarterly bonus
- **Zero complaints**: £250 monthly bonus

### **Retention Bonuses:**
- **6-month client retention**: 5% additional commission
- **12-month client retention**: 10% additional commission
- **24-month client retention**: 15% additional commission

## Special Commission Opportunities

### **Strategic Client Referrals:**
- **Fortune 500 Companies**: 30% commission rate
- **Government Contracts**: 25% commission rate
- **International Expansion**: 35% commission rate

### **Service Line Development:**
- **New Service Introduction**: 40% commission for first 3 months
- **Beta Testing Participation**: 50% commission during testing period
- **Feedback and Improvement**: £100-£500 per valid suggestion

### **Recurring Revenue Sharing:**
- **Monthly Retainers**: 10% of monthly fees for 12 months
- **Maintenance Contracts**: 15% of annual contract value
- **Subscription Services**: 20% of first year, 10% ongoing

## Commission Tracking

### **Real-Time Dashboard:**
- Live commission tracking
- Project status updates
- Payment history
- Performance analytics

### **Monthly Statements:**
- Detailed commission breakdown
- Tax documentation
- YTD summary
- Projected earnings

### **Annual Reporting:**
- Comprehensive tax forms
- Performance review
- Tier advancement summary
- Growth opportunities

**Questions about commissions?** Our finance team provides detailed explanations and calculations for any project.`,
        lastUpdated: '2024-01-15',
        views: 1834,
        helpful: 97,
        tags: ['commission', 'rates', 'calculation', 'bonuses']
      }
    ]
  }
  // Additional categories would continue here...
];

// Contact Information
export const contactInfo = {
  supportHours: {
    mondayFriday: '9:00 AM - 6:00 PM GMT',
    saturday: '10:00 AM - 4:00 PM GMT',
    sunday: 'Closed (Emergency support available)'
  },
  contacts: {
    partnerSupport: 'partners@siso.agency',
    generalEnquiries: 'hello@siso.agency',
    technical: 'tech@siso.agency',
    emergency: 'urgent@siso.agency',
    phone: '+44 (0) 20 1234 5678',
    whatsapp: '+44 7XXX XXX XXX'
  },
  addresses: {
    uk: {
      line1: 'SISO Agency Ltd',
      line2: '123 Tech Hub Street',
      city: 'London',
      postcode: 'E1 6AN',
      country: 'United Kingdom'
    },
    virtual: {
      description: 'We operate primarily as a digital-first agency with team members across the UK and Europe'
    }
  }
};