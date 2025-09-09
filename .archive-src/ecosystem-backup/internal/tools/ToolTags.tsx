import { Tool } from './types';

interface ToolTagsProps {
  tool: Tool;
}

export function ToolTags({ tool }: ToolTagsProps) {
  return (
    <div className="space-y-8">
      {tool.specialization && tool.specialization.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-siso-text-bold">Specializations</h2>
          <div className="flex flex-wrap gap-2">
            {tool.specialization.map((spec, index) => (
              <span 
                key={index}
                className="text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-siso-red/10 to-siso-orange/10 text-siso-text hover:from-siso-red/20 hover:to-siso-orange/20 transition-colors cursor-default"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {tool.content_themes && tool.content_themes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-siso-text-bold">Content Themes</h2>
          <div className="flex flex-wrap gap-2">
            {tool.content_themes.map((theme, index) => (
              <span 
                key={index}
                className="text-sm px-3 py-1.5 rounded-full bg-gradient-to-r from-siso-orange/10 to-siso-red/10 text-siso-orange hover:from-siso-orange/20 hover:to-siso-red/20 transition-colors cursor-default"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {tool.use_cases && tool.use_cases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-siso-text-bold">Use Cases</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tool.use_cases.map((useCase, index) => (
              <li 
                key={index} 
                className="flex items-center gap-2 text-siso-text bg-gradient-to-r from-siso-text/5 to-transparent p-3 rounded-lg"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-siso-red to-siso-orange" />
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}