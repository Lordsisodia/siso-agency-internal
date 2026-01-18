import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SOPDocumentationPage } from '@/domains/agency/partners/external/partnerships/hooks/pages/SOPDocumentationPage';
import { partnershipSOPs } from '@/lib/data/partnershipSOPs';

export default function SocialMediaSOP() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/partner/clients');
  };

  return (
    <SOPDocumentationPage 
      sop={partnershipSOPs['social-media-sop']} 
      onBack={handleBack}
    />
  );
}