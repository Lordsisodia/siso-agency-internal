import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  FileText, 
  Phone,
  Mail,
  Clock,
  CheckCircle,
  ArrowRight,
  Globe,
  Linkedin,
  Twitter,
  Star,
  Shield,
  Users,
  Award
} from 'lucide-react';

// Define types for plan data
interface PlanData {
  title: string;
  company: string;
  sections: {
    overview: string;
    features: string[];
    timeline: string;
    pricing: string;
    contact: string;
  };
  created_at: string;
  view_count: number;
}

interface MockPlanData {
  [key: string]: PlanData;
}

// Mock plan data for demonstration
const mockPlanData: MockPlanData = {
  'juice-bar': {
    title: 'Juice Bar Mobile App Development Plan',
    company: 'SISO Agency',
    sections: {
      overview: `We'll create a comprehensive mobile application for your juice bar that allows customers to browse your menu, customize orders, make payments, and schedule pickups. This solution includes both iOS and Android versions with a robust admin panel for order management and analytics.

The app will feature modern UI/UX design with vibrant branding, secure payment processing, real-time order tracking, and comprehensive analytics dashboard for business insights.`,
      features: [
        'User Registration & Profiles',
        'Interactive Menu with Nutritional Info',
        'Custom Juice Builder with Ingredients',
        'Secure Payment Gateway',
        'Order Scheduling & Pickup Times',
        'Loyalty Program Integration',
        'Push Notifications for Order Updates',
        'Admin Dashboard for Order Management',
        'Inventory Management System',
        'Customer Analytics & Insights',
        'Social Media Integration',
        'Review & Rating System'
      ],
      timeline: `Phase 1: UI/UX Design & Branding (2 weeks)
Phase 2: Backend Development & API Setup (3 weeks)
Phase 3: Mobile App Development (5 weeks)
Phase 4: Payment & Loyalty Integration (2 weeks)
Phase 5: Admin Panel Development (2 weeks)
Phase 6: Testing & App Store Deployment (1 week)

Total Duration: 15 weeks`,
      pricing: `Development Cost: $32,000
Includes:
• Native mobile apps for iOS & Android
• Admin web dashboard
• Payment gateway integration
• Loyalty program system
• 3 months of post-launch support
• Source code & documentation
• App store submission assistance

Payment Terms:
• 30% upfront ($9,600)
• 40% at midpoint milestone ($12,800)
• 30% upon completion ($9,600)`,
      contact: `Ready to boost your juice bar business?

📧 Email: hello@sisoagency.com
📞 Phone: +1 (555) 123-4567
🌐 Website: www.sisoagency.com

Next Steps:
1. Schedule a discovery call to discuss your specific needs
2. Finalize menu structure & branding requirements
3. Sign contract & begin development
4. Weekly progress updates & demos
5. Launch your app and grow your business!`
    },
    created_at: new Date().toISOString(),
    view_count: 5
  },
  'ecommerce-app-development-plan': {
    title: 'E-commerce App Development Plan',
    company: 'SISO Agency',
    sections: {
      overview: `We'll create a comprehensive e-commerce mobile application that allows customers to browse products, make purchases, and track orders seamlessly. This solution includes both iOS and Android versions with a robust admin panel for inventory management.

The app will feature modern UI/UX design, secure payment processing, real-time inventory tracking, and comprehensive analytics dashboard for business insights.`,
      features: [
        'User Authentication & Profiles',
        'Product Catalog with Search & Filters',
        'Shopping Cart & Wishlist',
        'Secure Payment Gateway Integration',
        'Order Tracking & History',
        'Push Notifications',
        'Admin Dashboard for Inventory Management',
        'Analytics & Reporting',
        'Multi-language Support',
        'Customer Reviews & Ratings'
      ],
      timeline: `Phase 1: UI/UX Design & Wireframes (2 weeks)
Phase 2: Backend Development & API Setup (3 weeks)
Phase 3: Frontend Development (4 weeks)
Phase 4: Payment Integration & Testing (2 weeks)
Phase 5: Admin Dashboard Development (2 weeks)
Phase 6: Testing, Bug Fixes & Deployment (1 week)

Total Duration: 14 weeks`,
      pricing: `Development Cost: $45,000
Includes:
• Complete mobile app for iOS & Android
• Admin web dashboard
• 3 months of post-launch support
• Source code & documentation
• App store submission assistance

Payment Terms:
• 30% upfront
• 40% at midpoint milestone
• 30% upon completion`,
      contact: `Ready to get started?

📧 Email: hello@sisoagency.com
📞 Phone: +1 (555) 123-4567
🌐 Website: www.sisoagency.com

Next Steps:
1. Schedule a discovery call
2. Finalize requirements & timeline
3. Sign contract & begin development
4. Regular progress updates & demos`
    },
    created_at: new Date().toISOString(),
    view_count: 12
  },
  'social-media-dashboard-plan': {
    title: 'Social Media Dashboard Plan',
    company: 'SISO Agency', 
    sections: {
      overview: `A comprehensive social media management dashboard that helps businesses monitor, schedule, and analyze their social media presence across multiple platforms including Facebook, Instagram, Twitter, LinkedIn, and TikTok.`,
      features: [
        'Multi-platform social media integration',
        'Content scheduling & automation',
        'Analytics & performance tracking',
        'Team collaboration tools',
        'Content calendar view',
        'Engagement monitoring'
      ],
      timeline: `Phase 1: Research & Design (2 weeks)
Phase 2: Backend & API Integration (3 weeks)
Phase 3: Frontend Dashboard (3 weeks)
Phase 4: Testing & Deployment (1 week)

Total Duration: 9 weeks`,
      pricing: `Development Cost: $28,000
3 months post-launch support included`,
      contact: `Contact us to start your project!
Email: hello@sisoagency.com`
    },
    created_at: new Date(Date.now() - 86400000).toISOString(),
    view_count: 8
  },
  'test': {
    title: 'Test Project Plan',
    company: 'SISO Agency',
    sections: {
      overview: `This is a test project plan created to demonstrate the SISO Agency client presentation system. This plan showcases how professional project proposals are presented to clients with comprehensive details, timelines, and pricing information.

The test plan includes all the essential components of a professional project proposal, including detailed feature lists, development timelines, pricing structure, and clear next steps for client engagement.`,
      features: [
        'Custom Project Planning',
        'Professional Documentation',
        'Interactive Presentations',
        'Real-time Collaboration',
        'Progress Tracking',
        'Client Communication Portal',
        'Document Version Control',
        'Team Management Tools',
        'Analytics Dashboard',
        'Mobile-responsive Design',
        'Secure Client Access',
        'Export & Sharing Options'
      ],
      timeline: `Phase 1: Discovery & Planning (1 week)
Phase 2: Design & Prototyping (2 weeks)
Phase 3: Development & Implementation (4 weeks)
Phase 4: Testing & Quality Assurance (1 week)
Phase 5: Deployment & Launch (1 week)

Total Duration: 9 weeks`,
      pricing: `Development Cost: $25,000
Includes:
• Complete project implementation
• Professional design & branding
• Quality assurance testing
• Documentation & training
• 3 months of post-launch support
• Source code delivery

Payment Terms:
• 30% upfront ($7,500)
• 40% at midpoint milestone ($10,000)
• 30% upon completion ($7,500)`,
      contact: `Ready to start your test project?

📧 Email: hello@sisoagency.com
📞 Phone: +1 (555) 123-4567
🌐 Website: www.sisoagency.com
💬 Live Chat: Available on our website

Next Steps:
1. Schedule a discovery call to discuss requirements
2. Review and approve project specifications
3. Sign contract and begin development
4. Regular progress updates and milestone reviews
5. Launch and celebrate your success!

We're excited to work with you on this test project and demonstrate the quality and professionalism that SISO Agency brings to every client engagement.`
    },
    created_at: new Date().toISOString(),
    view_count: 1
  }
};

