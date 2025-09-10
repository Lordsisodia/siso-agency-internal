import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TenantSwitcher } from '../shared/TenantSwitcher';

const ClientDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-50">
      <TenantSwitcher />
      
      <header className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">🚀 SISO Client Portal</h1>
          <p className="text-blue-100 mt-2">Welcome to your project command center</p>
          <div className="mt-3 inline-block bg-blue-500 px-3 py-1 rounded-full text-sm">
            ✨ Beta Testing Phase
          </div>
        </div>
      </header>
      
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Dashboard</h2>
            <p className="text-gray-600">
              Track project progress, manage deliverables, and communicate with your SISO team.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Overview Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📊 Project Analytics</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
              </div>
              <p className="text-gray-600 mb-4">
                Real-time insights into your project progress and milestones.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion:</span>
                  <span className="font-medium">73%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '73%' }}></div>
                </div>
              </div>
            </div>
            
            {/* Active Projects Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📋 Active Projects</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">3 Active</span>
              </div>
              <p className="text-gray-600 mb-4">
                Manage and track all your ongoing projects with SISO.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Website Redesign</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Mobile App Development</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span>Brand Strategy</span>
                </div>
              </div>
            </div>
            
            {/* Communication Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">💬 Communication</h3>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">2 New</span>
              </div>
              <p className="text-gray-600 mb-4">
                Direct line to your SISO team and project updates.
              </p>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium">Latest Update</div>
                  <div className="text-gray-500">Design review completed ✅</div>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm">
                  Open Messages
                </button>
              </div>
            </div>
            
            {/* Resources Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Resources</h3>
              <p className="text-gray-600 mb-4">
                Access project files, brand assets, and documentation.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                  📁 Brand Guidelines
                </div>
                <div className="flex items-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                  🎨 Design Assets
                </div>
                <div className="flex items-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                  📄 Project Specifications
                </div>
              </div>
            </div>
            
            {/* Support Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎧 Support</h3>
              <p className="text-gray-600 mb-4">
                Need help? Get in touch with your dedicated support team.
              </p>
              <div className="space-y-2">
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm">
                  Start Live Chat
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors text-sm">
                  Schedule Call
                </button>
              </div>
            </div>
            
            {/* Coming Soon Card */}
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-lg border-2 border-dashed border-purple-300">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">🚀 Coming Soon</h3>
              <p className="text-purple-700 mb-4">
                More features are being added to enhance your experience.
              </p>
              <div className="space-y-1 text-sm text-purple-600">
                <div>• Advanced Analytics</div>
                <div>• Mobile App</div>
                <div>• API Access</div>
                <div>• Team Collaboration</div>
              </div>
            </div>
          </div>
          
          {/* Beta Feedback Section */}
          <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">🧪 Beta Testing Feedback</h3>
            <p className="text-yellow-700 mb-4">
              You're experiencing the future of client collaboration! Help us improve by sharing your feedback.
            </p>
            <button className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition-colors">
              Share Feedback
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export const ClientPortal: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ClientDashboard />} />
      <Route path="*" element={<Navigate to="/clients" replace />} />
    </Routes>
  );
};