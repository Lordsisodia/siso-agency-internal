import { useState } from 'react';

interface ProfileInfoProps {
  email?: string;
  fullName?: string;
  points?: number;
  rank?: string;
  businessName?: string;
  businessType?: string;
  industry?: string;
  interests?: string[];
  bio?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  professionalRole?: string;
  isEditing?: boolean;
  formData?: Record<string, string>;
  onFormChange?: (field: string, value: string) => void;
}

export function ProfileInfo({
  email,
  fullName,
  points,
  rank,
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
  professionalRole,
  isEditing = false,
  formData,
  onFormChange
}: ProfileInfoProps) {
  const [localInterests, setLocalInterests] = useState(interests?.join(', ') || '');

  const handleInterestsChange = (value: string) => {
    setLocalInterests(value);
    onFormChange?.('interests', value);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Email</label>
          <p className="font-medium">{email}</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={formData?.fullName || fullName || ''}
              onChange={(e) => onFormChange?.('fullName', e.target.value)}
              className="w-full bg-siso-bg border border-siso-border rounded-md px-3 py-2 mt-1"
            />
          ) : (
            <p className="font-medium">{fullName}</p>
          )}
        </div>
      </div>

      {/* Points & Rank */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground">Points</label>
          <p className="font-medium text-siso-orange">{points?.toLocaleString()}</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Rank</label>
          <p className="font-medium">{rank}</p>
        </div>
      </div>

      {/* Business Info */}
      <div className="space-y-4">
        <h3 className="font-medium">Business Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Business Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData?.businessName || businessName || ''}
                onChange={(e) => onFormChange?.('businessName', e.target.value)}
                className="w-full bg-siso-bg border border-siso-border rounded-md px-3 py-2 mt-1"
              />
            ) : (
              <p className="font-medium">{businessName || '-'}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Business Type</label>
            {isEditing ? (
              <input
                type="text"
                value={formData?.businessType || businessType || ''}
                onChange={(e) => onFormChange?.('businessType', e.target.value)}
                className="w-full bg-siso-bg border border-siso-border rounded-md px-3 py-2 mt-1"
              />
            ) : (
              <p className="font-medium">{businessType || '-'}</p>
            )}
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Industry</label>
          {isEditing ? (
            <input
              type="text"
              value={formData?.industry || industry || ''}
              onChange={(e) => onFormChange?.('industry', e.target.value)}
              className="w-full bg-siso-bg border border-siso-border rounded-md px-3 py-2 mt-1"
            />
          ) : (
            <p className="font-medium">{industry || '-'}</p>
          )}
        </div>
      </div>

      {/* Professional Role */}
      <div>
        <label className="text-sm text-muted-foreground">Professional Role</label>
        {isEditing ? (
          <input
            type="text"
            value={formData?.professionalRole || professionalRole || ''}
            onChange={(e) => onFormChange?.('professionalRole', e.target.value)}
            className="w-full bg-siso-bg border border-siso-border rounded-md px-3 py-2 mt-1"
          />
        ) : (
          <p className="font-medium">{professionalRole || '-'}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label className="text-sm text-muted-foreground">Bio</label>
        {isEditing ? (
          <textarea
            value={formData?.bio || bio || ''}
            onChange={(e) => onFormChange?.('bio', e.target.value)}
            className="w-full bg-siso-bg border border-siso-border rounded-md px-3 py-2 mt-1 min-h-[100px]"
          />
        ) : (
          <p className="font-medium">{bio || '-'}</p>
        )}
      </div>

      {/* Interests */}
      <div>
        <label className="text-sm text-muted-foreground">Interests (comma-separated)</label>
        {isEditing ? (
          <input
            type="text"
            value={formData?.interests || localInterests}
            onChange={(e) => handleInterestsChange(e.target.value)}
            className="w-full bg-siso-bg border border-siso-border rounded-md px-3 py-2 mt-1"
            placeholder="e.g., AI, productivity, design"
          />
        ) : (
          <p className="font-medium">{interests?.join(', ') || '-'}</p>
        )}
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="font-medium">Social Links</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">LinkedIn</label>
            {isEditing ? (
              <input
                type="url"
                value={formData?.linkedinUrl || linkedinUrl || ''}
                onChange={(e) => onFormChange?.('linkedinUrl', e.target.value)}
                className="w-full bg-siso-bg border border-siso-border rounded-md px-3 py-2 mt-1"
              />
            ) : (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-siso-orange hover:underline">
                {linkedinUrl || '-'}
              </a>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Website</label>
            {isEditing ? (
              <input
                type="url"
                value={formData?.websiteUrl || websiteUrl || ''}
                onChange={(e) => onFormChange?.('websiteUrl', e.target.value)}
                className="w-full bg-siso-bg border border-siso-border rounded-md px-3 py-2 mt-1"
              />
            ) : (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-siso-orange hover:underline">
                {websiteUrl || '-'}
              </a>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">YouTube</label>
            {isEditing ? (
              <input
                type="url"
                value={formData?.youtubeUrl || youtubeUrl || ''}
                onChange={(e) => onFormChange?.('youtubeUrl', e.target.value)}
                className="w-full bg-siso-bg border border-siso-border rounded-md px-3 py-2 mt-1"
              />
            ) : (
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-siso-orange hover:underline">
                {youtubeUrl || '-'}
              </a>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Instagram</label>
            {isEditing ? (
              <input
                type="url"
                value={formData?.instagramUrl || instagramUrl || ''}
                onChange={(e) => onFormChange?.('instagramUrl', e.target.value)}
                className="w-full bg-siso-bg border border-siso-border rounded-md px-3 py-2 mt-1"
              />
            ) : (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-siso-orange hover:underline">
                {instagramUrl || '-'}
              </a>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Twitter</label>
            {isEditing ? (
              <input
                type="url"
                value={formData?.twitterUrl || twitterUrl || ''}
                onChange={(e) => onFormChange?.('twitterUrl', e.target.value)}
                className="w-full bg-siso-bg border border-siso-border rounded-md px-3 py-2 mt-1"
              />
            ) : (
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="text-siso-orange hover:underline">
                {twitterUrl || '-'}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
