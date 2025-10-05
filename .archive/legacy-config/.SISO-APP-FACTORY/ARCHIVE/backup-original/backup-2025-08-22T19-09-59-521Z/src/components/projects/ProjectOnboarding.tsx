import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Mic, ArrowRight, Sparkles } from 'lucide-react';

// Extracted text constants to avoid parsing issues
const TEXT = {
  step1Title: "Create New Project",
  step2Title: "Project Description",
  step1Description: "Lets start by giving your project a name",
  step2Description: "Tell us briefly what you want to build",
};

export function ProjectOnboarding() {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleStartVoiceChat = () => {
    toast({
      title: 'Voice Assistant',
      description: 'Starting voice chat with SISO Assistant...',
    });
    
    // Simulate voice chat starting
    setTimeout(() => {
      navigate('/plan-builder');
    }, 1500);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!projectName.trim()) {
        toast({
          title: 'Project name required',
          description: 'Please enter a name for your project',
          variant: 'destructive',
        });
        return;
      }
      setStep(2);
    } else {
      // Save project data (in a real app, this would go to the backend)
      const projectData = {
        app_name: projectName,
        description: projectDescription,
        created_at: new Date().toISOString(),
        status: 'planning',
      };
      
      // Log for debugging - in a real app we would save to the database
      console.log('New project:', projectData);
      
      // Navigate to the assistant
      navigate('/plan-builder');
    }
  };

  const renderFirstStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="projectName" className="text-sm font-medium text-white">
          Project Name
        </label>
        <Input
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter project name (e.g., UbahCrypt)"
          className="bg-black/30 border-siso-text/10 focus-visible:ring-siso-orange/50"
        />
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/projects')}
          className="border-siso-text/20 hover:bg-siso-text/10 text-siso-text"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleNextStep}
          className="bg-siso-orange hover:bg-siso-orange/80"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderSecondStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="projectDescription" className="text-sm font-medium text-white">
          Project Description
        </label>
        <Textarea
          id="projectDescription"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder="Briefly describe what you want to build..."
          className="bg-black/30 border-siso-text/10 focus-visible:ring-siso-orange/50 min-h-[120px]"
        />
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-siso-text/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-black px-2 text-siso-text">or try one of these options</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline"
            className={isRecording 
              ? "border-siso-text/20 bg-siso-orange/20 text-siso-orange border-siso-orange/40 justify-start p-6 h-auto" 
              : "border-siso-text/20 hover:bg-siso-text/10 text-siso-text justify-start p-6 h-auto"}
            onClick={() => setIsRecording(!isRecording)}
          >
            <div className="flex items-center gap-3">
              <div className={isRecording ? "rounded-full p-2 bg-siso-orange/20" : "rounded-full p-2 bg-siso-text/10"}>
                <Mic className={isRecording ? "h-5 w-5 text-siso-orange" : "h-5 w-5 text-siso-text"} />
              </div>
              <div className="text-left">
                <div className="font-medium">Voice Description</div>
                <div className="text-xs text-siso-text">Describe your idea by speaking</div>
              </div>
            </div>
          </Button>
          
          <Button 
            variant="outline"
            className="border-siso-text/20 hover:bg-siso-text/10 text-siso-text justify-start p-6 h-auto"
            onClick={handleStartVoiceChat}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2 bg-siso-text/10">
                <Sparkles className="h-5 w-5 text-siso-text" />
              </div>
              <div className="text-left">
                <div className="font-medium">Talk to SISO Assistant</div>
                <div className="text-xs text-siso-text">Start with our AI assistant</div>
              </div>
            </div>
          </Button>
        </div>
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setStep(1)}
          className="border-siso-text/20 hover:bg-siso-text/10 text-siso-text"
        >
          Back
        </Button>
        <Button 
          onClick={handleNextStep}
          className="bg-siso-orange hover:bg-siso-orange/80"
        >
          Continue to Assistant
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Get the appropriate title and description based on current step
  const pageTitle = step === 1 ? TEXT.step1Title : TEXT.step2Title;
  const pageDescription = step === 1 ? TEXT.step1Description : TEXT.step2Description;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <Card className="p-6 md:p-8 bg-black/30 border border-siso-text/10">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {pageTitle}
            </h2>
            <p className="text-siso-text">
              {pageDescription}
            </p>
          </div>
          
          {step === 1 ? renderFirstStep() : renderSecondStep()}
        </div>
      </Card>
    </div>
  );
} 