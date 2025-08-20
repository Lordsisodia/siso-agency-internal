#!/bin/bash

# 🚀 SISO IDE - Complete Claude UI Integration Script
# Sets up multiple Claude UIs for maximum flexibility

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     SISO IDE - Claude UI Multi-Platform Setup v2.0      ║"
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
BASE_DIR="${PWD}/claude-uis"
DOCKER_NETWORK="siso-network"

# Create base directory
echo -e "${BLUE}📁 Creating directory structure...${NC}"
mkdir -p ${BASE_DIR}/{configs,data,logs}
cd ${BASE_DIR}

# Function to check command existence
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed. Please install it first.${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ $1 is installed${NC}"
    return 0
}

# Function to clone or update repo
clone_or_update() {
    local name=$1
    local repo=$2
    local dir=$3
    
    echo -e "${CYAN}📦 Setting up ${name}...${NC}"
    if [ -d "${dir}" ]; then
        echo -e "${YELLOW}  Updating ${name}...${NC}"
        cd ${dir} && git pull && cd ..
    else
        echo -e "${YELLOW}  Cloning ${name}...${NC}"
        git clone ${repo} ${dir}
    fi
}

# Check prerequisites
echo -e "\n${BLUE}🔍 Checking prerequisites...${NC}"
check_command "git"
check_command "docker"
check_command "npm"
check_command "node"

# Create Docker network
echo -e "\n${BLUE}🌐 Creating Docker network...${NC}"
docker network create ${DOCKER_NETWORK} 2>/dev/null || echo -e "${YELLOW}Network already exists${NC}"

# ═══════════════════════════════════════════════════════════
# 1. OPEN WEBUI - Most Feature-Rich
# ═══════════════════════════════════════════════════════════
echo -e "\n${MAGENTA}═══ Setting up Open WebUI ═══${NC}"
cat > ${BASE_DIR}/configs/open-webui.env << 'EOF'
# Open WebUI Configuration
ENABLE_SIGNUP=true
DEFAULT_MODELS=claude-3-5-sonnet,gpt-4,llama3
WEBUI_AUTH=false
WEBUI_NAME=SISO Open WebUI
DATA_DIR=/app/backend/data
ENABLE_COMMUNITY_SHARING=true
ENABLE_ADMIN_EXPORT=true
EOF

# Create Open WebUI docker-compose
cat > ${BASE_DIR}/docker-compose.open-webui.yml << 'EOF'
version: '3.8'

services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: siso-open-webui
    ports:
      - "3000:8080"
    volumes:
      - ./data/open-webui:/app/backend/data
    env_file:
      - ./configs/open-webui.env
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    networks:
      - siso-network
    restart: unless-stopped

networks:
  siso-network:
    external: true
EOF

# ═══════════════════════════════════════════════════════════
# 2. LOBE CHAT - Beautiful & Plugin-Rich
# ═══════════════════════════════════════════════════════════
echo -e "\n${MAGENTA}═══ Setting up Lobe Chat ═══${NC}"
clone_or_update "Lobe Chat" "https://github.com/lobehub/lobe-chat" "lobe-chat"

cat > ${BASE_DIR}/docker-compose.lobe-chat.yml << 'EOF'
version: '3.8'

services:
  lobe-chat:
    image: lobehub/lobe-chat:latest
    container_name: siso-lobe-chat
    ports:
      - "3210:3210"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENAI_PROXY_URL=
      - ACCESS_CODE=
      - CUSTOM_MODELS=-all,+claude-3-5-sonnet,+gpt-4
    volumes:
      - ./data/lobe-chat:/root/.lobechat
    networks:
      - siso-network
    restart: unless-stopped

networks:
  siso-network:
    external: true
EOF

# ═══════════════════════════════════════════════════════════
# 3. LIBRECHAT - Enterprise Features
# ═══════════════════════════════════════════════════════════
echo -e "\n${MAGENTA}═══ Setting up LibreChat ═══${NC}"
clone_or_update "LibreChat" "https://github.com/danny-avila/LibreChat" "LibreChat"

