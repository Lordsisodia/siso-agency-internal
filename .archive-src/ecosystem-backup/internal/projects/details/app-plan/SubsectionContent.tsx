
import { ExternalLink } from 'lucide-react';

export interface SubsectionContentProps {
  subsection: {
    id: string;
    title: string;
    content: string;
    actionableSteps?: string[];
    expectedOutcomes?: string[];
    bestPractices?: string[];
    notionUrl?: string;
  };
}

export function SubsectionContent({ subsection }: SubsectionContentProps) {
  return (
    <div className="space-y-4">
      <div className="text-neutral-300">
        {subsection.content}
      </div>
      
      {subsection.actionableSteps && subsection.actionableSteps.length > 0 && (
        <div className="bg-[#FF5722]/5 border border-[#FF5722]/20 p-4 rounded-md mt-4">
          <h5 className="text-md font-medium text-[#FF5722] mb-2 flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            Actionable Steps
          </h5>
          <ul className="list-disc pl-5 space-y-2 text-neutral-300 text-sm">
            {subsection.actionableSteps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </div>
      )}
      
      {subsection.expectedOutcomes && subsection.expectedOutcomes.length > 0 && (
        <div className="bg-black/30 p-4 rounded-md">
          <h5 className="text-md font-medium text-[#FF5722] mb-2">Expected Outcomes:</h5>
          <ul className="list-disc pl-5 space-y-1 text-neutral-300 text-sm">
            {subsection.expectedOutcomes.map((outcome, idx) => (
              <li key={idx}>{outcome}</li>
            ))}
          </ul>
          
          <div className="mt-4 flex items-center justify-end">
            <a 
              href={subsection.notionUrl || `https://notion.io/ubahcrypt-${subsection.id.slice(0, 8)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-[#FF5722] hover:text-[#FF7A50] transition-colors"
            >
              <span>View Notion Document</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
      
      {subsection.bestPractices && subsection.bestPractices.length > 0 && (
        <div className="bg-[#FF5722]/5 border border-[#FF5722]/20 p-4 rounded-md mt-4">
          <h5 className="text-md font-medium text-[#FF5722] mb-2">Best Practices:</h5>
          <ul className="list-disc pl-5 space-y-1 text-neutral-300 text-sm">
            {subsection.bestPractices.map((practice, idx) => (
              <li key={idx}>{practice}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
