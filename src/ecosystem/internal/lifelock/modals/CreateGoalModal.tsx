import React from 'react';

/**
 * CreateGoalModal Component
 * 
 * Simple modal for creating new goals.
 * Created to fix missing import in AdminLifeLock.tsx
 */

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Create New Goal</h2>
        <p className="text-gray-600 mb-4">Goal creation functionality coming soon...</p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};