# Create LibreChat config
cat > ${BASE_DIR}/LibreChat/.env << 'EOF'
# LibreChat Configuration
APP_TITLE=SISO LibreChat
ALLOW_REGISTRATION=true
ALLOW_SOCIAL_LOGIN=false
SESSION_EXPIRY=1000 * 60 * 60 * 24 * 7

# Claude Configuration
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODELS=claude-3-5-sonnet,claude-3-opus,claude-3-haiku

# OpenAI Configuration  
OPENAI_API_KEY=your_key_here
OPENAI_MODELS=gpt-4,gpt-4-turbo,gpt-3.5-turbo

# Database
MONGO_URI=mongodb://mongo:27017/librechat

# Security
JWT_SECRET=your-secret-key-change-this
CREDS_KEY=your-creds-key-change-this
CREDS_IV=your-creds-iv-change-this
EOF

# ═══════════════════════════════════════════════════════════
# 4. CHATGPT-NEXT-WEB - One-Click Deploy
# ═══════════════════════════════════════════════════════════
echo -e "\n${MAGENTA}═══ Setting up ChatGPT-Next-Web ═══${NC}"
clone_or_update "ChatGPT-Next-Web" "https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web" "ChatGPT-Next-Web"

cat > ${BASE_DIR}/docker-compose.next-web.yml << 'EOF'
version: '3.8'

services:
  chatgpt-next-web:
    build: ./ChatGPT-Next-Web
    container_name: siso-next-web
    ports:
      - "3002:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - BASE_URL=
      - CUSTOM_MODELS=+claude-3-5-sonnet,+claude-3-opus
    networks:
      - siso-network
    restart: unless-stopped

networks:
  siso-network:
    external: true
EOF

# ═══════════════════════════════════════════════════════════
# 5. JAN - Desktop Native App
# ═══════════════════════════════════════════════════════════
echo -e "\n${MAGENTA}═══ Setting up Jan (Desktop) ═══${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${YELLOW}📥 Download Jan from: https://jan.ai/download${NC}"
    echo -e "${CYAN}   Jan is a desktop app - install separately${NC}"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo -e "${YELLOW}Installing Jan via AppImage...${NC}"
    wget -q https://github.com/janhq/jan/releases/latest/download/jan-linux-x86_64.AppImage -O jan.AppImage
    chmod +x jan.AppImage
    echo -e "${GREEN}✅ Jan AppImage ready: ./jan.AppImage${NC}"
fi

# ═══════════════════════════════════════════════════════════
# 6. BETTER CHATGPT - Privacy Focused
# ═══════════════════════════════════════════════════════════
echo -e "\n${MAGENTA}═══ Setting up BetterChatGPT ═══${NC}"
clone_or_update "BetterChatGPT" "https://github.com/ztjhz/BetterChatGPT" "BetterChatGPT"

cat > ${BASE_DIR}/docker-compose.better-gpt.yml << 'EOF'
version: '3.8'

services:
  better-chatgpt:
    build: ./BetterChatGPT
    container_name: siso-better-gpt
    ports:
      - "3003:3000"
    environment:
      - VITE_DEFAULT_API_ENDPOINT=https://api.anthropic.com
    networks:
      - siso-network
    restart: unless-stopped

networks:
  siso-network:
    external: true
EOF

# ═══════════════════════════════════════════════════════════
# 7. CHATBOT UI - Developer Focused
# ═══════════════════════════════════════════════════════════
echo -e "\n${MAGENTA}═══ Setting up Chatbot UI ═══${NC}"
clone_or_update "Chatbot UI" "https://github.com/mckaywrigley/chatbot-ui" "chatbot-ui"

