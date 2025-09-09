# User Flow Diagram with React Flow

This directory contains the implementation of the User Flow Diagram feature using React Flow, a powerful library for building interactive node-based diagrams.

## Current Implementation Status

The User Flow feature is being implemented in phases:

1. **Phase 1 (Current)**: Basic setup with React Flow integration
2. **Phase 2 (Upcoming)**: Enhanced features like customized nodes and interaction
3. **Phase 3 (Future)**: Advanced features like collaboration and analysis tools

Currently, there's a toggle that allows you to switch between the placeholder "Coming Soon" message and the actual React Flow implementation preview.

## Getting Started

The React Flow implementation is ready to be activated. To enable it by default:

1. Run the provided script:
   ```bash
   ./scripts/enable-reactflow.sh
   ```

2. Or manually update the UserFlowDiagram.tsx file to set `showImplementation` to `true` by default.

## Components Overview

The User Flow Diagram consists of several key components:

- **UserFlowDiagram.tsx**: The main container component that toggles between the placeholder and the implementation
- **ReactFlowImplementation.tsx**: The actual React Flow integration
- **Nodes/**:
  - **ScreenNode.tsx**: Component for displaying app screens/pages
  - **ActionNode.tsx**: Component for displaying user actions (button clicks, form submissions)
  - **DecisionNode.tsx**: Component for displaying conditional logic in the flow

## Custom Node Types

The implementation includes three custom node types:

### ScreenNode
Represents screens in your application. Properties:
- `label`: The name of the screen
- `status`: 'implemented', 'in-progress', or 'planned'
- `description`: Optional description of the screen
- `screenshot`: Optional screenshot URL

### ActionNode
Represents user actions. Properties:
- `label`: The name of the action
- `action`: Type of action (button_click, tap, form_submit)
- `description`: Optional description of the action

### DecisionNode
Represents conditional branching in the flow. Properties:
- `label`: The decision question
- `description`: Optional description of the decision logic

## Extending the Implementation

To add new functionality or node types:

1. Create a new node component in the `nodes/` directory
2. Add it to the `nodeTypes` object in `ReactFlowImplementation.tsx`
3. Update the data model in your API/backend to support the new node type

## API Integration (Future)

The current implementation uses mock data. To connect with your backend:

1. Update the data fetching logic in `ReactFlowImplementation.tsx`
2. Implement the save functionality to persist changes to your database
3. Add real-time collaboration features using WebSockets or similar technology

## Styling

The nodes use Tailwind CSS for styling. Key styling concepts:

- Node selected state: Highlighted with a colored ring
- Status indicators: Color-coded for different states
- Connections: Edge styling based on connection type
- Color theme: Consistent with the app's dark theme

## Troubleshooting

If you encounter issues with the React Flow implementation:

1. Check if reactflow is properly installed (`npm install reactflow`)
2. Ensure the CSS import is uncommented (`import 'reactflow/dist/style.css'`)
3. Verify that all node components are correctly imported
4. Check the browser console for any React Flow specific errors 