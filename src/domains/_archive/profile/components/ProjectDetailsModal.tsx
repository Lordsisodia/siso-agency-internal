import React from 'react';

export const ProjectDetailsModal: React.FC<{ open?: boolean; onClose?: () => void }>
  = ({ open = false, onClose }) => (
  open ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white text-black p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Project Details</h3>
        <p className="text-sm text-gray-600">Placeholder content</p>
        <button className="mt-3 px-3 py-1 bg-blue-600 text-white rounded" onClick={onClose}>Close</button>
      </div>
    </div>
  ) : null
);

export default ProjectDetailsModal;
