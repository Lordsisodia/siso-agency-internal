import React from 'react';
import { X } from 'lucide-react';

interface ProjectContextCardProps {
  selectedProject: string;
  isVisible: boolean;
  onClose: () => void;
  currentContext: string;
  onContextChange: (project: string, context: string) => void;
}

const ProjectContextCard: React.FC<ProjectContextCardProps> = ({
  selectedProject,
  isVisible,
  onClose,
  currentContext,
  onContextChange
}) => {
  if (!isVisible) return null;

  const getProjectDisplayName = (project: string) => {
    switch (project) {
      case 'siso-agency':
        return 'SISO Agency App';
      case 'ubahcrypt':
        return 'Ubahcrypt';
      case 'excursions':
        return 'We Are Excursions';
      case 'instagram':
        return 'Instagram Marketing';
      default:
        return 'Project';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {getProjectDisplayName(selectedProject)} Context
              </h2>
              <p className="text-white/80 text-sm">Set context for AI assistance</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Project Information
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Provide context about your current project to help the AI assistant understand your work better.
              </p>
            </div>

            <div>
              <textarea
                value={currentContext}
                onChange={(e) => onContextChange(selectedProject, e.target.value)}
                placeholder="Describe your project, goals, constraints, current status, tech stack, or any other relevant context..."
                className="w-full h-40 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {currentContext.length}/1000 characters
              </div>
              <div className="flex gap-3">
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <span>✓</span>
                  Auto-saved
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all duration-200 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectContextCard;