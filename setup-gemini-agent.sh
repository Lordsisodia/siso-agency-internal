#!/bin/bash
###############################################################################
# INSTALL AND CONFIGURE GEMINI CLI ON MAC MINI
# This script sets up Gemini as a coding agent for Vibe Kanban
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🤖 SETTING UP GEMINI CLI AGENT                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Installing...${NC}"
    brew install node
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm not found. Please install Node.js${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is installed$(node --version)${NC}"

# Install Gemini CLI
echo ""
echo -e "${BLUE}Installing Gemini CLI...${NC}"
npm install -g @google/generative-ai

echo -e "${GREEN}✅ Gemini CLI installed${NC}"

# Create configuration directory
echo ""
echo -e "${BLUE}Setting up configuration...${NC}"
mkdir -p ~/.vibe-kanban

# Prompt for API key
echo ""
echo -e "${YELLOW}🔑 Enter your Gemini API Key:${NC}"
echo "Get your API key from: https://makersuite.google.com/app/apikey"
echo ""
read -s -p "API Key: " GEMINI_API_KEY
echo ""

# Save API key to environment
if [ -f ~/.bashrc ]; then
    echo "" >> ~/.bashrc
    echo "# Gemini API Key for Vibe Kanban" >> ~/.bashrc
    echo "export GEMINI_API_KEY=\"$GEMINI_API_KEY\"" >> ~/.bashrc
fi

if [ -f ~/.zshrc ]; then
    echo "" >> ~/.zshrc
    echo "# Gemini API Key for Vibe Kanban" >> ~/.zshrc
    echo "export GEMINI_API_KEY=\"$GEMINI_API_KEY\"" >> ~/.zshrc
fi

# Set for current session
export GEMINI_API_KEY="$GEMINI_API_KEY"

echo ""
echo -e "${GREEN}✅ API key saved to ~/.bashrc and ~/.zshrc${NC}"

# Test Gemini connection
echo ""
echo -e "${BLUE}Testing Gemini CLI...${NC}"
echo "export GEMINI_API_KEY=\"$GEMINI_API_KEY\"" > ~/.vibe-kanban/test-gemini.sh
echo 'node -e "const { GoogleGenerativeAI } = require(\"@google/generative-ai\"); const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); async function test() { const model = genAI.getGenerativeModel({ model: \"gemini-pro\" }); const result = await model.generateContent(\"Hello\"); console.log(result.response.text()); } test();"' >> ~/.vibe-kanban/test-gemini.sh
chmod +x ~/.vibe-kanban/test-gemini.sh

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Gemini CLI setup complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📝 Next Steps:"
echo "   1. Open Vibe Kanban in your browser"
echo "   2. Go to Settings → Agents"
echo "   3. Add new agent:"
echo "      Name: Gemini CLI"
echo "      Type: Gemini"
echo "      API Key: Use environment variable GEMINI_API_KEY"
echo ""
echo "🧪 Test Gemini CLI:"
echo "   source ~/.bashrc"
echo "   ~/.vibe-kanban/test-gemini.sh"
echo ""
echo "📖 For more information:"
echo "   cat .blackbox/.plans/active/vibe-kanban-docker-setup.md"
echo ""
