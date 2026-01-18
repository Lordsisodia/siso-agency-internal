import React from 'react';

export interface ProfileInfoProps {
  name?: string;
  email?: string;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ name = 'User', email = '' }) => (
  <div className="rounded border p-4 bg-card text-card-foreground">
    <div className="font-semibold">{name}</div>
    <div className="text-sm text-muted-foreground">{email}</div>
  </div>
);

export default ProfileInfo;