export default function PublicPlanView() {
  const { slug } = useParams<{ slug: string }>();
  
  // Get plan data (in real implementation, this would fetch from API)
  const planData = slug ? mockPlanData[slug] : null;

  if (!planData) {
    return (
      <div className="min-h-screen bg-siso-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-siso-text-bold mb-4">Plan Not Found</h1>
          <p className="text-siso-text-muted">The requested plan could not be found.</p>
        </div>
      </div>
    );
  }

  const sectionIcons: Record<string, any> = {
    overview: FileText,
    features: Sparkles,
    timeline: Calendar,
    pricing: DollarSign,
    contact: Phone
  };

  const sectionTitles: Record<string, string> = {
    overview: '📋 Project Overview',
    features: '✨ Key Features',
    timeline: '📅 Timeline & Phases',
    pricing: '💰 Investment',
    contact: '📞 Next Steps'
  };

  return (
    <div className="min-h-screen bg-siso-bg">
      {/* Premium SISO Hero Header */}
      <div className="relative bg-gradient-to-r from-siso-red/10 via-siso-orange/10 to-siso-red/5 border-b border-siso-border overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFA726' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          {/* Premium Navigation Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
                alt="SISO Agency" 
                className="h-12 w-12 rounded-xl border border-siso-orange/60 shadow-lg bg-black/40"
              />
              <div>
                <h3 className="text-xl font-bold text-siso-text-bold">SISO Agency</h3>
                <p className="text-sm text-siso-orange font-medium">Premium Development Solutions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-siso-text-muted">
                <Clock className="w-4 h-4" />
                <span>{planData.view_count} views</span>
              </div>
              <Badge className="bg-siso-orange/20 text-siso-orange border-siso-orange/30">
                <Award className="w-3 h-3 mr-1" />
                Premium Plan
              </Badge>
            </div>
          </div>

          {/* Enhanced Hero Content */}
          <div className="max-w-4xl">
            <div className="flex items-center space-x-2 text-siso-orange text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              <span>Confidential Project Proposal</span>
            </div>
            
            <h1 className="title-glow text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {planData.title}
            </h1>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 text-siso-text">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-siso-orange" />
                <span className="font-medium">Expert Development Team</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-medium">Proven Success Record</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">Premium Support Included</span>
              </div>
            </div>
          </div>

          {/* Enhanced Action Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button className="button-primary">
              <Mail className="mr-2 w-5 h-5" />
              Discuss This Project
            </Button>
            <Button className="button-secondary">
              <Phone className="mr-2 w-5 h-5" />
              Schedule Call
            </Button>
            <Button className="button-secondary">
              <ExternalLink className="mr-2 w-5 h-5" />
              View Portfolio
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enhanced Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {Object.entries(planData.sections).map(([sectionKey, content]) => {
              const Icon = sectionIcons[sectionKey] || FileText;
              
              return (
                <Card key={sectionKey} className="glow-card border-siso-border bg-siso-bg-alt hover:border-siso-border-hover">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-siso-text-bold text-xl">
                      <div className="p-2 bg-siso-orange/20 rounded-lg mr-4 border border-siso-orange/30">
                        <Icon className="h-6 w-6 text-siso-orange" />
                      </div>
                      {sectionTitles[sectionKey] || sectionKey}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sectionKey === 'features' && Array.isArray(content) ? (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(content as string[]).map((feature, index) => (
                          <div key={index} className="flex items-start text-siso-text">
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-siso-text whitespace-pre-wrap leading-relaxed text-lg">
                        {content as string}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Premium Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Contact Card */}
            <Card className="glow-card border-siso-orange/30 bg-gradient-to-br from-siso-orange/10 to-siso-red/10">
              <CardHeader>
                <CardTitle className="text-siso-text-bold flex items-center">
                  <Phone className="mr-2 h-5 w-5 text-siso-orange" />
                  Get Started Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-siso-text text-sm leading-relaxed">
                  Ready to transform your business with this solution? Let's discuss your specific needs.
                </p>
                <div className="space-y-3">
                  <Button className="button-primary w-full">
                    <Mail className="mr-2 w-4 h-4" />
                    hello@sisoagency.com
                  </Button>
                  <Button className="button-secondary w-full">
                    <Phone className="mr-2 w-4 h-4" />
                    +1 (555) 123-4567
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Trust Indicators */}
            <Card className="glow-card border-siso-border bg-siso-bg-alt hover:border-siso-border-hover">
              <CardHeader>
                <CardTitle className="text-siso-text-bold text-lg">Why Choose SISO?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-siso-text">
                  <Award className="w-5 h-5 text-siso-orange" />
                  <span className="text-sm">5+ Years Experience</span>
                </div>
                <div className="flex items-center space-x-3 text-siso-text">
                  <Users className="w-5 h-5 text-siso-orange" />
                  <span className="text-sm">50+ Projects Delivered</span>
                </div>
                <div className="flex items-center space-x-3 text-siso-text">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-sm">100% Client Satisfaction</span>
                </div>
                <div className="flex items-center space-x-3 text-siso-text">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Post-Launch Support</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Premium SISO Footer */}
      <footer className="bg-siso-bg-alt border-t border-siso-border">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Enhanced Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/c5921a2f-8856-42f4-bec5-2d08b81c5691.png" 
                  alt="SISO Agency" 
                  className="h-10 w-10 rounded-xl border border-siso-orange/60 shadow-lg bg-black/40"
                />
                <div>
                  <h3 className="text-lg font-bold text-siso-text-bold">SISO Agency</h3>
                  <p className="text-sm text-siso-orange">Premium Development Solutions</p>
                </div>
              </div>
              <p className="text-siso-text-muted text-sm leading-relaxed">
                We build exceptional digital experiences that drive business growth. 
                From mobile apps to complex web platforms, we deliver solutions that exceed expectations.
              </p>
            </div>

            {/* Enhanced Contact */}
            <div className="space-y-4">
              <h4 className="text-siso-text-bold font-semibold">Get In Touch</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 text-siso-text">
                  <Mail className="w-4 h-4 text-siso-orange" />
                  <span>hello@sisoagency.com</span>
                </div>
                <div className="flex items-center space-x-3 text-siso-text">
                  <Phone className="w-4 h-4 text-siso-orange" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-siso-text">
                  <Globe className="w-4 h-4 text-siso-orange" />
                  <span>www.sisoagency.com</span>
                </div>
              </div>
            </div>

            {/* Enhanced CTA */}
            <div className="space-y-4">
              <h4 className="text-siso-text-bold font-semibold">Ready to Start?</h4>
              <p className="text-siso-text-muted text-sm">
                Let's discuss how we can bring your vision to life with cutting-edge technology.
              </p>
              <Button className="button-primary">
                <ArrowRight className="mr-2 w-4 h-4" />
                Schedule Consultation
              </Button>
            </div>
          </div>

          {/* Enhanced Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-siso-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-siso-text-muted text-sm">
              © 2025 SISO Agency. All rights reserved. | Premium Development Solutions
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button variant="ghost" size="sm" className="text-siso-text-muted hover:text-siso-orange">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-siso-text-muted hover:text-siso-orange">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-siso-text-muted hover:text-siso-orange">
                <Globe className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 