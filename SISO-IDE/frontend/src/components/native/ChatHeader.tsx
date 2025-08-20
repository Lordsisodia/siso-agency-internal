import { Users, User, MoreHorizontal, Download, Trash2, BarChart3, Settings } from "lucide-react";
import { useState } from "react";
import { useAgentConfig } from "../../hooks/useAgentConfig";
import { UsageDashboardModal } from "../UsageDashboardModal";
import { SettingsModal } from "../SettingsModal";

interface ChatHeaderProps {
  currentMode: "group" | "agent";
  activeAgentId: string | null;
  onModeToggle: () => void;
}

const getAgentColor = (agentId: string) => {
  // Map agent IDs to CSS color variables, with fallback
  const colorMap: Record<string, string> = {
    "readymojo-admin": "var(--agent-admin)",
    "readymojo-api": "var(--agent-api)", 
    "readymojo-web": "var(--agent-web)",
    "peakmojo-kit": "var(--agent-kit)",
  };
  return colorMap[agentId] || "var(--claude-text-accent)";
};

export function ChatHeader({ currentMode, activeAgentId }: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { getAgentById } = useAgentConfig();
  const currentAgent = activeAgentId ? getAgentById(activeAgentId) : null;

  return (
    <div className="chat-header app-drag-region">
      <div className="chat-header-left app-no-drag">
        {currentMode === "group" ? (
          <>
            <div 
              className="chat-header-icon"
              style={{ background: "linear-gradient(135deg, var(--agent-admin), var(--agent-web))" }}
            >
              <Users size={12} />
            </div>
            <div className="chat-header-info">
              <h2>Agent Room</h2>
              <p>@mention to call out agents</p>
            </div>
          </>
        ) : (
          <>
            <div 
              className="chat-header-icon"
              style={{ backgroundColor: currentAgent ? getAgentColor(currentAgent.id) : "var(--claude-border)" }}
            >
              <User size={12} />
            </div>
            <div className="chat-header-info">
              <h2>{currentAgent?.name || "Select Agent"}</h2>
              <p>Agent Details</p>
            </div>
          </>
        )}
      </div>

      <div className="chat-header-actions app-no-drag">
        {/* Usage Button */}
        <button
          onClick={() => setShowUsageModal(true)}
          className="chat-header-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '13px',
            color: 'var(--claude-text-secondary)',
            backgroundColor: 'var(--claude-sidebar-hover)',
            borderRadius: '6px',
            border: '1px solid var(--claude-border)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--claude-sidebar-active)';
            e.currentTarget.style.borderColor = 'var(--claude-border-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--claude-sidebar-hover)';
            e.currentTarget.style.borderColor = 'var(--claude-border)';
          }}
        >
          <BarChart3 size={14} />
          <span>Usage</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="chat-header-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '13px',
            color: 'var(--claude-text-secondary)',
            backgroundColor: 'var(--claude-sidebar-hover)',
            borderRadius: '6px',
            border: '1px solid var(--claude-border)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--claude-sidebar-active)';
            e.currentTarget.style.borderColor = 'var(--claude-border-light)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--claude-sidebar-hover)';
            e.currentTarget.style.borderColor = 'var(--claude-border)';
          }}
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>

        {/* More Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="chat-header-button"
          >
            <MoreHorizontal size={14} />
          </button>

          {showMenu && (
            <div 
              className="chat-header-menu"
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: "8px",
                width: "200px",
                background: "var(--claude-message-bg)",
                border: "1px solid var(--claude-border)",
                borderRadius: "8px",
                padding: "4px",
                zIndex: 10,
                boxShadow: "var(--claude-shadow)"
              }}
            >
              <button 
                className="chat-header-button"
                style={{ 
                  width: "100%", 
                  justifyContent: "flex-start", 
                  gap: "8px", 
                  padding: "8px 12px",
                  fontSize: "13px"
                }}
              >
                <Download size={14} />
                Export Conversation
              </button>
              <button 
                className="chat-header-button"
                style={{ 
                  width: "100%", 
                  justifyContent: "flex-start", 
                  gap: "8px", 
                  padding: "8px 12px",
                  fontSize: "13px",
                  color: "var(--claude-error)"
                }}
              >
                <Trash2 size={14} />
                Clear History
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UsageDashboardModal isOpen={showUsageModal} onClose={() => setShowUsageModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </div>
  );
}