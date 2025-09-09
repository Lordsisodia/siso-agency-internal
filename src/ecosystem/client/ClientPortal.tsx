import React from 'react';
import { useTenant } from '@/shared/hooks/useTenant';

/**
 * Client Portal - Main entry for client-specific features
 * Future home for client onboarding, project dashboards, etc.
 */
export const ClientPortal: React.FC = () => {
  const { tenant, basePath } = useTenant();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SISO Client Portal</h1>
              <p className="text-gray-600 mt-1">Manage your AI-powered solutions</p>
            </div>
            <div className="text-sm text-gray-500">
              Tenant: {tenant} | Path: {basePath}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Coming Soon Banner */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">🚀 Client Portal Coming Soon</h2>
            <p className="text-green-100 max-w-2xl mx-auto">
              We're building an amazing client experience with project dashboards, 
              AI tool access, and collaborative features. Stay tuned!
            </p>
          </div>

          {/* Feature Preview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Project Dashboard</h3>
              <p className="text-gray-600 text-sm">Track progress, view analytics, and manage your AI implementations.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Tool Access</h3>
              <p className="text-gray-600 text-sm">Direct access to custom AI solutions built for your business.</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Support & Collaboration</h3>
              <p className="text-gray-600 text-sm">Direct communication with our team and collaborative workspaces.</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-lg p-8 shadow-sm border mt-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to Get Started?</h3>
            <p className="text-gray-600 mb-6">
              Contact us to discuss your AI implementation needs and get early access to the client portal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Schedule Consultation
              </button>
              <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                View Case Studies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};