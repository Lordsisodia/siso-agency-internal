
import React from 'react';
import { Link, FileText } from 'lucide-react';

interface LinkCellProps {
  url: string | null;
  label: string;
  icon?: 'link' | 'file';
}

export const LinkCell = ({ url, label, icon = 'link' }: LinkCellProps) => {
  if (!url) {
    return <span>-</span>;
  }

  return (
    <a 
      href={url} 
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:underline flex items-center"
    >
      {icon === 'file' ? (
        <FileText className="h-4 w-4 mr-1" />
      ) : (
        <Link className="h-4 w-4 mr-1" />
      )}
      {label}
    </a>
  );
};
