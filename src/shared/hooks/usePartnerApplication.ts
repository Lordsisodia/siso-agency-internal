// Partnership Application Hook
// Handles partner application submission with loading states and validation

import { useState } from 'react';
import { toast } from 'sonner';
import { submitPartnerApplication, getApplicationStatus } from '@/api/partnership';
import type { PartnerApplicationData, PartnerApplication } from '@/types/partnership';

interface UsePartnerApplicationReturn {
  isSubmitting: boolean;
  isCheckingStatus: boolean;
  submitApplication: (data: PartnerApplicationData) => Promise<boolean>;
  checkApplicationStatus: (email: string) => Promise<PartnerApplication | null>;
  applicationStatus: PartnerApplication | null;
  error: string | null;
  clearError: () => void;
}

export function usePartnerApplication(): UsePartnerApplicationReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<PartnerApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const submitApplication = async (data: PartnerApplicationData): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation
      if (!data.name || !data.email || !data.networkDescription) {
        throw new Error('Please fill in all required fields');
      }

      if (!data.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (data.expectedReferrals < 1) {
        throw new Error('Expected referrals must be at least 1');
      }

      const response = await submitPartnerApplication(data);

      if (response.success) {
        toast.success('Application submitted successfully!', {
          description: 'We\'ll review your application and get back to you within 24 hours.'
        });
        
        // Set the application status for immediate display
        if (response.data) {
          setApplicationStatus(response.data);
        }
        
        return true;
      } else {
        throw new Error(response.error || 'Failed to submit application');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast.error('Application submission failed', {
        description: errorMessage
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkApplicationStatus = async (email: string): Promise<PartnerApplication | null> => {
    setIsCheckingStatus(true);
    setError(null);

    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      const response = await getApplicationStatus(email);

      if (response.success) {
        setApplicationStatus(response.data);
        
        if (response.data) {
          toast.success('Application found!', {
            description: `Status: ${response.data.status.charAt(0).toUpperCase() + response.data.status.slice(1)}`
          });
        } else {
          toast.info('No application found', {
            description: 'No application found for this email address.'
          });
        }
        
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to check application status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast.error('Status check failed', {
        description: errorMessage
      });
      
      return null;
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return {
    isSubmitting,
    isCheckingStatus,
    submitApplication,
    checkApplicationStatus,
    applicationStatus,
    error,
    clearError
  };
}