import * as React from "react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  MessageCircle,
  Plus
} from "lucide-react";

// Partnership referral data type
interface PartnershipReferral {
  id: string;
  client_name: string;
  client_email: string;
  business_name: string;
  business_description?: string;
  logo_url?: string;
  website_url?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  phone?: string;
  whatsapp_number?: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'mvp_ready' | 'converted' | 'rejected';
  source: string;
  project_type: string;
  estimated_value?: number;
  commission_rate: number;
  expected_commission: number;
  referral_date: string;
  mvp_notes?: string;
  notes?: string;
}

function StatusBadge({ status }: { status: string }) {
  const badgeStyles = {
    new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    qualified: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    proposal_sent: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    mvp_ready: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    converted: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusLabels = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal_sent: "Proposal Sent",
    mvp_ready: "MVP Ready",
    converted: "Converted",
    rejected: "Rejected",
  };

  return (
    <Badge className={`${badgeStyles[status as keyof typeof badgeStyles]} border`}>
      {statusLabels[status as keyof typeof statusLabels] || status}
    </Badge>
  );
}

function SocialLinks({ referral }: { referral: PartnershipReferral }) {
  const links = [
    { url: referral.website_url, icon: Globe, label: "Website" },
    { url: referral.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    { url: referral.instagram_url, icon: Instagram, label: "Instagram" },
    { url: referral.facebook_url, icon: Facebook, label: "Facebook" },
    { url: referral.twitter_url, icon: Twitter, label: "Twitter" },
    { url: `https://wa.me/${referral.whatsapp_number?.replace(/\D/g, '')}`, icon: MessageCircle, label: "WhatsApp", condition: referral.whatsapp_number },
  ];

  return (
    <div className="flex items-center gap-2">
      {links
        .filter(link => link.condition !== undefined ? link.condition : link.url)
        .map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-orange-400 transition-colors"
            title={link.label}
          >
            <link.icon className="h-4 w-4" />
          </a>
        ))}
    </div>
  );
}

export function PartnershipReferralsTable() {
  // Mock data for now - replace with real API calls
  const [referrals] = useState<PartnershipReferral[]>([
    {
      id: '1',
      client_name: 'John Smith',
      client_email: 'john@techstartup.com',
      business_name: 'Tech Startup Ltd',
      business_description: 'B2B SaaS platform for project management',
      logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=64&h=64&fit=crop&crop=entropy',
      website_url: 'https://techstartup.com',
      linkedin_url: 'https://linkedin.com/company/techstartup',
      instagram_url: 'https://instagram.com/techstartup',
      phone: '+44 7123 456789',
      whatsapp_number: '+44 7123 456789',
      status: 'qualified',
      source: 'linkedin',
      project_type: 'web_app',
      estimated_value: 15000,
      commission_rate: 15,
      expected_commission: 2250,
      referral_date: '2024-01-15',
      mvp_notes: 'Need demo with project management features',
      notes: 'Interested in e-commerce platform'
    },
    {
      id: '2',
      client_name: 'Sarah Johnson',
      client_email: 'sarah@designco.com',
      business_name: 'Design Co',
      business_description: 'Creative agency specializing in brand identity',
      logo_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=64&h=64&fit=crop&crop=entropy',
      website_url: 'https://designco.com',
      linkedin_url: 'https://linkedin.com/company/designco',
      facebook_url: 'https://facebook.com/designco',
      phone: '+44 7987 654321',
      whatsapp_number: '+44 7987 654321',
      status: 'mvp_ready',
      source: 'referral',
      project_type: 'mobile_app',
      estimated_value: 25000,
      commission_rate: 15,
      expected_commission: 3750,
      referral_date: '2024-01-20',
      mvp_notes: 'Portfolio showcase app MVP completed',
      notes: 'iOS and Android app needed'
    },
    {
      id: '3',
      client_name: 'Mike Brown',
      client_email: 'mike@retailbiz.com',
      business_name: 'Retail Business',
      business_description: 'Multi-location retail chain with online presence',
      logo_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f9da2c?w=64&h=64&fit=crop&crop=entropy',
      website_url: 'https://retailbiz.com',
      linkedin_url: 'https://linkedin.com/company/retailbiz',
      twitter_url: 'https://twitter.com/retailbiz',
      phone: '+44 7456 123789',
      whatsapp_number: '+44 7456 123789',
      status: 'converted',
      source: 'networking',
      project_type: 'e_commerce',
      estimated_value: 35000,
      commission_rate: 15,
      expected_commission: 5250,
      referral_date: '2024-01-10',
      mvp_notes: 'Custom e-commerce solution delivered',
      notes: 'Shopify to custom solution migration'
    }
  ]);

  return (
    <div className="w-full">
      {/* Simple header with just add button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="text-sm text-gray-400">
          {referrals.length} referral{referrals.length !== 1 ? 's' : ''}
        </div>
        <Button 
          className="bg-orange-600 hover:bg-orange-700 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add referral
        </Button>
      </div>

      {/* Clean table with better colors */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-300 font-medium">Client Name</TableHead>
              <TableHead className="text-gray-300 font-medium">Email</TableHead>
              <TableHead className="text-gray-300 font-medium">Business</TableHead>
              <TableHead className="text-gray-300 font-medium">Phone</TableHead>
              <TableHead className="text-gray-300 font-medium">WhatsApp</TableHead>
              <TableHead className="text-gray-300 font-medium">What They Do</TableHead>
              <TableHead className="text-gray-300 font-medium">Status</TableHead>
              <TableHead className="text-gray-300 font-medium">Source</TableHead>
              <TableHead className="text-gray-300 font-medium">Project Type</TableHead>
              <TableHead className="text-gray-300 font-medium">Value</TableHead>
              <TableHead className="text-gray-300 font-medium">Commission</TableHead>
              <TableHead className="text-gray-300 font-medium">Logo</TableHead>
              <TableHead className="text-gray-300 font-medium">Social Links</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((referral) => (
              <TableRow 
                key={referral.id} 
                className="border-gray-800 hover:bg-gray-900/50 transition-colors"
              >
                <TableCell className="text-white font-medium">
                  {referral.client_name}
                </TableCell>
                <TableCell className="text-gray-300">
                  {referral.client_email}
                </TableCell>
                <TableCell className="text-gray-300">
                  {referral.business_name}
                </TableCell>
                <TableCell className="text-gray-300">
                  {referral.phone}
                </TableCell>
                <TableCell className="text-gray-300">
                  {referral.whatsapp_number}
                </TableCell>
                <TableCell className="text-gray-300 max-w-xs">
                  <div className="truncate" title={referral.business_description}>
                    {referral.business_description}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={referral.status} />
                </TableCell>
                <TableCell className="text-gray-300 capitalize">
                  {referral.source}
                </TableCell>
                <TableCell className="text-gray-300 capitalize">
                  {referral.project_type.replace('_', ' ')}
                </TableCell>
                <TableCell className="text-green-400 font-medium">
                  £{(referral.estimated_value ?? 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-orange-400 font-medium">
                  £{referral.expected_commission.toLocaleString()}
                </TableCell>
                <TableCell>
                  {referral.logo_url && (
                    <img 
                      src={referral.logo_url} 
                      alt={`${referral.business_name} logo`}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <SocialLinks referral={referral} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Simple pagination */}
      <div className="flex items-center justify-center p-4 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          Rows per page: 10 • 1-3 of 3
        </div>
      </div>
    </div>
  );
}