import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SOPDocumentationPage } from '@/domains/partners/external/partnerships/hooks/pages/SOPDocumentationPage';
import { partnershipSOPs } from '@/lib/data/partnershipSOPs';

export default function InternalNetworkSOP() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/partner/clients');
  };

  return (
    <SOPDocumentationPage 
      sop={partnershipSOPs['internal-network-sop']} 
      onBack={handleBack}
    />
  );
}