# ═══════════════════════════════════════════════════════════
# MASTER DOCKER COMPOSE
# ═══════════════════════════════════════════════════════════
echo -e "\n${BLUE}🐳 Creating master docker-compose...${NC}"
cat > ${BASE_DIR}/docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Open WebUI - Port 3000
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: siso-open-webui
    ports:
      - "3000:8080"
    volumes:
      - ./data/open-webui:/app/backend/data
    env_file:
      - ./configs/open-webui.env
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    networks:
      - siso-network
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.openwebui.rule=Host(`openwebui.localhost`)"

  # Lobe Chat - Port 3210
  lobe-chat:
    image: lobehub/lobe-chat:latest
    container_name: siso-lobe-chat
    ports:
      - "3210:3210"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./data/lobe-chat:/root/.lobechat
    networks:
      - siso-network
    restart: unless-stopped

  # LibreChat - Port 3080
  librechat:
    build: ./LibreChat
    container_name: siso-librechat
    ports:
      - "3080:3080"
    env_file:
      - ./LibreChat/.env
    depends_on:
      - mongo
    networks:
      - siso-network
    restart: unless-stopped

  # MongoDB for LibreChat
  mongo:
    image: mongo:latest
    container_name: siso-mongo
    volumes:
      - ./data/mongo:/data/db
    networks:
      - siso-network
    restart: unless-stopped

  # Claude Code UI - Port 3001
  claude-code-ui:
    build: ../claudecodeui
    container_name: siso-claude-ui
    ports:
      - "3001:3001"
    volumes:
      - ~/.claude:/root/.claude
      - ~/.siso:/root/.siso
    networks:
      - siso-network
    restart: unless-stopped

  # Ollama for local models
  ollama:
    image: ollama/ollama:latest
    container_name: siso-ollama
    ports:
      - "11434:11434"
    volumes:
      - ./data/ollama:/root/.ollama
    networks:
      - siso-network
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: siso-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./configs/nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - siso-network
    depends_on:
      - open-webui
      - lobe-chat
      - librechat
      - claude-code-ui
    restart: unless-stopped

networks:
  siso-network:
    external: true

volumes:
  mongo-data:
  ollama-data:
EOF

# ═══════════════════════════════════════════════════════════
# NGINX CONFIGURATION
# ═══════════════════════════════════════════════════════════
echo -e "\n${BLUE}🔧 Creating Nginx configuration...${NC}"
cat > ${BASE_DIR}/configs/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream open_webui {
        server open-webui:8080;
    }
    
    upstream lobe_chat {
        server lobe-chat:3210;
    }
    
    upstream librechat {
        server librechat:3080;
    }
    
    upstream claude_ui {
        server claude-code-ui:3001;
    }

    server {
        listen 80;
        server_name localhost;

        # Default - Open WebUI
        location / {
            proxy_pass http://open_webui;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Lobe Chat
        location /lobe/ {
            rewrite ^/lobe/(.*) /$1 break;
            proxy_pass http://lobe_chat;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # LibreChat
        location /libre/ {
            rewrite ^/libre/(.*) /$1 break;
            proxy_pass http://librechat;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Claude Code UI
        location /claude/ {
            rewrite ^/claude/(.*) /$1 break;
            proxy_pass http://claude_ui;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
EOF

# ═══════════════════════════════════════════════════════════
# ENVIRONMENT FILE
# ═══════════════════════════════════════════════════════════
echo -e "\n${BLUE}🔑 Creating environment template...${NC}"
cat > ${BASE_DIR}/.env.example << 'EOF'
# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=
GROQ_API_KEY=

# Ollama Configuration
OLLAMA_BASE_URL=http://ollama:11434

# Security
JWT_SECRET=change-this-to-random-string
SESSION_SECRET=change-this-to-random-string

# Features
ENABLE_SIGNUP=true
ENABLE_COMMUNITY_SHARING=false

# Branding
APP_TITLE=SISO AI Platform
EOF

# ═══════════════════════════════════════════════════════════
# CONTROL SCRIPT
# ═══════════════════════════════════════════════════════════
echo -e "\n${BLUE}🎮 Creating control script...${NC}"
cat > ${BASE_DIR}/siso-ui.sh << 'SCRIPT'
#!/bin/bash

# SISO UI Control Script

case "$1" in
    start)
        echo "🚀 Starting all SISO UIs..."
        docker-compose up -d
        echo "✅ All services started!"
        echo ""
        echo "📍 Access points:"
        echo "  • Open WebUI:     http://localhost:3000"
        echo "  • Claude Code UI: http://localhost:3001" 
        echo "  • Lobe Chat:      http://localhost:3210"
        echo "  • LibreChat:      http://localhost:3080"
        echo "  • All-in-one:     http://localhost"
        ;;
    
    stop)
        echo "🛑 Stopping all services..."
        docker-compose down
        ;;
    
    restart)
        $0 stop
        $0 start
        ;;
    
    status)
        docker-compose ps
        ;;
    
    logs)
        docker-compose logs -f $2
        ;;
    
    pull)
        echo "📥 Updating all images..."
        docker-compose pull
        ;;
    
    clean)
        echo "🧹 Cleaning up..."
        docker-compose down -v
        ;;
        
    setup-models)
        echo "🤖 Setting up local models..."
        docker exec siso-ollama ollama pull llama3
        docker exec siso-ollama ollama pull codellama
        docker exec siso-ollama ollama pull mixtral
        echo "✅ Models ready!"
        ;;
    
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|pull|clean|setup-models}"
        exit 1
        ;;
