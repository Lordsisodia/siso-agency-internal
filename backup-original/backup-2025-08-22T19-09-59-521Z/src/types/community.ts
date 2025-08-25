
export interface CommunityMember {
  id: string;
  name: string;
  description?: string;
  member_type?: string;
  youtube_url?: string;
  youtube_videos?: { title: string; url: string; thumbnailUrl?: string; }[] | null;
  website_url?: string;
  specialization?: string[];
  content_themes?: string[];
  profile_image_url?: string;
  platform?: string;
  member_count?: number | null;
  join_url?: string | null;
  points?: number;
  rank?: string | null;
  contribution_count?: number;
  referral_count?: number;
  slug: string;
}
