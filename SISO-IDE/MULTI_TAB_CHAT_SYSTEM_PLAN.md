# 🚀 SISO IDE Multi-Tab Chat System - Design Plan

## 📋 Overview

Design a multi-tab chat system with a **right-side tab panel** to manage multiple Claude sessions simultaneously, allowing users to easily switch between conversations while maintaining context and state.

## 🎯 Requirements Analysis

### Current State
- **Single session focus**: Only one chat session active at a time
- **Left sidebar**: Projects and sessions list for selection
- **Main content**: Single chat interface
- **URL routing**: `/session/:sessionId` for direct access
- **Session protection**: Prevents interruption during active conversations

### Desired State
- **Multiple active sessions**: Up to 6 concurrent chat sessions
- **Right-side tab panel**: Quick navigation between active sessions
- **Tab management**: Easy opening, closing, and switching
- **Visual indicators**: Session status (running, completed, error)
- **Session persistence**: Maintain state across tabs
- **Non-breaking**: Preserve existing functionality

## 🏗️ Architecture Design

### 1. **Layout Structure**
```
┌─────────────┬──────────────────────┬─────────────┐
│   Sidebar   │     Main Content     │  Tab Panel  │
│             │                      │             │
│ Projects &  │   Active Chat        │  Session    │
│ Sessions    │   Interface          │  Tabs       │
│             │                      │             │
│ - horizon   │ ┌─────────────────┐  │ ┌─────────┐ │
│ - mallocra  │ │ Claude Response │  │ │ Tab 1   │ │
│ - SISO      │ │                 │  │ │ ✓ Done  │ │
│             │ └─────────────────┘  │ ├─────────┤ │
│             │                      │ │ Tab 2   │ │
│             │ [Input Area]         │ │ ⏳ Run   │ │
│             │                      │ ├─────────┤ │
│             │                      │ │ + New   │ │
│             │                      │ └─────────┘ │
└─────────────┴──────────────────────┴─────────────┘
```

### 2. **State Management Architecture**

#### **Active Sessions Store**
```javascript
// New state structure
const [activeTabs, setActiveTabs] = useState([
  {
    id: 'tab-1',
    sessionId: 'session-123',
    projectId: 'horizon-energi',
    title: 'API Integration',
    status: 'completed', // 'idle', 'running', 'completed', 'error'
    isActive: true,
    messages: [...],
    lastActivity: timestamp,
    provider: 'claude' // or 'cursor'
  }
]);

const [activeTabId, setActiveTabId] = useState('tab-1');
```

#### **Integration Points**
- **App.jsx**: Add activeTabs state management
- **MainContent.jsx**: Render active tab content
- **New Component**: `ActiveSessionsPanel.jsx` for right-side tabs
- **ChatInterface.jsx**: Work with active tab context

### 3. **Tab Panel Component Design**

