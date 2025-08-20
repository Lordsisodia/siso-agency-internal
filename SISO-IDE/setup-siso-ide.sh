#!/bin/bash

# 🚀 SISO IDE Setup Script
# Transforms Claude Code UI into your custom SISO IDE

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║            SISO IDE - Setup & Integration                ║"
echo "║        Mobile-First AI Development Environment          ║"
echo "╚══════════════════════════════════════════════════════════╝"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SISO_IDE_DIR="/Users/shaansisodia/DEV/SISO-IDE"
CORE_DIR="${SISO_IDE_DIR}/siso-ide-core"

# Navigate to SISO IDE directory
echo -e "${BLUE}📁 Navigating to SISO IDE directory...${NC}"
cd ${SISO_IDE_DIR}

# Check if siso-ide-core exists
if [ ! -d "siso-ide-core" ]; then
    echo -e "${YELLOW}📦 Cloning Claude Code UI as foundation...${NC}"
    git clone https://github.com/siteboon/claudecodeui siso-ide-core
else
    echo -e "${GREEN}✅ SISO IDE core already exists${NC}"
fi

cd ${CORE_DIR}

# Setup git remotes
echo -e "${BLUE}🔗 Setting up git configuration...${NC}"
git remote add upstream https://github.com/siteboon/claudecodeui 2>/dev/null || echo -e "${YELLOW}  Upstream already exists${NC}"

# Create or switch to SISO branch
if git show-ref --verify --quiet refs/heads/siso-main; then
    echo -e "${GREEN}✅ Switching to siso-main branch${NC}"
    git checkout siso-main
else
    echo -e "${YELLOW}🌿 Creating siso-main branch${NC}"
    git checkout -b siso-main
fi

# Install base dependencies
echo -e "${BLUE}📥 Installing base dependencies...${NC}"
npm install

# Add SISO-specific dependencies
echo -e "${MAGENTA}🧠 Adding SISO enhancement dependencies...${NC}"

# Voice and Speech
npm install @azure/cognitiveservices-speech-sdk speech-recognition-polyfill

# AI and Language Processing
npm install openai @langchain/community @langchain/core

# Vector Database for RAG
npm install chromadb

# Image Processing
npm install canvas fabric sharp

# Mobile Enhancements
npm install hammer.js react-use-gesture

# Utilities
npm install lodash date-fns uuid

echo -e "${GREEN}✅ SISO dependencies installed${NC}"

# Setup SISO environment configuration
echo -e "${BLUE}⚙️ Creating SISO environment configuration...${NC}"
cat > .env.siso << 'EOF'
# SISO IDE Configuration
PORT=4000
VITE_PORT=5175

# App Information
APP_NAME=SISO IDE
APP_DESCRIPTION=Mobile-First AI Development Environment
APP_VERSION=1.0.0-beta

# SISO Features
SISO_BRAIN_MODE=true
SISO_VOICE_ENABLED=true
SISO_MULTI_PROVIDER=true
SISO_COGNITIVE_ARCHETYPES=true
SISO_ULTRA_THINK=true
SISO_MEMORY_SYSTEM=true

# AI Provider APIs (Replace with your keys)
ANTHROPIC_API_KEY=your_anthropic_key_here
OPENAI_API_KEY=your_openai_key_here
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=your_azure_region_here

# Local AI
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_ENABLED=true

# Vector Database
CHROMA_DB_PATH=./data/chroma
ENABLE_RAG=true

# Mobile Features
ENABLE_VOICE_COMMANDS=true
ENABLE_HAPTIC_FEEDBACK=true
ENABLE_OFFLINE_MODE=true

# Security
JWT_SECRET=your_jwt_secret_change_this
ENCRYPTION_KEY=your_encryption_key_change_this

# Development
DEBUG=true
LOG_LEVEL=info
EOF

# Create SISO directory structure
echo -e "${BLUE}🏗️ Creating SISO directory structure...${NC}"

# SISO Components
mkdir -p src/components/siso/{BrainMode,CognitiveArchetypes,VoiceInterface,MultiProvider,MobileUI}

# SISO Services
mkdir -p src/services/siso/{brain,voice,ai,memory,mobile}

