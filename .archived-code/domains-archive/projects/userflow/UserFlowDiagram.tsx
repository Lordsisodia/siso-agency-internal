import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ActivitySquare, ArrowRightCircle, Workflow } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ReactFlowImplementation } from './ReactFlowImplementation';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

// Additional custom styles for ReactFlow
import './userflow.css';

// Simplified interface for the placeholder
interface UserFlowDiagramProps {
  projectId: string;
  onNodeSelect?: (node: any) => void;
  setIsLoading?: (loading: boolean) => void;
}

/**
 * REACT FLOW IMPLEMENTATION PLAN
 * 
 * Phase 1: Initial Setup (Next Update)
 * ------------------------------
 * 1. Add reactflow dependencies:
 *    - npm install reactflow
 *    - Add styles import for reactflow
 * 
 * 2. Create basic node types:
 *    - ScreenNode: Represents app screens/pages
 *    - ActionNode: Represents user actions (button press, form submit)
 *    - DecisionNode: Represents conditional paths in the flow
 * 
 * 3. Implement basic flow functionality:
 *    - Draggable nodes
 *    - Connection creation between nodes
 *    - Panning and zooming
 *    - Node selection
 * 
 * Phase 2: Enhanced Features
 * ------------------------------
 * 1. Add customized node styles:
 *    - Screen preview thumbnails in nodes
 *    - Color-coding for different node types
 *    - Status indicators (implemented, in progress, planned)
 * 
 * 2. Add interaction features:
 *    - Node detail panel when selecting nodes
 *    - Edit node properties
 *    - Add/remove connection
 *    - Minimap for navigation
 * 
 * 3. Create templates and presets:
 *    - Common user flow patterns (authentication, onboarding, etc.)
 *    - Quick-add node groups
 * 
 * Phase 3: Advanced Features
 * ------------------------------
 * 1. Implement collaboration features:
 *    - Real-time updates with multiple editors
 *    - Comments on nodes and connections
 *    - Version history
 * 
 * 2. Add analysis tools:
 *    - Path complexity analysis
 *    - Flow validation (orphaned nodes, dead ends)
 *    - User experience metrics
 * 
 * 3. Export and integration:
 *    - Export to PNG/PDF
 *    - Export to developer-friendly formats
 *    - Integration with other project sections
 */

// UserFlowDiagram component that can toggle between placeholder and implementation
export function UserFlowDiagram({ projectId, onNodeSelect, setIsLoading }: UserFlowDiagramProps) {
  // State to determine whether to show the placeholder or the actual implementation
  const [showImplementation, setShowImplementation] = useState(true);
  
  // Handle loading state if setIsLoading is provided
  if (setIsLoading) {
    // This ensures any parent component knows we're not actually loading
    setIsLoading(false);
  }

  // Mock data to be used with the actual ReactFlow implementation
  const initialNodes = [
    {
      id: 'screen-1',
      type: 'screenNode',
      data: { label: 'Login Screen', status: 'implemented' },
      position: { x: 250, y: 5 }
    },
    {
      id: 'screen-2',
      type: 'screenNode',
      data: { label: 'Dashboard', status: 'implemented' },
      position: { x: 250, y: 100 }
    },
    {
      id: 'screen-3',
      type: 'screenNode',
      data: { label: 'User Profile', status: 'in-progress' },
      position: { x: 250, y: 200 }
    },
    {
      id: 'action-1',
      type: 'actionNode',
      data: { label: 'Login Button Click', action: 'button_click' },
      position: { x: 100, y: 50 }
    }
  ];

  const initialEdges = [
    { id: 'e1-2', source: 'screen-1', target: 'screen-2' },
    { id: 'e2-3', source: 'screen-2', target: 'screen-3' }
  ];

  // If showing implementation, render the ReactFlowImplementation
  if (showImplementation) {
    return (
      <div className="h-full flex flex-col" style={{ minHeight: '800px' }}>
        <div className="flex items-center justify-end gap-2 p-2 bg-black/30 border-b border-white/10">
          <div className="flex items-center gap-2 ml-auto">
            <Label htmlFor="preview-mode" className="text-xs text-gray-400">Preview Mode</Label>
            <Switch
              id="preview-mode"
              checked={showImplementation}
              onCheckedChange={setShowImplementation}
            />
          </div>
        </div>
        <div className="flex-1 userflow-container" style={{ height: 'calc(100% - 40px)', minHeight: '750px' }}>
          <ReactFlowProvider>
            <ReactFlowImplementation 
              projectId={projectId}
              onNodeSelect={onNodeSelect}
              setIsLoading={setIsLoading}
            />
          </ReactFlowProvider>
        </div>
      </div>
    );
  }
  
  // Otherwise show the placeholder
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-end gap-2 p-2 bg-black/30 border-b border-white/10">
        <div className="flex items-center gap-2 ml-auto">
          <Label htmlFor="preview-mode" className="text-xs text-gray-400">Preview Mode</Label>
          <Switch
            id="preview-mode"
            checked={showImplementation}
            onCheckedChange={setShowImplementation}
          />
        </div>
      </div>
      <div className="flex-1 h-full rounded-lg border border-white/10 bg-gradient-to-b from-black/30 to-black/10 flex flex-col items-center justify-center py-16">
        <div className="max-w-xl text-center px-6">
          <div className="w-16 h-16 rounded-xl bg-indigo-900/30 text-indigo-400 flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
            <Workflow className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">User Flow Coming Soon</h2>
          
          <div className="mb-6">
            <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">Coming in Next Update</Badge>
          </div>
          
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            We're working on implementing a powerful flow diagram to visualize your app's user journey. This feature will be available in the next update.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-6 max-w-md mx-auto">
            <div className="bg-black/30 rounded p-3 border border-white/10">
              <h4 className="text-white text-sm font-medium mb-1">Map User Journeys</h4>
              <p className="text-xs text-gray-400">Visualize complete user flows and interactions</p>
            </div>
            
            <div className="bg-black/30 rounded p-3 border border-white/10">
              <h4 className="text-white text-sm font-medium mb-1">Screen Connections</h4>
              <p className="text-xs text-gray-400">Link screens together with logical transitions</p>
            </div>
            
            <div className="bg-black/30 rounded p-3 border border-white/10">
              <h4 className="text-white text-sm font-medium mb-1">Export Options</h4>
              <p className="text-xs text-gray-400">Share diagrams with your team in various formats</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/30"
            onClick={() => {
              setShowImplementation(true);
              toast({
                title: "Previewing Implementation",
                description: "You are now viewing the ReactFlow implementation preview.",
                duration: 5000,
              });
            }}
          >
            Preview Implementation
          </Button>
        </div>
      </div>
    </div>
  );
}
