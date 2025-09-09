import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SOPDocumentationPage } from '@/components/partnership/SOPDocumentationPage';
import { partnershipSOPs } from '@/data/partnershipSOPs';

export default function DirectReferralsSOP() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/partner/clients');
  };

  return (
    <SOPDocumentationPage 
      sop={partnershipSOPs['direct-referrals-sop']} 
      onBack={handleBack}
    />
  );
}