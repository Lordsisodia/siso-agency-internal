import React, { ReactNode } from 'react';

interface PartnerAuthFormProps {
  type: 'login' | 'register' | 'reset';
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  errors: Record<string, string>;
  children: ReactNode;
}

export function PartnerAuthForm({ 
  type, 
  onSubmit, 
  isLoading, 
  errors, 
  children 
}: PartnerAuthFormProps) {
  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
      </form>
    </div>
  );
} 