# SISO Hooks
mkdir -p src/hooks/siso

# SISO Styles
mkdir -p src/styles/siso

# SISO Utils
mkdir -p src/utils/siso

# SISO Config
mkdir -p src/config/siso

# Data directories
mkdir -p data/{vector,memory,cache}

# Update package.json for SISO
echo -e "${BLUE}📝 Updating package.json for SISO...${NC}"
npm pkg set name="siso-ide"
npm pkg set version="1.0.0-beta"
npm pkg set description="SISO Custom IDE - Mobile-First AI Development Environment"
npm pkg set author="SISO"
npm pkg set license="MIT"

# Add SISO-specific scripts
npm pkg set scripts.dev:siso="cp .env.siso .env && npm run dev"
npm pkg set scripts.build:siso="cp .env.siso .env && npm run build"
npm pkg set scripts.start:siso="cp .env.siso .env && npm start"
npm pkg set scripts.setup:ollama="docker pull ollama/ollama && docker run -d -p 11434:11434 --name ollama ollama/ollama"
npm pkg set scripts.setup:vector="mkdir -p data/vector && echo 'Vector database ready'"

# Create initial SISO configuration files
echo -e "${BLUE}📋 Creating SISO configuration files...${NC}"

# SISO Brain Configuration
cat > src/config/siso/brain-config.js << 'EOF'
export const SISO_BRAIN_CONFIG = {
  ultraThink: {
    enabled: true,
    maxTokens: 150000,
    temperature: 0.1
  },
  
  cognitiveArchetypes: {
    architect: {
      systemPrompt: "You are an expert system architect. Focus on high-level design, patterns, and scalability.",
      temperature: 0.3
    },
    implementer: {
      systemPrompt: "You are a skilled developer. Focus on clean, efficient code implementation.",
      temperature: 0.2
    },
    reviewer: {
      systemPrompt: "You are a thorough code reviewer. Focus on quality, security, and best practices.",
      temperature: 0.1
    },
    debugger: {
      systemPrompt: "You are an expert debugger. Focus on finding and fixing issues systematically.",
      temperature: 0.2
    },
    optimizer: {
      systemPrompt: "You are a performance expert. Focus on optimization and efficiency.",
      temperature: 0.1
    },
    documenter: {
      systemPrompt: "You are a technical writer. Focus on clear, comprehensive documentation.",
      temperature: 0.3
    }
  },
  
  memorySystem: {
    maxProjectMemory: 10000,
    maxSessionMemory: 5000,
    maxPatternMemory: 20000,
    compressionThreshold: 0.8
  }
};
EOF

# AI Providers Configuration
cat > src/config/siso/providers-config.js << 'EOF'
export const AI_PROVIDERS_CONFIG = {
  claude: {
    name: 'Claude',
    models: {
      'opus-4.1': { maxTokens: 200000, costPer1K: 0.015 },
      'sonnet-3.5': { maxTokens: 200000, costPer1K: 0.003 }
    },
    features: ['chat', 'code', 'analysis', 'reasoning'],
    icon: '🤖',
    color: '#FF6B35'
  },
  
  openai: {
    name: 'OpenAI',
    models: {
      'gpt-4': { maxTokens: 128000, costPer1K: 0.03 },
      'gpt-4-turbo': { maxTokens: 128000, costPer1K: 0.01 },
      'gpt-5': { maxTokens: 200000, costPer1K: 0.05 }
    },
    features: ['chat', 'code', 'images', 'vision'],
    icon: '💬',
    color: '#10A37F'
  },
  
  local: {
    name: 'Local Models',
    models: {
      'codellama': { maxTokens: 16000, costPer1K: 0 },
      'deepseek-coder': { maxTokens: 16000, costPer1K: 0 },
      'mixtral': { maxTokens: 32000, costPer1K: 0 }
    },
    features: ['chat', 'code', 'offline'],
    icon: '🏠',
    color: '#3B82F6'
  },
  
  siso: {
    name: 'SISO Brain',
    models: {
      'siso-ultra': { maxTokens: 200000, costPer1K: 0 },
      'siso-cognitive': { maxTokens: 100000, costPer1K: 0 }
    },
    features: ['ultra-think', 'cognitive', 'memory', 'reasoning'],
    icon: '🧠',
    color: '#8B5CF6'
  }
};
EOF

