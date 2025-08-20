# SISO-IDE

A streamlined IDE interface for Claude Code that provides a beautiful UI while maintaining all the power of command-line Claude.

## 🎯 Project Vision

Create a clean, efficient IDE for Claude Code that:
- **Beautiful UI**: Uses the elegant Agentrooms interface design
- **Simple & Fast**: No over-engineering - just what works
- **Full Claude Code Power**: Maintains all CLI features (hooks, MCP, etc.)
- **Project Management**: Easy switching between different projects
- **Chat History**: See all conversations in a sidebar
- **Real-time Streaming**: Live responses from Claude

## 🚀 Core Features (MVP)

### Phase 1: Foundation
- [ ] Agentrooms UI integrated and working
- [ ] Claude Code SDK integration
- [ ] Basic chat interface with streaming
- [ ] Project selector/switcher
- [ ] Chat history sidebar

### Phase 2: Core Functionality  
- [ ] Full hooks support
- [ ] MCP server integration
- [ ] File tree viewer
- [ ] Terminal integration
- [ ] Settings/configuration

### Phase 3: Enhancements
- [ ] Multi-tab support
- [ ] Theme customization
- [ ] Keyboard shortcuts
- [ ] Search across chats
- [ ] Export/import conversations

## 🏗️ Architecture

```
SISO-IDE/
├── agentrooms-ui/     # Beautiful UI components from Agentrooms
├── backend/           # Node.js/Express server
│   ├── claude/        # Claude Code SDK integration
│   ├── projects/      # Project management
│   └── api/           # REST/WebSocket endpoints
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/     # Main views
│   │   ├── features/  # Feature modules
│   │   └── shared/    # Shared utilities
│   └── public/
└── electron/          # Desktop app wrapper
```

## 🔧 Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Claude Code SDK
- **Desktop**: Electron (optional)
- **UI Components**: Agentrooms UI system
- **State**: Zustand or Context API
- **Streaming**: Server-Sent Events or WebSockets

## 🎨 Design Principles

1. **Keep It Simple**: Don't overcomplicate - focus on core functionality
2. **Use What Works**: Leverage Agentrooms' proven UI patterns
3. **Fast Iteration**: Get MVP working, then enhance
4. **User First**: Prioritize developer experience
5. **Claude Native**: Built specifically for Claude Code workflows

## 📋 Research & Inspiration

### Existing Solutions Analyzed:
- **Agentrooms**: Beautiful UI, multi-agent support, great layout
- **Continue.dev**: VSCode integration, clean interface
- **Cursor**: AI-first editor with great UX
- **Windsurf**: Modern IDE with AI integration
- **Zed AI**: Collaborative editor with AI assistant

### What We're Taking:
- Agentrooms' clean dark theme and component design
- Simple chat sidebar like Continue
- Project switching like VSCode
- Streaming responses like ChatGPT
- Keyboard shortcuts from traditional IDEs

### What We're Avoiding:
- Over-engineering the agent system
- Complex state management
- Too many features in v1
- Unnecessary abstractions

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Claude API key

### Installation
```bash
# Clone the repo
git clone [repo-url]
cd SISO-IDE

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your Claude API key to .env

# Start development
npm run dev
```

### Development
```bash
# Start backend
npm run backend:dev

# Start frontend
npm run frontend:dev

# Build for production
npm run build

# Run Electron app
npm run electron:dev
```

## 🗺️ Roadmap

### Week 1: Foundation
- [x] Set up project structure
- [x] Import Agentrooms UI components
- [ ] Create basic React app with routing
- [ ] Integrate Claude Code SDK
- [ ] Basic chat interface working

### Week 2: Core Features
- [ ] Project selector
- [ ] Chat history sidebar
- [ ] Streaming responses
- [ ] File tree viewer
- [ ] Basic settings

### Week 3: Polish
- [ ] Keyboard shortcuts
- [ ] Theme switching
- [ ] Error handling
- [ ] Performance optimization
- [ ] Documentation

### Future Ideas
- Voice input/output
- AI code review panel
- Integrated terminal
- Git integration
- Plugin system
- Collaborative features

## 🤝 Contributing

This is currently a personal project, but contributions are welcome!

## 📝 Notes

- Start simple, iterate fast
- Focus on developer experience
- Don't reinvent the wheel - use proven patterns
- Keep the UI clean and distraction-free
- Maintain full Claude Code compatibility

## 🔗 Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Agentrooms Repository](https://github.com/agentrooms/agentrooms)
- [Electron Documentation](https://www.electronjs.org/)
- [React Documentation](https://react.dev/)

---

**Current Status**: Setting up initial project structure with Agentrooms UI

**Next Steps**: Create React app skeleton and integrate UI components