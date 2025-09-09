
import React from 'react';

// Define proper interface for component props
interface NetworkingHeaderProps {
  title?: string;
  description?: string;
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
}

export const NetworkingHeader: React.FC<NetworkingHeaderProps> = ({
  title,
  description,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="pb-4 mb-6 border-b">
      <h2 className="text-2xl font-bold">{title || "Networking"}</h2>
      <p className="text-muted-foreground">
        {description || "Connect with other users and expand your professional network."}
      </p>
    </div>
  );
};
