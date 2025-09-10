/**
 * Component import test - verify all offline components can be imported
 */

import React from 'react';

// Test imports of all offline PWA components
async function testComponentImports() {
  console.log('🧪 Testing React component imports...\n');

  try {
    // Test 1: OfflineIndicator
    console.log('1. Testing OfflineIndicator import...');
    const { OfflineIndicator } = await import('@/shared/components/OfflineIndicator');
    console.log('✅ OfflineIndicator imported successfully');

    // Test 2: OfflineDemo
    console.log('2. Testing OfflineDemo import...');
    const OfflineDemo = (await import('@/shared/components/OfflineDemo')).default;
    console.log('✅ OfflineDemo imported successfully');

    // Test 3: PWATestSuite
    console.log('3. Testing PWATestSuite import...');
    const PWATestSuite = (await import('@/shared/components/PWATestSuite')).default;
    console.log('✅ PWATestSuite imported successfully');

    // Test 4: hybridLifelockApi
    console.log('4. Testing hybridLifelockApi import...');
    const { hybridLifelockApi } = await import('@/api/hybridLifelockApi');
    console.log('✅ hybridLifelockApi imported successfully');

    // Test 5: offlineLifelockApi
    console.log('5. Testing offlineLifelockApi import...');
    const { offlineLifelockApi } = await import('@/api/offlineLifelockApi');
    console.log('✅ offlineLifelockApi imported successfully');

    // Test 6: API methods availability
    console.log('6. Testing API methods...');
    const connectionStatus = hybridLifelockApi.getConnectionStatus();
    console.log(`✅ Connection status: ${connectionStatus.isOnline ? 'Online' : 'Offline'}`);

    console.log('\n🎉 All component imports successful!');
    return true;

  } catch (error) {
    console.error('❌ Component import failed:', error);
    return false;
  }
}

// Test component rendering capability
export const ComponentTest: React.FC = () => {
  React.useEffect(() => {
    testComponentImports();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-white mb-4">Component Import Test</h2>
      <p className="text-gray-400">Check browser console for test results...</p>
    </div>
  );
};

export default ComponentTest;