esac
SCRIPT
chmod +x ${BASE_DIR}/siso-ui.sh

# ═══════════════════════════════════════════════════════════
# DASHBOARD HTML
# ═══════════════════════════════════════════════════════════
echo -e "\n${BLUE}🎨 Creating unified dashboard...${NC}"
cat > ${BASE_DIR}/dashboard.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SISO AI Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        header {
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        h1 {
            color: white;
            font-size: 1.5rem;
        }
        .tabs {
            display: flex;
            gap: 1rem;
        }
        .tab {
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
        }
        .tab:hover, .tab.active {
            background: rgba(255,255,255,0.3);
        }
        .container {
            flex: 1;
            padding: 2rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            width: 100%;
        }
        .card {
            background: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s;
        }
        .card:hover {
            transform: translateY(-5px);
        }
        .card h2 {
            color: #667eea;
            margin-bottom: 1rem;
        }
        .card p {
            color: #666;
            margin-bottom: 1.5rem;
        }
        .card a {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            transition: opacity 0.3s;
        }
        .card a:hover {
            opacity: 0.9;
        }
        .status {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #4caf50;
            margin-right: 0.5rem;
        }
        iframe {
            width: 100%;
            height: calc(100vh - 80px);
            border: none;
            display: none;
        }
        iframe.active {
            display: block;
        }
    </style>
</head>
<body>
    <header>
        <h1>🚀 SISO AI Platform</h1>
        <div class="tabs">
            <a href="#dashboard" class="tab active" onclick="showTab('dashboard')">Dashboard</a>
            <a href="#open-webui" class="tab" onclick="showTab('open-webui')">Open WebUI</a>
            <a href="#lobe-chat" class="tab" onclick="showTab('lobe-chat')">Lobe Chat</a>
            <a href="#claude-ui" class="tab" onclick="showTab('claude-ui')">Claude UI</a>
            <a href="#librechat" class="tab" onclick="showTab('librechat')">LibreChat</a>
        </div>
    </header>

    <div id="dashboard" class="container">
        <div class="card">
            <span class="status"></span>
            <h2>Open WebUI</h2>
            <p>Feature-rich interface with RAG support, voice, and image generation</p>
            <a href="http://localhost:3000" target="_blank">Launch →</a>
        </div>
        <div class="card">
            <span class="status"></span>
            <h2>Claude Code UI</h2>
            <p>Mobile-first IDE interface for Claude and Cursor CLI</p>
            <a href="http://localhost:3001" target="_blank">Launch →</a>
        </div>
        <div class="card">
            <span class="status"></span>
            <h2>Lobe Chat</h2>
            <p>Beautiful UI with plugin marketplace and TTS/STT support</p>
            <a href="http://localhost:3210" target="_blank">Launch →</a>
        </div>
        <div class="card">
            <span class="status"></span>
            <h2>LibreChat</h2>
            <p>Enterprise multi-user platform with auth and plugins</p>
            <a href="http://localhost:3080" target="_blank">Launch →</a>
        </div>
        <div class="card">
            <span class="status"></span>
            <h2>Ollama</h2>
            <p>Local model server for privacy-first AI</p>
            <a href="http://localhost:11434" target="_blank">API →</a>
        </div>
        <div class="card">
            <span class="status"></span>
            <h2>System Status</h2>
            <p>All systems operational</p>
            <a href="#" onclick="checkStatus()">Check →</a>
        </div>
    </div>

    <iframe id="open-webui" src="http://localhost:3000"></iframe>
    <iframe id="lobe-chat" src="http://localhost:3210"></iframe>
    <iframe id="claude-ui" src="http://localhost:3001"></iframe>
    <iframe id="librechat" src="http://localhost:3080"></iframe>

    <script>
        function showTab(tab) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('iframe').forEach(f => f.classList.remove('active'));
            document.getElementById('dashboard').style.display = 'none';
            
            if (tab === 'dashboard') {
                document.getElementById('dashboard').style.display = 'grid';
            } else {
                document.getElementById(tab).classList.add('active');
            }
            
            event.target.classList.add('active');
        }
        
        async function checkStatus() {
            const services = [
                {url: 'http://localhost:3000', name: 'Open WebUI'},
                {url: 'http://localhost:3001', name: 'Claude UI'},
                {url: 'http://localhost:3210', name: 'Lobe Chat'},
                {url: 'http://localhost:3080', name: 'LibreChat'},
            ];
            
            for (const service of services) {
                try {
                    await fetch(service.url, {mode: 'no-cors'});
                    console.log(`✅ ${service.name} is running`);
                } catch (e) {
                    console.log(`❌ ${service.name} is not responding`);
                }
            }
        }
    </script>
