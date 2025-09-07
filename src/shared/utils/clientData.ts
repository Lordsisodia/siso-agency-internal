// Utility functions for managing client data throughout the platform

import { AppPlanInput } from '@/types/appPlan.types';

export interface ClientProfile {
  company_name: string;
  project_description: string;
  industry: string;
  target_audience: string;
  communication_preference: 'chat' | 'voice' | 'phone';
  onboarding_completed: boolean;
  onboarding_date: string;
  contact_name: string;
  status: 'onboarded' | 'active' | 'paused';
  // Optional enhanced fields
  contact_email?: string;
  contact_phone?: string;
  company_size?: string;
  budget?: string;
  timeline?: string;
}

/**
 * Interface for business onboarding data
 */
export interface BusinessOnboardingData {
  businessName: string;
  appPurpose: string;
  industry: string;
  targetAudience: string;
  communicationPreference?: 'email' | 'phone' | 'chat' | 'voice';
  budget?: string;
  timeline?: string;
  moreInfo?: string;
}

/**
 * Storage key for business onboarding data
 */
const BUSINESS_DATA_KEY = 'business-onboarding-data';

/**
 * Save business onboarding data to localStorage
 */
export function saveBusinessOnboardingData(data: AppPlanInput | BusinessOnboardingData): void {
  try {
    localStorage.setItem(BUSINESS_DATA_KEY, JSON.stringify(data));
    console.log('Business data saved successfully:', data.businessName);
  } catch (error) {
    console.error('Error saving business data:', error);
  }
}

/**
 * Get business onboarding data from localStorage
 */
export function getBusinessOnboardingData(): BusinessOnboardingData | null {
  try {
    const data = localStorage.getItem(BUSINESS_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving business data:', error);
    return null;
  }
}

/**
 * Clear business onboarding data from localStorage
 */
export function clearBusinessOnboardingData(): void {
  try {
    localStorage.removeItem(BUSINESS_DATA_KEY);
    console.log('Business data cleared successfully');
  } catch (error) {
    console.error('Error clearing business data:', error);
  }
}

/**
 * Check if business onboarding data exists
 */
export function hasBusinessOnboardingData(): boolean {
  return !!getBusinessOnboardingData();
}

/**
 * Get the client profile from localStorage
 */
export const getClientProfile = (): ClientProfile | null => {
  try {
    const data = localStorage.getItem('client-profile');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading client profile:', error);
    return null;
  }
};

/**
 * Check if the user has completed onboarding
 */
export const hasCompletedOnboarding = (): boolean => {
  const profile = getClientProfile();
  return profile?.onboarding_completed || false;
};

/**
 * Get the client's preferred communication method
 */
export const getClientCommunicationPreference = (): 'chat' | 'voice' | 'phone' | null => {
  const profile = getClientProfile();
  return profile?.communication_preference || null;
};

/**
 * Get the client's company name for personalization
 */
export const getClientCompanyName = (): string | null => {
  const profile = getClientProfile();
  return profile?.company_name || null;
};

/**
 * Update the client profile with new data
 */
export const updateClientProfile = (updates: Partial<ClientProfile>): void => {
  try {
    const existing = getClientProfile() || {} as ClientProfile;
    const updated = { ...existing, ...updates };
    localStorage.setItem('client-profile', JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating client profile:', error);
  }
};

/**
 * Get client data formatted for display purposes
 */
export const getClientDisplayData = () => {
  const profile = getClientProfile();
  const onboardingData = getBusinessOnboardingData();
  
  if (!profile && !onboardingData) return null;
  
  return {
    companyName: profile?.company_name || onboardingData?.businessName || 'Your Company',
    projectDescription: profile?.project_description || onboardingData?.appPurpose || 'Your App Project',
    industry: profile?.industry || onboardingData?.industry || 'Technology',
    targetAudience: profile?.target_audience || onboardingData?.targetAudience || 'General Users',
    status: profile?.status || 'onboarded',
    onboardingCompleted: hasCompletedOnboarding(),
    communicationPreference: getClientCommunicationPreference() || 'chat'
  };
}; 