# Voice Commands Configuration
cat > src/config/siso/voice-config.js << 'EOF'
export const VOICE_COMMANDS_CONFIG = {
  navigation: {
    'open file': 'FILE_OPEN',
    'close file': 'FILE_CLOSE',
    'switch tab': 'TAB_SWITCH',
    'go to line': 'GOTO_LINE',
    'show explorer': 'EXPLORER_SHOW',
    'hide explorer': 'EXPLORER_HIDE'
  },
  
  coding: {
    'new function': 'CODE_NEW_FUNCTION',
    'add comment': 'CODE_ADD_COMMENT',
    'format code': 'CODE_FORMAT',
    'save file': 'FILE_SAVE',
    'undo': 'EDIT_UNDO',
    'redo': 'EDIT_REDO'
  },
  
  git: {
    'git status': 'GIT_STATUS',
    'commit changes': 'GIT_COMMIT',
    'push code': 'GIT_PUSH',
    'pull changes': 'GIT_PULL',
    'create branch': 'GIT_BRANCH_CREATE',
    'switch branch': 'GIT_BRANCH_SWITCH'
  },
  
  ai: {
    'explain code': 'AI_EXPLAIN',
    'generate tests': 'AI_GENERATE_TESTS',
    'find bugs': 'AI_FIND_BUGS',
    'optimize code': 'AI_OPTIMIZE',
    'add documentation': 'AI_DOCUMENT',
    'ultra think': 'AI_ULTRA_THINK'
  }
};
EOF

# Create SISO theme
cat > src/styles/siso/siso-theme.css << 'EOF'
/* SISO IDE Custom Theme */
:root {
  /* SISO Brand Colors */
  --siso-primary: #667eea;
  --siso-secondary: #764ba2;
  --siso-accent: #f093fb;
  --siso-success: #10b981;
  --siso-warning: #f59e0b;
  --siso-error: #ef4444;
  --siso-info: #3b82f6;

  /* Enhanced Dark Theme */
  --siso-bg-primary: #0a0e14;
  --siso-bg-secondary: #1a1e25;
  --siso-bg-tertiary: #2a2e35;
  --siso-bg-quaternary: #3a3e45;
  
  /* SISO Text Colors */
  --siso-text-primary: #f0f6fc;
  --siso-text-secondary: #8b949e;
  --siso-text-tertiary: #6e7681;
  --siso-text-accent: #667eea;
  
  /* SISO Shadows */
  --siso-shadow-sm: 0 1px 2px rgba(102, 126, 234, 0.1);
  --siso-shadow-md: 0 4px 12px rgba(102, 126, 234, 0.15);
  --siso-shadow-lg: 0 8px 24px rgba(102, 126, 234, 0.2);
  
  /* SISO Borders */
  --siso-border: 1px solid var(--siso-bg-tertiary);
  --siso-border-accent: 1px solid var(--siso-primary);
}

/* SISO Theme Class */
.siso-theme {
  background: linear-gradient(135deg, var(--siso-primary) 0%, var(--siso-secondary) 100%);
  color: var(--siso-text-primary);
}

/* SISO Components */
.siso-button {
  background: var(--siso-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
}

.siso-button:hover {
  background: var(--siso-secondary);
  transform: translateY(-2px);
  box-shadow: var(--siso-shadow-md);
}

.siso-button:active {
  transform: translateY(0);
}

.siso-card {
  background: var(--siso-bg-secondary);
  border: var(--siso-border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--siso-shadow-sm);
  transition: all 0.2s ease;
}

.siso-card:hover {
  box-shadow: var(--siso-shadow-md);
  border-color: var(--siso-primary);
}

.siso-input {
  background: var(--siso-bg-tertiary);
  border: var(--siso-border);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--siso-text-primary);
  transition: all 0.2s ease;
}

