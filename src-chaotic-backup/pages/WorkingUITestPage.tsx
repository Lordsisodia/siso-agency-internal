/**
 * Working UI Test Page
 * 
 * Dedicated test environment for the restored working UI.
 * Access at: /working-ui-test
 * 
 * This page allows safe testing of:
 * - 5-button TaskActionButtons system
 * - Dark theme with orange accent
 * - Feature flag toggling
 * - All functionality isolated from main app
 */

import React from 'react';
import { WorkingUITest } from '@/components/working-ui/WorkingUITest';

const WorkingUITestPage: React.FC = () => {
  return <WorkingUITest />;
};

export default WorkingUITestPage;