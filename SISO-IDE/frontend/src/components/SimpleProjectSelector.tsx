import { FolderIcon, CodeBracketIcon, CommandLineIcon, CpuChipIcon, BeakerIcon, PlusIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface SimpleProjectSelectorProps {
  onProjectSelect: (path: string) => void;
}

export function SimpleProjectSelector({ onProjectSelect }: SimpleProjectSelectorProps) {
  const mockProjects = [
    { 
      name: 'SISO-IDE', 
      path: '/Users/shaansisodia/DEV/SISO-IDE',
      description: 'Beautiful IDE for Claude Code',
      icon: CodeBracketIcon,
      color: 'from-blue-500/20 to-purple-500/20',
      borderColor: 'hover:border-blue-500/50'
    },
    { 
      name: 'claude-code-by-agents', 
      path: '/Users/shaansisodia/DEV/claude-code-by-agents',
      description: 'Multi-agent development workspace',
      icon: CpuChipIcon,
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'hover:border-green-500/50'
    },
    { 
      name: 'agentrooms-ui', 
      path: '/Users/shaansisodia/DEV/agentrooms-ui',
      description: 'React component library',
      icon: BeakerIcon,
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'hover:border-purple-500/50'
    },
    { 
      name: 'SISO-INTERNAL', 
      path: '/Users/shaansisodia/DEV/SISO-INTERNAL',
      description: 'Internal tools and utilities',
      icon: CommandLineIcon,
      color: 'from-orange-500/20 to-red-500/20',
      borderColor: 'hover:border-orange-500/50'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-white/10">
              <SparklesIcon className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
            SISO-IDE
          </h1>
          <p className="text-gray-400 text-lg">Select a project to start coding with Claude</p>
        </div>
        
        {/* Projects Grid */}
        <div className="space-y-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-2">
            Recent Projects
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockProjects.map((project) => {
              const Icon = project.icon;
              return (
                <button
                  key={project.path}
                  onClick={() => onProjectSelect(project.path)}
                  className={`group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 ${project.borderColor} rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50 hover:bg-gray-800/80`}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                  
                  <div className="relative flex items-start space-x-5">
                    <div className={`p-4 bg-gradient-to-br ${project.color} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-white text-xl mb-2 group-hover:text-white transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-3 group-hover:text-gray-300 transition-colors">
                        {project.description}
                      </p>
                      <p className="text-xs text-gray-500 font-mono truncate group-hover:text-gray-400 transition-colors">
                        {project.path}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Browse Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => {
              const path = prompt('Enter project path:');
              if (path) onProjectSelect(path);
            }}
            className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Browse for Project</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 text-sm">
            Powered by Claude Code • Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">⌘K</kbd> for shortcuts
          </p>
        </div>
      </div>
    </div>
  );
}