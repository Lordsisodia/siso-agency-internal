import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SOPDocumentationPage } from '@/components/partnership/SOPDocumentationPage';
import { partnershipSOPs } from '@/data/partnershipSOPs';

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