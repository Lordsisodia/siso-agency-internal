import React from 'react';
import { useTenant } from '@/lib/hooks/useTenant';

/**
 * Partnership Portal - Main entry for partner-specific features
 * Future home for partner onboarding, collaboration tools, revenue sharing, etc.
 */
export const PartnershipPortal: React.FC = () => {
  const { tenant, basePath } = useTenant();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SISO Partnership Portal</h1>
              <p className="text-gray-600 mt-1">Collaborative AI ecosystem for partners</p>
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
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">🤝 Partnership Program Launching</h2>
            <p className="text-purple-100 max-w-2xl mx-auto">
              Join our revolutionary AI partnership ecosystem. Revenue sharing, 
              collaborative development, and exclusive access to cutting-edge tools.
            </p>
          </div>

          {/* Partnership Types */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-sm border">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Technology Partners</h3>
              <p className="text-gray-600 mb-6">
                Integrate your AI solutions with our ecosystem. API access, 
                co-development opportunities, and revenue sharing models.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• API Integration Support</li>
                <li>• Co-development Projects</li>
                <li>• Revenue Sharing (70/30 split)</li>
                <li>• Technical Documentation Access</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Business Partners</h3>
              <p className="text-gray-600 mb-6">
                Resell our AI solutions to your clients. White-label options,
                training programs, and dedicated support channels.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• White-label Solutions</li>
                <li>• Partner Training Programs</li>
                <li>• Dedicated Support Channels</li>
                <li>• Marketing Co-op Programs</li>
              </ul>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="bg-white rounded-xl p-8 shadow-sm border mb-12">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Partnership Benefits</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Revenue Sharing</h4>
                <p className="text-gray-600 text-sm">Competitive revenue splits and transparent reporting.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Exclusive Access</h4>
                <p className="text-gray-600 text-sm">Early access to new features and beta programs.</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Technical Support</h4>
                <p className="text-gray-600 text-sm">Dedicated engineering support and documentation.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Partner with SISO?</h3>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Join our exclusive partnership program and be part of the AI revolution. 
              Limited spots available for founding partners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Apply for Partnership
              </button>
              <button className="bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors">
                Download Partnership Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};