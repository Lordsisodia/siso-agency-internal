
import { useState, useRef, useEffect } from 'react';
import { PhasesNavigation } from './PhasesNavigation';
import { PlanHeader } from './PlanHeader';
import { PhaseSection } from './PhaseSection';
import { useProjectPlan } from '@/hooks/usePlanData';
import { Spinner } from '@/components/ui/spinner';

export function AppPlanSection() {
  const { data: projectPlan, isLoading, isError } = useProjectPlan();
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const phaseSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  useEffect(() => {
    // Set the initial active phase to the first one when data loads
    if (projectPlan?.phases && projectPlan.phases.length > 0) {
      const firstPhaseId = projectPlan.phases[0].id;
      setActivePhaseId(activePhaseId => activePhaseId || firstPhaseId);
    }
  }, [projectPlan]);

  // Scroll to the active phase section when activePhaseId changes
  useEffect(() => {
    if (activePhaseId) {
      const sectionRef = phaseSectionRefs.current[activePhaseId];
      if (sectionRef) {
        sectionRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activePhaseId]);

  const handleSectionRef = (id: string, ref: HTMLDivElement | null) => {
    phaseSectionRefs.current[id] = ref;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !projectPlan) {
    return (
      <div className="bg-black/30 rounded-lg border border-white/10 p-8 text-center">
        <h3 className="text-lg font-medium text-white mb-2">Error Loading Plan</h3>
        <p className="text-gray-400">
          We couldn't load the development plan. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PlanHeader 
        title={projectPlan.name} 
        description={projectPlan.description || 'Comprehensive development roadmap for your project.'} 
      />

      <div className="relative">
        <PhasesNavigation 
          phases={projectPlan.phases} 
          activePhaseId={activePhaseId || ''} 
          setActivePhaseId={setActivePhaseId} 
        />

        <div className="mt-8 space-y-12">
          {projectPlan.phases.map(phase => (
            <PhaseSection
              key={phase.id}
              id={phase.id}
              title={phase.title}
              description={phase.description}
              subsections={phase.subsections.map(subsection => ({
                id: subsection.id,
                title: subsection.title,
                content: subsection.content,
                actionableSteps: subsection.action_steps || [],
                expectedOutcomes: subsection.expected_outcomes || [],
                bestPractices: subsection.best_practices || [],
                notionUrl: subsection.notion_url
              }))}
              isActive={activePhaseId === phase.id}
              onSectionRef={handleSectionRef}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