</body>
</html>
EOF

# ═══════════════════════════════════════════════════════════
# FINAL SETUP
# ═══════════════════════════════════════════════════════════
echo -e "\n${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SISO Claude UI Platform Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"

echo -e "\n${CYAN}📋 Quick Start Commands:${NC}"
echo -e "  ${YELLOW}cd ${BASE_DIR}${NC}"
echo -e "  ${YELLOW}cp .env.example .env${NC}  # Add your API keys"
echo -e "  ${YELLOW}./siso-ui.sh start${NC}    # Start all services"

echo -e "\n${CYAN}🌐 Access Points:${NC}"
echo -e "  ${BLUE}Dashboard:${NC}     http://localhost/dashboard.html"
echo -e "  ${BLUE}Open WebUI:${NC}    http://localhost:3000"
echo -e "  ${BLUE}Claude UI:${NC}     http://localhost:3001"
echo -e "  ${BLUE}Lobe Chat:${NC}     http://localhost:3210"
echo -e "  ${BLUE}LibreChat:${NC}     http://localhost:3080"

echo -e "\n${CYAN}🎯 Features Available:${NC}"
echo -e "  ✅ Multiple Claude UIs"
echo -e "  ✅ Mobile responsive design"
echo -e "  ✅ Local model support (Ollama)"
echo -e "  ✅ Multi-provider AI (Claude, GPT, Gemini)"
echo -e "  ✅ Plugin systems"
echo -e "  ✅ Voice & image support"
echo -e "  ✅ Document chat (RAG)"
echo -e "  ✅ Team collaboration"

echo -e "\n${MAGENTA}🚀 Your SISO IDE now has 5+ Claude UIs ready!${NC}"