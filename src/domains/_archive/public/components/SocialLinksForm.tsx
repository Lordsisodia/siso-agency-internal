import React from 'react';

export const SocialLinksForm: React.FC<{ userId?: string }> = () => (
  <div className="space-y-3 text-sm text-muted-foreground">
    <p>Social links form placeholder.</p>
    <input className="w-full border rounded p-2" placeholder="LinkedIn URL" />
    <input className="w-full border rounded p-2" placeholder="Twitter URL" />
    <button className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
  </div>
);

export default SocialLinksForm;
