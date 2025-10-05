import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SOPDocumentationPage } from '@/components/partnership/SOPDocumentationPage';
import { partnershipSOPs } from '@/data/partnershipSOPs';

export default function LinkedInOutreachSOP() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/partner/clients');
  };

  return (
    <SOPDocumentationPage 
      sop={partnershipSOPs['linkedin-outreach-sop']} 
      onBack={handleBack}
    />
  );
}