import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Main landing page for www.siso.agency
 * Entry point for all tenants
 */
export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            SISO<span className="text-indigo-600">.agency</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Revolutionary AI-powered productivity ecosystem.<br />
            Internal tools, client solutions, and partnership opportunities.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {/* Internal Portal */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Internal Tools</h3>
              <p className="text-gray-600 mb-6">
                Advanced productivity suite with LifeLock dashboard, task management, and business intelligence.
              </p>
              <Link 
                to="/internal/admin/lifelock" 
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Access Internal Portal
              </Link>
            </div>

            {/* Client Portal */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Client Solutions</h3>
              <p className="text-gray-600 mb-6">
                Custom AI solutions and productivity tools tailored for your business needs.
              </p>
              <Link 
                to="/clients" 
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Explore Client Portal
              </Link>
            </div>

            {/* Partnership Portal */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Partnership Program</h3>
              <p className="text-gray-600 mb-6">
                Join our ecosystem as a partner and unlock collaborative opportunities.
              </p>
              <Link 
                to="/partnership" 
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Partnership Portal
              </Link>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-500">
              Powered by AI • Built for Scale • Designed for Success
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};