.siso-input:focus {
  outline: none;
  border-color: var(--siso-primary);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* Mobile-Specific Styles */
@media (max-width: 768px) {
  .siso-mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: var(--siso-bg-secondary);
    border-top: var(--siso-border);
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 1000;
  }
  
  .siso-mobile-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    color: var(--siso-text-secondary);
    text-decoration: none;
    transition: color 0.2s ease;
  }
  
  .siso-mobile-nav-item.active {
    color: var(--siso-primary);
  }
  
  .siso-mobile-panel {
    padding-bottom: 60px; /* Account for nav */
  }
}

/* Voice Interface Styles */
.siso-voice-button {
  position: relative;
  background: var(--siso-primary);
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--siso-shadow-md);
}

.siso-voice-button:hover {
  background: var(--siso-secondary);
  transform: scale(1.05);
}

.siso-voice-button.listening {
  background: var(--siso-error);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: var(--siso-shadow-md); }
  50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
  100% { box-shadow: var(--siso-shadow-md); }
}

/* Brain Mode Indicator */
.siso-brain-mode {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--siso-bg-secondary);
  border: var(--siso-border-accent);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--siso-primary);
  z-index: 1000;
}

.siso-brain-mode.ultra-think {
  background: linear-gradient(135deg, var(--siso-primary), var(--siso-secondary));
  color: white;
  animation: glow 2s infinite alternate;
}

@keyframes glow {
  from { box-shadow: 0 0 10px rgba(102, 126, 234, 0.5); }
  to { box-shadow: 0 0 20px rgba(102, 126, 234, 0.8); }
}
EOF

# Create sample SISO component
cat > src/components/siso/SISOWelcome.jsx << 'EOF'
import React from 'react';
import '../../../styles/siso/siso-theme.css';

export const SISOWelcome = () => {
  return (
    <div className="siso-card max-w-md mx-auto mt-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-siso-primary mb-4">
          🧠 Welcome to SISO IDE
        </h1>
        <p className="text-siso-text-secondary mb-6">
          The world's first mobile-first AI development environment with cognitive enhancement.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="siso-card p-4">
            <div className="text-2xl mb-2">📱</div>
            <div className="text-sm font-semibold">Mobile First</div>
          </div>
          <div className="siso-card p-4">
            <div className="text-2xl mb-2">🧠</div>
            <div className="text-sm font-semibold">AI Enhanced</div>
          </div>
          <div className="siso-card p-4">
            <div className="text-2xl mb-2">🎙️</div>
            <div className="text-sm font-semibold">Voice Control</div>
          </div>
          <div className="siso-card p-4">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-sm font-semibold">Ultra Think</div>
          </div>
        </div>
        
        <button className="siso-button w-full">
          Start Coding with SISO 🚀
        </button>
      </div>
    </div>
  );
};
EOF

# Create Docker configuration
echo -e "${BLUE}🐳 Creating Docker configuration...${NC}"
cat > Dockerfile.siso << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Build SISO IDE
RUN npm run build:siso

# Create data directories
RUN mkdir -p data/{vector,memory,cache}

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000 || exit 1

# Start SISO IDE
CMD ["npm", "run", "start:siso"]
EOF

cat > docker-compose.siso.yml << 'EOF'
version: '3.8'

services:
  siso-ide:
    build:
      context: .
      dockerfile: Dockerfile.siso
    container_name: siso-ide
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - SISO_BRAIN_MODE=true
      - SISO_VOICE_ENABLED=true
      - SISO_MULTI_PROVIDER=true
    volumes:
      - siso-data:/app/data
      - ~/.claude:/root/.claude
      - ~/.siso:/root/.siso
    restart: unless-stopped
    networks:
      - siso-network

  ollama:
    image: ollama/ollama:latest
    container_name: siso-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    restart: unless-stopped
    networks:
      - siso-network
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

  chroma:
    image: chromadb/chroma:latest
    container_name: siso-chroma
    ports:
      - "8000:8000"
    volumes:
      - chroma-data:/chroma/chroma
    environment:
      - CHROMA_HOST=0.0.0.0
      - CHROMA_PORT=8000
    restart: unless-stopped
    networks:
      - siso-network

