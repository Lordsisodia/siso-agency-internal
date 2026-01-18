import React, { useState } from 'react';
import { useTenant } from '@/lib/hooks/auth/useTenant';
import { ClientBottomNav, ClientBottomNavTab } from './components/ClientBottomNav';
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  FileText,
  Grid3x3,
  Settings,
  Users,
  BarChart3,
  Calendar,
  HelpCircle
} from 'lucide-react';
import { GridMoreMenu } from '@/components/GridMoreMenu';

/**
 * Client Portal - Main entry for client-specific features
 * Client dashboard with project management, AI tools, and collaboration
 */
export const ClientPortal: React.FC = () => {
  const { tenant, basePath } = useTenant();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Client navigation tabs
  const clientTabs: ClientBottomNavTab[] = [
    { title: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-400', bgActive: 'bg-blue-400/20' },
    { title: 'Projects', icon: FolderKanban, color: 'text-purple-400', bgActive: 'bg-purple-400/20' },
    { title: 'Support', icon: MessageSquare, color: 'text-amber-400', bgActive: 'bg-amber-400/20' },
    { title: 'Resources', icon: FileText, color: 'text-green-400', bgActive: 'bg-green-400/20' },
  ];

  const activeIndex = clientTabs.findIndex(tab => tab.title.toLowerCase() === activeSection);

  const handleTabChange = (index: number | null) => {
    if (index === null) {
      // More menu button was clicked
      setIsMoreMenuOpen(true);
      return;
    }
    const section = clientTabs[index].title.toLowerCase();
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h2>
              <p className="text-blue-100">Track your projects and AI implementations</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">Active Projects</h3>
                <p className="text-3xl font-bold text-blue-600">3</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">Pending Tasks</h3>
                <p className="text-3xl font-bold text-amber-600">12</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">Messages</h3>
                <p className="text-3xl font-bold text-green-600">5</p>
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">AI Chatbot Integration</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">Custom chatbot for customer support automation</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">75% Complete</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Data Analytics Platform</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">In Progress</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">Real-time analytics and reporting dashboard</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">45% Complete</p>
              </div>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Support Center</h2>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Our Team</h3>
              <p className="text-gray-600 mb-6">Get help with your projects or ask questions about our services.</p>
              <div className="space-y-4">
                <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Start a Conversation
                </button>
                <button className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Schedule a Call
                </button>
              </div>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Resources & Documentation</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
                <p className="text-gray-600 text-sm">Guides and tutorials for using our AI tools</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <HelpCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">FAQ</h3>
                <p className="text-gray-600 text-sm">Frequently asked questions and answers</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Case Studies</h3>
                <p className="text-gray-600 text-sm">See how other clients are using our solutions</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Training Sessions</h3>
                <p className="text-gray-600 text-sm">Book a training session for your team</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SISO Client Portal</h1>
              <p className="text-gray-600 text-sm">Manage your AI-powered solutions</p>
            </div>
            <div className="text-sm text-gray-500">
              {tenant && <span>Client Portal</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <ClientBottomNav
        tabs={clientTabs}
        activeIndex={activeIndex}
        onChange={handleTabChange}
      />

      {/* Grid More Menu */}
      <GridMoreMenu
        open={isMoreMenuOpen}
        onOpenChange={setIsMoreMenuOpen}
      />
    </div>
  );
};
