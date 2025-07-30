import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PartnershipLayout } from '@/components/partnership/PartnershipLayout';
import { DashboardGreetingCard } from '@/components/ui/dashboard-templates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users,
  Link2,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle2,
  BarChart3,
  Zap,
  Copy,
  Edit,
  FileText,
  Mail,
  Share2,
  Download,
  Plus,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ExternalLink,
  Phone,
  MessageSquare
} from 'lucide-react';

interface ReferralMetrics {
  totalLeads: number;
  activeDeals: number;
  closedDeals: number;
  conversionRate: number;
  commissionEarned: number;
  avgDealValue: number;
  pipelineValue: number;
  successRate: number;
}

interface ReferralLink {
  id: string;
  name: string;
  url: string;
  created: string;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
  status: 'active' | 'paused' | 'expired';
}

interface Referral {
  id: string;
  date: string;
  contact: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
  value: number;
  stage: string;
  nextAction: string;
  commission: number;
  lastContact: string;
}

const ReferralsManagement = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkCampaign, setNewLinkCampaign] = useState('');

  // Mock data
  const metrics: ReferralMetrics = {
    totalLeads: 127,
    activeDeals: 23,
    closedDeals: 15,
    conversionRate: 11.8,
    commissionEarned: 3750,
    avgDealValue: 250,
    pipelineValue: 5750,
    successRate: 65.2
  };

  const referralLinks: ReferralLink[] = [
    {
      id: '1',
      name: 'Spring Promo',
      url: 'https://siso.agency/ref/abc123-spring',
      created: '2025-01-15',
      clicks: 245,
      leads: 12,
      conversions: 3,
      revenue: 750,
      status: 'active'
    },
    {
      id: '2',
      name: 'LinkedIn Campaign',
      url: 'https://siso.agency/ref/def456-linkedin',
      created: '2025-01-10',
      clicks: 189,
      leads: 8,
      conversions: 2,
      revenue: 500,
      status: 'active'
    },
    {
      id: '3',
      name: 'Email Signature',
      url: 'https://siso.agency/ref/ghi789-email',
      created: '2025-01-01',
      clicks: 156,
      leads: 15,
      conversions: 5,
      revenue: 1250,
      status: 'active'
    }
  ];

  const referrals: Referral[] = [
    {
      id: '1',
      date: '2025-01-20',
      contact: 'John Smith',
      company: 'ABC Corp',
      email: 'john@abccorp.com',
      phone: '+44 20 1234 5678',
      source: 'LinkedIn',
      status: 'proposal',
      value: 2500,
      stage: 'Proposal',
      nextAction: 'Follow-up call',
      commission: 250,
      lastContact: '2 days ago'
    },
    {
      id: '2',
      date: '2025-01-18',
      contact: 'Sarah Johnson',
      company: 'XYZ Ltd',
      email: 'sarah@xyzltd.com',
      phone: '+44 20 9876 5432',
      source: 'Website',
      status: 'qualified',
      value: 1800,
      stage: 'Discovery',
      nextAction: 'Schedule call',
      commission: 180,
      lastContact: '1 day ago'
    },
    {
      id: '3',
      date: '2025-01-15',
      contact: 'Mike Wilson',
      company: 'Tech Co',
      email: 'mike@techco.com',
      phone: '+44 20 5555 1234',
      source: 'Email',
      status: 'closed',
      value: 3200,
      stage: 'Completed',
      nextAction: 'Invoice sent',
      commission: 320,
      lastContact: '1 week ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'qualified':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'proposal':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'negotiation':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'closed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'lost':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Plus className="w-3 h-3" />;
      case 'qualified':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'proposal':
        return <FileText className="w-3 h-3" />;
      case 'negotiation':
        return <MessageSquare className="w-3 h-3" />;
      case 'closed':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'lost':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const generateReferralLink = () => {
    if (!newLinkName.trim()) return;
    
    const linkId = Math.random().toString(36).substring(2, 15);
    const newLink = `https://siso.agency/ref/${linkId}-${newLinkCampaign.toLowerCase().replace(/\s+/g, '-')}`;
    
    console.log('Generated link:', newLink);
    
    setNewLinkName('');
    setNewLinkCampaign('');
    setShowLinkGenerator(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <PartnershipLayout>
      <div className="space-y-6">
        {/* Smart Dashboard Greeting Card - New Header */}
        <DashboardGreetingCard 
          pageTitle="Referral Management"
          pageSubtitle="Track your referrals, manage your pipeline, and optimize your performance"
          showDate={true}
          pageContext={{
            pageType: 'referrals',
            keyMetrics: {
              primary: { value: '£5,750', label: 'Pipeline Value', trend: '+15%' },
              secondary: { value: '28', label: 'Active Referrals' }
            }
          }}
        />

        {/* Key Metrics Row 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.totalLeads}</div>
              <p className="text-xs text-gray-400 mt-1">Generated</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Deals</CardTitle>
              <Target className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.activeDeals}</div>
              <p className="text-xs text-gray-400 mt-1">In Pipeline</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Closed Deals</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.closedDeals}</div>
              <p className="text-xs text-gray-400 mt-1">This Month</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.conversionRate}%</div>
              <p className="text-xs text-gray-400 mt-1">Rate</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Metrics Row 2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Commission</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">£{metrics.commissionEarned.toLocaleString()}</div>
              <p className="text-xs text-orange-400 mt-1 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                Earned
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg Deal</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">£{metrics.avgDealValue}</div>
              <p className="text-xs text-gray-400 mt-1">Value</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Pipeline</CardTitle>
              <Zap className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">£{metrics.pipelineValue.toLocaleString()}</div>
              <p className="text-xs text-gray-400 mt-1">Value</p>
            </CardContent>
          </Card>

          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Success</CardTitle>
              <Target className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.successRate}%</div>
              <p className="text-xs text-gray-400 mt-1">Rate</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Link Generator Modal */}
        {showLinkGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLinkGenerator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-black border border-orange-500/20 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Generate Referral Link</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="linkName" className="text-gray-300">Campaign Name</Label>
                  <Input
                    id="linkName"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    placeholder="e.g., Spring 2025 Promotion"
                    className="bg-gray-900 border-orange-500/20 text-white mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="linkCampaign" className="text-gray-300">UTM Campaign</Label>
                  <Input
                    id="linkCampaign"
                    value={newLinkCampaign}
                    onChange={(e) => setNewLinkCampaign(e.target.value)}
                    placeholder="e.g., spring-promo-2025"
                    className="bg-gray-900 border-orange-500/20 text-white mt-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowLinkGenerator(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateReferralLink}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Generate Link
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Active Referral Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Link2 className="w-5 h-5 mr-2 text-orange-400" />
                Active Referral Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Link Name</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Clicks</TableHead>
                      <TableHead className="text-gray-300">Leads</TableHead>
                      <TableHead className="text-gray-300">Conversions</TableHead>
                      <TableHead className="text-gray-300">Revenue</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralLinks.map((link) => (
                      <TableRow key={link.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{link.name}</TableCell>
                        <TableCell className="text-gray-400">{link.created}</TableCell>
                        <TableCell className="text-white">{link.clicks}</TableCell>
                        <TableCell className="text-white">{link.leads}</TableCell>
                        <TableCell className="text-white">{link.conversions}</TableCell>
                        <TableCell className="text-orange-400">£{link.revenue}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(link.url)}
                              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                            >
                              <BarChart3 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pipeline Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-400" />
                Referral Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { stage: 'Lead', count: 45, color: 'bg-blue-500' },
                  { stage: 'Qualified', count: 32, color: 'bg-yellow-500' },
                  { stage: 'Proposal', count: 18, color: 'bg-purple-500' },
                  { stage: 'Negotiation', count: 12, color: 'bg-orange-500' },
                  { stage: 'Closed', count: 8, color: 'bg-green-500' }
                ].map((stage, index) => (
                  <div key={stage.stage} className="text-center">
                    <div className={`${stage.color} rounded-lg p-4 mb-2`}>
                      <div className="text-2xl font-bold text-white">{stage.count}</div>
                    </div>
                    <div className="text-sm text-gray-400">{stage.stage}</div>
                    {index < 4 && (
                      <div className="flex justify-center mt-2">
                        <ArrowUpRight className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral Management Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-orange-400" />
                Referral Management
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32 bg-gray-900 border-orange-500/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-orange-500/20">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Contact</TableHead>
                      <TableHead className="text-gray-300">Company</TableHead>
                      <TableHead className="text-gray-300">Source</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Value</TableHead>
                      <TableHead className="text-gray-300">Commission</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id} className="border-gray-700">
                        <TableCell className="text-gray-400">{referral.date}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-white font-medium">{referral.contact}</div>
                            <div className="text-xs text-gray-400">{referral.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{referral.company}</TableCell>
                        <TableCell className="text-gray-400">{referral.source}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(referral.status)} flex items-center w-fit`}>
                            {getStatusIcon(referral.status)}
                            <span className="ml-1 capitalize">{referral.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">£{referral.value.toLocaleString()}</TableCell>
                        <TableCell className="text-orange-400">£{referral.commission}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                            >
                              <Phone className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                            >
                              <Mail className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tools & Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="bg-black border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-400" />
                Referral Tools & Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 border-orange-500/30 text-gray-300 hover:bg-orange-500/10 flex flex-col items-center justify-center"
                >
                  <Mail className="w-6 h-6 mb-2 text-orange-400" />
                  <span>Email Templates</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 border-orange-500/30 text-gray-300 hover:bg-orange-500/10 flex flex-col items-center justify-center"
                >
                  <Share2 className="w-6 h-6 mb-2 text-orange-400" />
                  <span>Social Assets</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 border-orange-500/30 text-gray-300 hover:bg-orange-500/10 flex flex-col items-center justify-center"
                >
                  <FileText className="w-6 h-6 mb-2 text-orange-400" />
                  <span>Presentations</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 border-orange-500/30 text-gray-300 hover:bg-orange-500/10 flex flex-col items-center justify-center"
                >
                  <ExternalLink className="w-6 h-6 mb-2 text-orange-400" />
                  <span>Training</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PartnershipLayout>
  );
};

export default ReferralsManagement; 