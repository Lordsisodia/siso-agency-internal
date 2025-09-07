// [Analysis] Enhanced ID extraction with validation and logging
export const extractVideoIdFromSlug = (slug: string): string => {
  if (!slug) {
    console.error('No slug provided to extract video ID');
    return '';
  }

  console.log('Extracting ID from slug:', slug); // Debug log
  
  // [Analysis] Match the last segment that looks like a YouTube ID (11-12 chars including possible hyphens)
  const matches = slug.match(/[A-Za-z0-9_-]{11,12}$/);
  
  if (!matches || !matches[0]) {
    console.error('Could not extract video ID from slug:', slug);
    return '';
  }

  const videoId = matches[0];
  console.log('Extracted video ID:', videoId); // Debug log
  
  return videoId;
};