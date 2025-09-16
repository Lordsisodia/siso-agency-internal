import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TenantSwitcher } from '../shared/TenantSwitcher';

const PartnershipDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-purple-50">
      <TenantSwitcher />
      
      <header className="bg-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">🤝 SISO Partnership Program</h1>
          <p className="text-purple-100 mt-2">Elite Partner Revenue Center</p>
          <div className="mt-3 inline-block bg-purple-500 px-3 py-1 rounded-full text-sm">
            💎 Premium Partner Access
          </div>
        </div>
      </header>
      
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Partnership Dashboard</h2>
            <p className="text-gray-600">
              Track referrals, manage revenue sharing, and grow your partnership with SISO.
            </p>
          </div>
          
          {/* Revenue Overview */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">$24,750</div>
                <div className="text-purple-100">This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">$156,430</div>
                <div className="text-purple-100">Total Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">42%</div>
                <div className="text-purple-100">Avg Commission</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">23</div>
                <div className="text-purple-100">Active Referrals</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Revenue Share Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">💰 Revenue Share</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">30-50%</span>
              </div>
              <p className="text-gray-600 mb-4">
                Earn premium commissions on all successful referrals.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Tier 1 (1-5 clients):</span>
                  <span className="font-medium">30%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tier 2 (6-15 clients):</span>
                  <span className="font-medium">40%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tier 3 (16+ clients):</span>
                  <span className="font-medium text-purple-600">50%</span>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  Current tier: <strong>Tier 2</strong> (12 clients)
                </div>
              </div>
            </div>
            
            {/* Referral Tracking Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">🎯 Referral Pipeline</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">23 Active</span>
              </div>
              <p className="text-gray-600 mb-4">
                Track your referral progress from lead to conversion.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Leads</span>
                  <div className="flex items-center">
                    <div className="w-8 h-2 bg-yellow-200 rounded mr-2"></div>
                    <span className="font-medium">8</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Proposals</span>
                  <div className="flex items-center">
                    <div className="w-6 h-2 bg-orange-300 rounded mr-2"></div>
                    <span className="font-medium">5</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Negotiations</span>
                  <div className="flex items-center">
                    <div className="w-4 h-2 bg-blue-400 rounded mr-2"></div>
                    <span className="font-medium">3</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Closed Won</span>
                  <div className="flex items-center">
                    <div className="w-3 h-2 bg-green-500 rounded mr-2"></div>
                    <span className="font-medium">2</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance Metrics Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📈 Performance</h3>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Elite</span>
              </div>
              <p className="text-gray-600 mb-4">
                Your partnership performance and growth metrics.
              </p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Conversion Rate:</span>
                  <span className="font-medium text-green-600">32%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Deal Size:</span>
                  <span className="font-medium">$12,400</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Partner Score:</span>
                  <span className="font-medium text-purple-600">94/100</span>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-1">Partner Level Progress</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">78% to Diamond Partner</div>
                </div>
              </div>
            </div>
            
            {/* Partner Tools Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🛠️ Partner Tools</h3>
              <p className="text-gray-600 mb-4">
                Access marketing materials, referral links, and tracking tools.
              </p>
              <div className="space-y-2">
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 cursor-pointer py-1">
                  📎 Referral Link Generator
                </button>
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 cursor-pointer py-1">
                  📊 Custom Proposals
                </button>
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 cursor-pointer py-1">
                  🎨 Marketing Assets
                </button>
                <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 cursor-pointer py-1">
                  📚 Sales Training
                </button>
              </div>
            </div>
            
            {/* Commission Calculator Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🧮 Commission Calculator</h3>
              <p className="text-gray-600 mb-4">
                Calculate potential earnings for different deal sizes.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Deal Value ($)</label>
                  <input 
                    type="number" 
                    placeholder="25000"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="flex justify-between text-sm">
                    <span>Your Commission (40%):</span>
                    <span className="font-bold text-purple-600">$10,000</span>
                  </div>
                </div>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors text-sm">
                  Calculate
                </button>
              </div>
            </div>
            
            {/* Support & Training Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🎓 Support & Training</h3>
              <p className="text-gray-600 mb-4">
                Get expert support and improve your partnership skills.
              </p>
              <div className="space-y-2">
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm">
                  Partner Support Chat
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors text-sm">
                  Sales Training Hub
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50 transition-colors text-sm">
                  Weekly Partner Call
                </button>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm">TechCorp deal closed - $18,500 commission earned</span>
                </div>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm">New referral: StartupXYZ entered proposal stage</span>
                </div>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm">Marketing materials updated for Q4 campaign</span>
                </div>
                <span className="text-xs text-gray-500">3 days ago</span>
              </div>
            </div>
          </div>
          
          {/* Beta Program Notice */}
          <div className="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">🚀 Elite Beta Partner Program</h3>
            <p className="text-purple-700 mb-4">
              You're part of our exclusive partner beta program! Help shape the future of our partnership platform.
            </p>
            <button className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors">
              Share Beta Feedback
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export const PartnershipPortal: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PartnershipDashboard />} />
      <Route path="*" element={<Navigate to="/partnership" replace />} />
    </Routes>
  );
};