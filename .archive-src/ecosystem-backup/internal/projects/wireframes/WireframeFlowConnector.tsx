
import { ArrowRight } from "lucide-react";

interface Connection {
  from: string;
  to: string;
  label?: string;
}

interface WireframeFlowConnectorProps {
  connections: Connection[];
  wireframes: Array<{ id: string; title: string }>;
  onNavigate: (wireframeId: string) => void;
}

export function WireframeFlowConnector({ connections, wireframes, onNavigate }: WireframeFlowConnectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">User Flow Connections</h3>
      <div className="space-y-2">
        {connections.map((connection, index) => {
          const fromWireframe = wireframes.find(w => w.id === connection.from);
          const toWireframe = wireframes.find(w => w.id === connection.to);
          
          if (!fromWireframe || !toWireframe) return null;
          
          return (
            <div 
              key={index} 
              className="flex items-center bg-black/20 border border-gray-800 p-3 rounded-lg"
            >
              <div 
                className="text-sm text-white cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => onNavigate(connection.from)}
              >
                {fromWireframe.title}
              </div>
              <div className="flex items-center mx-2 text-gray-500">
                <span className="text-xs mr-1">{connection.label}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
              <div 
                className="text-sm text-white cursor-pointer hover:text-purple-400 transition-colors"
                onClick={() => onNavigate(connection.to)}
              >
                {toWireframe.title}
              </div>
            </div>
          );
        })}
        
        {connections.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-500">No flow connections defined yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