networks:
  siso-network:
    driver: bridge

volumes:
  siso-data:
  ollama-data:
  chroma-data:
EOF

# Create launch scripts
echo -e "${BLUE}🚀 Creating launch scripts...${NC}"
cat > start-siso-ide.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting SISO IDE..."

# Copy SISO environment
cp .env.siso .env

# Start development server
npm run dev

echo "✅ SISO IDE running at http://localhost:4000"
EOF

cat > deploy-siso-ide.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying SISO IDE with Docker..."

# Build and start all services
docker-compose -f docker-compose.siso.yml up -d --build

echo "✅ SISO IDE deployed!"
echo "📍 Access points:"
echo "  • SISO IDE:    http://localhost:4000"
echo "  • Ollama API:  http://localhost:11434"
echo "  • ChromaDB:    http://localhost:8000"
EOF

chmod +x start-siso-ide.sh deploy-siso-ide.sh

# Create README for SISO IDE
cat > SISO_README.md << 'EOF'
# 🧠 SISO IDE - Mobile-First AI Development Environment

## 🚀 Quick Start

### Development
```bash
# Start SISO IDE
./start-siso-ide.sh
# or
npm run dev:siso
```

### Production
```bash
# Deploy with Docker
./deploy-siso-ide.sh
# or
docker-compose -f docker-compose.siso.yml up -d
```

## 🎯 Features

- 📱 **Mobile-First Design** - Perfect on phones and tablets
- 🧠 **SISO Brain Mode** - Enhanced AI reasoning
- 🎙️ **Voice Commands** - Code with your voice
- 🤖 **Multi-AI Providers** - Claude, GPT, Local models
- ⚡ **Ultra Think Mode** - Maximum reasoning power
- 💾 **Advanced Memory** - Project context retention
- 🔧 **Git Integration** - Full workflow support
- 💻 **Terminal Access** - Built-in shell

## 📱 Mobile Experience

Access on your phone: `http://your-ip:4000`

### Voice Commands
- "Open file main.py"
- "Commit changes"
- "Explain this code"
- "Ultra think mode"

## 🔧 Configuration

Edit `.env.siso` to customize:
- API keys for AI providers
- Voice settings
- Mobile features
- Brain mode options

## 🚀 Access Points

- **SISO IDE**: http://localhost:4000
- **Ollama**: http://localhost:11434
- **ChromaDB**: http://localhost:8000

---

**Built on Claude Code UI foundation with SISO enhancements** 🚀
EOF

# Final setup steps
echo -e "${GREEN}✅ SISO IDE setup complete!${NC}"
echo ""
echo -e "${CYAN}🎯 Next Steps:${NC}"
echo -e "  1. ${YELLOW}Edit .env.siso${NC} - Add your API keys"
echo -e "  2. ${YELLOW}./start-siso-ide.sh${NC} - Start development"
echo -e "  3. ${YELLOW}Open http://localhost:4000${NC} - Access SISO IDE"
echo ""
echo -e "${MAGENTA}📱 Mobile Access:${NC}"
echo -e "  • Get your IP: ${YELLOW}ifconfig | grep inet${NC}"
echo -e "  • Access on phone: ${YELLOW}http://your-ip:4000${NC}"
echo ""
echo -e "${BLUE}🔧 Commands:${NC}"
echo -e "  • Development: ${YELLOW}npm run dev:siso${NC}"
echo -e "  • Production: ${YELLOW}./deploy-siso-ide.sh${NC}"
echo -e "  • Setup Ollama: ${YELLOW}npm run setup:ollama${NC}"
echo ""
echo -e "${GREEN}🚀 Ready to build the ultimate mobile AI IDE!${NC}"

# Show current status
echo ""
echo -e "${BLUE}📊 Current Setup:${NC}"
echo -e "  • Location: ${CORE_DIR}"
echo -e "  • Branch: $(git branch --show-current)"
echo -e "  • Dependencies: ✅ Installed"
echo -e "  • Configuration: ✅ Created"
echo -e "  • Docker: ✅ Ready"
echo ""
echo -e "${CYAN}🎉 SISO IDE Foundation Ready!${NC}"