#### **ActiveSessionsPanel.jsx**
```jsx
const ActiveSessionsPanel = ({
  activeTabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
  maxTabs = 6
}) => {
  return (
    <div className="w-64 bg-card border-l border-border">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h3>Active Sessions</h3>
        <button onClick={onNewTab} disabled={activeTabs.length >= maxTabs}>
          + New Tab
        </button>
      </div>
      
      {/* Tab List */}
      <div className="space-y-1 p-2">
        {activeTabs.map(tab => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onSelect={() => onTabSelect(tab.id)}
            onClose={() => onTabClose(tab.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

#### **Tab Item Design**
```jsx
const TabItem = ({ tab, isActive, onSelect, onClose }) => {
  const statusIcon = {
    idle: '⚪',
    running: '⏳',
    completed: '✅',
    error: '❌'
  };
  
  return (
    <div className={`siso-card p-3 cursor-pointer ${isActive ? 'siso-nav-item active' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0" onClick={onSelect}>
          <div className="flex items-center gap-2">
            <span className="text-sm">{statusIcon[tab.status]}</span>
            <span className="font-medium truncate">{tab.title}</span>
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">
            {tab.projectId}
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="ml-2 text-xs opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
```

## 🔄 User Flow & Interactions

### **Opening New Tabs**
1. **From Sidebar**: Click session → "Open in New Tab" option
2. **From Tab Panel**: Click "+ New Tab" → Shows session selector
3. **From Current Chat**: "Duplicate Session" action
4. **URL Navigation**: Direct session links open in new tab if under limit

### **Tab Management**
1. **Switch Tabs**: Click tab in right panel
2. **Close Tabs**: X button on each tab
3. **Reorder Tabs**: Drag & drop (future enhancement)
4. **Tab Overflow**: Scroll or collapse when >6 tabs

### **Status Indicators**
- **⚪ Idle**: No active conversation
- **⏳ Running**: Claude is processing/responding
- **✅ Completed**: Last response finished successfully
- **❌ Error**: Error in last response
- **🔄 Waiting**: Waiting for user input

## 💾 State Persistence & Memory

### **Session State Management**
```javascript
// Each tab maintains its own state
const tabState = {
  messages: [], // Chat history
  inputValue: '', // Current input
  context: {}, // Session context
  wsConnection: null, // WebSocket if active
  scrollPosition: 0, // Preserve scroll
  lastSeen: timestamp // For unread indicators
};
```

### **Storage Strategy**
- **sessionStorage**: Active tab states (survives page refresh)
- **localStorage**: Tab preferences and layouts
- **WebSocket**: Real-time session updates
- **Memory**: Active conversation states

## 🎨 UI/UX Design Elements

### **Tab Panel Styling**
```css
.active-sessions-panel {
  width: 256px; /* 16rem */
  background: hsl(var(--card));
  border-left: 1px solid hsl(var(--border));
  max-height: 100vh;
  overflow-y: auto;
}

.tab-item {
  transition: all 0.2s ease;
  border-radius: 6px;
  margin: 2px;
}

.tab-item:hover {
  background: hsl(var(--accent));
}

.tab-item.active {
  background: hsl(var(--siso-orange));
  color: hsl(var(--siso-black));
}

.status-indicator {
  animation: pulse 2s infinite;
}
```

### **Mobile Considerations**
- **Collapsible Panel**: Hide on mobile, show as overlay
- **Bottom Tabs**: Alternative mobile layout with tabs at bottom
- **Swipe Navigation**: Swipe between tabs on mobile
- **Touch Targets**: Larger tap areas for mobile

## 🔧 Implementation Strategy

### **Phase 1: Core Architecture** (Week 1)
1. **State Management**: Add activeTabs state to App.jsx
2. **Tab Panel Component**: Create ActiveSessionsPanel.jsx
3. **Layout Integration**: Add panel to MainContent.jsx
4. **Basic Tab Operations**: Open, close, switch tabs

### **Phase 2: Session Integration** (Week 2)
1. **Session Linking**: Connect tabs to existing sessions
2. **WebSocket Handling**: Manage multiple WS connections
3. **Message Persistence**: Maintain chat history per tab
4. **URL Routing**: Update routing for multi-tab support

### **Phase 3: Polish & Features** (Week 3)
1. **Status Indicators**: Real-time status updates
2. **Tab Titles**: Smart title generation from conversation
3. **Keyboard Shortcuts**: Ctrl+T, Ctrl+W, Ctrl+Tab navigation
4. **Persistence**: Save/restore tab states

### **Phase 4: Mobile & UX** (Week 4)
1. **Mobile Layout**: Responsive tab management
2. **Performance**: Optimize for multiple sessions
3. **Accessibility**: Screen reader support, focus management
4. **Polish**: Animations, transitions, micro-interactions

## 🚨 Technical Considerations

### **Memory Management**
- **Lazy Loading**: Only load visible tab content
- **Message Limits**: Cap message history per tab (last 100 messages)
- **Cleanup**: Dispose inactive tabs after timeout
- **WebSocket Limits**: Pool connections efficiently

### **State Synchronization**
- **Session Protection**: Extend to multiple active sessions
- **Conflict Resolution**: Handle simultaneous tab updates
- **WebSocket Management**: Route messages to correct tabs
- **URL State**: Sync active tab with URL

### **Performance Optimization**
- **Virtual Scrolling**: For large message histories
- **Memoization**: Prevent unnecessary re-renders
- **Code Splitting**: Lazy load tab panel component
- **Debouncing**: Input handling across tabs

## 🎯 Success Metrics

### **Functionality**
- ✅ Open up to 6 concurrent chat sessions
- ✅ Switch between tabs smoothly (< 100ms)
- ✅ Maintain conversation state across switches
- ✅ Visual status indicators work correctly
- ✅ Mobile experience remains usable

### **User Experience**
- ✅ Intuitive tab management
- ✅ Clear visual feedback for all actions
- ✅ No breaking of existing functionality
- ✅ Keyboard navigation support
- ✅ Consistent SISO branding (black/orange)

### **Technical**
- ✅ Memory usage < 200MB with 6 active tabs
- ✅ No memory leaks after extended use
- ✅ WebSocket connections properly managed
- ✅ State persistence works across page refreshes

## 🔄 Migration Strategy

### **Backward Compatibility**
- **Existing URLs**: `/session/:sessionId` still works
- **Single Session Mode**: Default behavior unchanged
- **Gradual Rollout**: Feature flag to enable multi-tabs
- **Fallback Mode**: Disable if performance issues

### **Data Migration**
- **No Breaking Changes**: Existing session data unchanged
- **Progressive Enhancement**: New features additive only
- **Rollback Plan**: Easy disable without data loss

## 🚀 Next Steps

1. **✅ Get Approval**: Review this plan with stakeholders
2. **🔨 Start Phase 1**: Implement core tab architecture
3. **🧪 Test Early**: Build working prototype quickly
4. **🔄 Iterate**: Refine based on user feedback
5. **🚀 Deploy**: Roll out gradually with feature flags

---

This multi-tab system will transform SISO IDE into a powerful multi-session environment while maintaining the clean, intuitive interface users expect! 🎉