
import { BasicInfo } from './BasicInfo';
import { BusinessInfo } from './BusinessInfo';
import { InterestsBio } from './InterestsBio';
import { SocialMediaLinks } from './SocialMediaLinks';

interface ProfileInfoProps {
  email: string | null;
  fullName: string | null;
  points: number;
  rank: string;
  businessName?: string | null;
  businessType?: string | null;
  industry?: string | null;
  interests?: string[] | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
  professionalRole?: string | null;
  isEditing: boolean;
  formData: {
    fullName: string;
    businessName: string;
    businessType: string;
    industry: string;
    interests: string;
    bio: string;
    linkedinUrl: string;
    websiteUrl: string;
    youtubeUrl: string;
    instagramUrl: string;
    twitterUrl: string;
    professionalRole: string;
  };
  onFormChange: (field: string, value: string) => void;
}

export const ProfileInfo = ({
  email,
  fullName,
  professionalRole,
  businessName,
  businessType,
  industry,
  interests,
  bio,
  linkedinUrl,
  websiteUrl,
  youtubeUrl,
  instagramUrl,
  twitterUrl,
  isEditing,
  formData,
  onFormChange,
}: ProfileInfoProps) => {
  return (
    <div className="grid gap-6">
      <BasicInfo
        email={email}
        fullName={fullName}
        professionalRole={professionalRole}
        isEditing={isEditing}
        formData={formData}
        onFormChange={onFormChange}
      />

      <BusinessInfo
        businessName={businessName}
        businessType={businessType}
        industry={industry}
        isEditing={isEditing}
        formData={formData}
        onFormChange={onFormChange}
      />

      <InterestsBio
        interests={interests}
        bio={bio}
        isEditing={isEditing}
        formData={formData}
        onFormChange={onFormChange}
      />

      <SocialMediaLinks
        linkedinUrl={linkedinUrl}
        websiteUrl={websiteUrl}
        youtubeUrl={youtubeUrl}
        instagramUrl={instagramUrl}
        twitterUrl={twitterUrl}
        isEditing={isEditing}
        formData={formData}
        onFormChange={onFormChange}
      />
    </div>
  );
};
