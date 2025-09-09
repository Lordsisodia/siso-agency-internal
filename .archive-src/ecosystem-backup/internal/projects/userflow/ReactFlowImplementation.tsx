/**
 * DRAFT IMPLEMENTATION - TO BE USED IN NEXT UPDATE
 * 
 * This file contains a draft implementation of the ReactFlow integration
 * for the user flow visualization feature. It will be used in the next update.
 */

import { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  EdgeChange,
  MiniMap,
  Node,
  NodeChange,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  ReactFlowInstance,
} from 'reactflow';
// Import the reactflow styles
import 'reactflow/dist/style.css';

import { ScreenNode } from './nodes/ScreenNode';
import { ActionNode } from './nodes/ActionNode';
import { DecisionNode } from './nodes/DecisionNode';

// Custom node types
const nodeTypes = {
  screenNode: ScreenNode,
  actionNode: ActionNode,
  decisionNode: DecisionNode,
};

// Node color mapping by status
const nodeColors = {
  implemented: '#4ade80',  // green
  'in-progress': '#fb923c', // orange
  planned: '#94a3b8',      // slate
};

interface UserFlowDiagramProps {
  projectId: string;
  onNodeSelect?: (node: Node) => void;
  setIsLoading?: (loading: boolean) => void;
}

export function ReactFlowImplementation({ projectId, onNodeSelect, setIsLoading }: UserFlowDiagramProps) {
  // Sample initial data - would be loaded from API in real implementation
  const initialNodes: Node[] = [
    // Authentication Flow
    {
      id: 'screen-login',
      type: 'screenNode',
      position: { x: 0, y: 0 },
      data: { 
        label: 'Login Screen', 
        status: 'implemented',
        description: 'The first screen users see when opening the app',
        screenshot: null
      },
    },
    {
      id: 'action-login',
      type: 'actionNode',
      position: { x: 250, y: 0 },
      data: { 
        label: 'Login Button Click', 
        action: 'button_click',
        description: 'User clicks the login button after entering credentials'
      },
    },
    {
      id: 'decision-first-login',
      type: 'decisionNode',
      position: { x: 500, y: 0 },
      data: { 
        label: 'Is First Login?', 
        description: 'Check if this is the user\'s first login'
      },
    },
    {
      id: 'screen-onboarding',
      type: 'screenNode',
      position: { x: 750, y: 0 },
      data: { 
        label: 'Onboarding', 
        status: 'implemented',
        description: 'First-time user onboarding process',
        screenshot: null
      },
    },
    
    // Main Screens
    {
      id: 'screen-dashboard',
      type: 'screenNode',
      position: { x: 500, y: 150 },
      data: { 
        label: 'Dashboard', 
        status: 'implemented',
        description: 'Main dashboard showing market overview and portfolio',
        screenshot: null
      },
    },
    {
      id: 'screen-profile',
      type: 'screenNode',
      position: { x: 250, y: 150 },
      data: { 
        label: 'User Profile', 
        status: 'in-progress',
        description: 'Profile details and account settings',
        screenshot: null
      },
    },
    
    // Cryptocurrency Management
    {
      id: 'screen-wallet',
      type: 'screenNode',
      position: { x: 500, y: 300 },
      data: { 
        label: 'Wallet View', 
        status: 'implemented',
        description: 'View and manage crypto assets',
        screenshot: null
      },
    },
    {
      id: 'screen-trading',
      type: 'screenNode',
      position: { x: 750, y: 300 },
      data: { 
        label: 'Trading Interface', 
        status: 'in-progress',
        description: 'Buy, sell, or exchange cryptocurrencies',
        screenshot: null
      },
    },
    {
      id: 'action-transaction',
      type: 'actionNode',
      position: { x: 750, y: 450 },
      data: { 
        label: 'Create Transaction', 
        action: 'button_click',
        description: 'Initiate a crypto transaction'
      },
    },
    {
      id: 'decision-confirm',
      type: 'decisionNode',
      position: { x: 1000, y: 450 },
      data: { 
        label: 'Confirm Transaction?', 
        description: 'User confirms or cancels the transaction'
      },
    },
    
    // Advanced Features
    {
      id: 'screen-cross-chain',
      type: 'screenNode',
      position: { x: 250, y: 300 },
      data: { 
        label: 'Cross-Chain Operations', 
        status: 'planned',
        description: 'Transfer assets between different blockchains',
        screenshot: null
      },
    },
    {
      id: 'screen-contracts',
      type: 'screenNode',
      position: { x: 500, y: 450 },
      data: { 
        label: 'Smart Contracts', 
        status: 'planned',
        description: 'Deploy or interact with smart contracts',
        screenshot: null
      },
    },
    {
      id: 'screen-security',
      type: 'screenNode',
      position: { x: 0, y: 300 },
      data: { 
        label: 'Security Center', 
        status: 'in-progress',
        description: 'Enhanced security features and settings',
        screenshot: null
      },
    },
    {
      id: 'decision-security-verify',
      type: 'decisionNode',
      position: { x: 0, y: 150 },
      data: { 
        label: 'Security Verification', 
        description: 'Additional security checks for sensitive operations'
      },
    },
  ];

  const initialEdges: Edge[] = [
    // Authentication flow connections
    { id: 'e-login-action', source: 'screen-login', target: 'action-login', animated: true },
    { id: 'e-action-decision', source: 'action-login', target: 'decision-first-login' },
    { id: 'e-decision-onboarding', source: 'decision-first-login', target: 'screen-onboarding', label: 'Yes' },
    { id: 'e-decision-dashboard', source: 'decision-first-login', target: 'screen-dashboard', label: 'No' },
    { id: 'e-onboarding-dashboard', source: 'screen-onboarding', target: 'screen-dashboard' },
    
    // Dashboard connections
    { id: 'e-dashboard-profile', source: 'screen-dashboard', target: 'screen-profile' },
    { id: 'e-dashboard-wallet', source: 'screen-dashboard', target: 'screen-wallet' },
    { id: 'e-dashboard-trading', source: 'screen-dashboard', target: 'screen-trading' },
    
    // Profile connections
    { id: 'e-profile-security', source: 'screen-profile', target: 'screen-security' },
    
    // Wallet & Trading connections
    { id: 'e-wallet-cross-chain', source: 'screen-wallet', target: 'screen-cross-chain' },
    { id: 'e-wallet-contracts', source: 'screen-wallet', target: 'screen-contracts' },
    { id: 'e-trading-transaction', source: 'screen-trading', target: 'action-transaction' },
    { id: 'e-transaction-confirm', source: 'action-transaction', target: 'decision-confirm' },
    { id: 'e-confirm-wallet', source: 'decision-confirm', target: 'screen-wallet', label: 'Yes' },
    
    // Security connections
    { id: 'e-security-verify', source: 'screen-security', target: 'decision-security-verify' },
    { id: 'e-verify-profile', source: 'decision-security-verify', target: 'screen-profile', label: 'Pass' },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Handle when connections are created
  const onConnect = useCallback(
    (connection: Connection) => {
      // In a real implementation, we might want to prompt the user to add details about this connection
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    },
    [onNodeSelect]
  );

  // Save the flow
  const saveFlow = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      // In a real implementation, we would save this to the server
      console.log('Flow saved:', flow);
      // API call would go here
    }
  }, [reactFlowInstance]);

  // Initialize ReactFlow instance
  const onInit = useCallback((instance: ReactFlowInstance) => {
    console.log('ReactFlow initialized', instance);
    setReactFlowInstance(instance);
    
    // First resize the viewport to get the proper size
    instance.fitView({ padding: 0.2, includeHiddenNodes: true });
    
    // Then after short delay, fit the view again for good measure
    setTimeout(() => {
      instance.fitView({ padding: 0.25, duration: 800 });
      instance.zoomTo(0.8, { duration: 800 });
    }, 300);
    
  }, []);

  return (
    <div className="reactflow-wrapper" style={{ width: '100%', height: '100%', minHeight: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onInit={onInit}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
      >
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          nodeColor={(node) => {
            const status = node.data?.status || 'planned';
            return nodeColors[status];
          }}
        />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
} 