import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AgentHubPage } from './components/native/AgentHubPage';
import { SimpleProjectSelector } from './components/SimpleProjectSelector';
import { EnterBehaviorProvider } from './contexts/EnterBehaviorContext';
import './App.css';

function App() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  return (
    <BrowserRouter>
      <EnterBehaviorProvider>
        {!selectedProject ? (
          <SimpleProjectSelector onProjectSelect={setSelectedProject} />
        ) : (
          <div className="h-screen w-screen overflow-hidden">
            <AgentHubPage projectPath={selectedProject} />
          </div>
        )}
      </EnterBehaviorProvider>
    </BrowserRouter>
  );
}

export default App
