import React from 'react';
import { PartnershipIntegrationTest } from '@/components/partnership/PartnershipIntegrationTest';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 text-orange-500">SISO Agency - System Tests</h1>
          <p className="text-gray-300">Validating app functionality and integrations</p>
        </div>
        
        {/* Basic App Test */}
        <div className="mb-8">
          <div className="p-8 bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Basic App Test</h2>
            <p className="mb-4">If you can see this page, the basic app rendering is working correctly.</p>
            <div className="p-4 bg-green-900/30 border border-green-500/20 rounded">
              <p className="text-green-400">
                ✅ This indicates that the routing system can render components properly.
              </p>
            </div>
          </div>
        </div>

        {/* Partnership Integration Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-4 text-orange-500">Partnership Program Integration Test</h2>
          <PartnershipIntegrationTest />
        </div>
      </div>
    </div>
  );
}
