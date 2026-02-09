#!/bin/bash
###############################################################################
# MAC MINI DOCKER SETUP - AUTOMATED SCRIPT
# This script sets up complete Docker infrastructure on Mac Mini
# Run this in RustDesk terminal connected to Mac Mini
###############################################################################

set -e  # Stop on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Progress tracking
STEP=0
TOTAL_STEPS=11

print_step() {
    STEP=$((STEP + 1))
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}STEP $STEP/$TOTAL_STEPS: $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

###############################################################################
# START SETUP
###############################################################################

clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚀 MAC MINI DOCKER INFRASTRUCTURE SETUP                  ║"
echo "║  Automated Setup Script                                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "This script will:"
echo "  ✓ Install Homebrew (if needed)"
echo "  ✓ Install Colima (Docker runtime)"
echo "  ✓ Clone your repository"
echo "  ✓ Start Docker with 14GB RAM"
echo "  ✓ Start all Docker services"
echo "  ✓ Create management scripts"
echo ""
print_warning "This will take 15-20 minutes. Go grab a coffee! ☕"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

###############################################################################
# STEP 1: Check for Admin Privileges
###############################################################################

print_step "Checking Admin Privileges"

if [ "$EUID" -ne 0 ]; then
    if ! sudo -n true 2>/dev/null; then
        print_info "Requesting admin access..."
        sudo echo "Admin access granted!"
    fi
    print_success "Admin privileges confirmed"
else
    print_success "Running as root"
fi

###############################################################################
# STEP 2: Install Homebrew
###############################################################################

print_step "Installing Homebrew"

if command -v brew &> /dev/null; then
    HOMEBREW_VERSION=$(brew --version | head -n1 | awk '{print $2}')
    print_success "Homebrew already installed (version $HOMEBREW_VERSION)"
else
    print_info "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add Homebrew to PATH for Apple Silicon
    if [[ $(uname -m) == 'arm64' ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi

    print_success "Homebrew installed"
fi

###############################################################################
# STEP 3: Install Colima and Docker Compose
###############################################################################

print_step "Installing Colima (Docker Runtime) and Docker Compose"

if command -v colima &> /dev/null; then
    COLIMA_VERSION=$(colima version | head -n1)
    print_success "Colima already installed ($COLIMA_VERSION)"
else
    print_info "Installing Colima and Docker Compose..."
    brew install colima docker-compose
    print_success "Colima and Docker Compose installed"
fi

###############################################################################
# STEP 4: Configure and Start Colima
###############################################################################

print_step "Starting Colima with 14GB RAM Configuration"

# Check if Colima is already running
if colima status &> /dev/null; then
    print_warning "Colima is already running"
    print_info "Stopping existing Colima instance..."
    colima stop
    sleep 3
fi

print_info "Starting Colima with: 8 CPUs, 14GB RAM, 100GB disk..."
colima start --cpu 8 --memory 14 --disk 100

print_success "Colima started successfully"

# Verify
docker info > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Docker is accessible"
else
    echo -e "${RED}❌ ERROR: Docker is not accessible${NC}"
    exit 1
fi

###############################################################################
# STEP 5: Test Docker with Hello-World
###############################################################################

print_step "Testing Docker Installation"

print_info "Running test container..."
docker run --rm hello-world > /dev/null 2>&1
print_success "Docker test passed"

###############################################################################
# STEP 6: Navigate to Home Directory
###############################################################################

print_step "Setting Up Workspace"

cd ~
print_success "Changed to home directory: ~"

###############################################################################
# STEP 7: Clone Repository
###############################################################################

print_step "Cloning SISO-INTERNAL Repository"

if [ -d "SISO-INTERNAL" ]; then
    print_warning "Repository already exists"
    print_info "Updating existing repository..."
    cd SISO-INTERNAL
    git pull
    cd ..
else
    print_info "Cloning repository..."
    print_warning "You will need to provide your repository URL"
    echo ""
    echo "What is your repository URL?"
    echo "Example: https://github.com/username/repo.git"
    echo "Or: git@github.com:username/repo.git"
    echo ""
    read -p "Repository URL: " REPO_URL

    if [ -z "$REPO_URL" ]; then
        echo -e "${RED}❌ ERROR: Repository URL is required${NC}"
        exit 1
    fi

    git clone "$REPO_URL" SISO-INTERNAL
    print_success "Repository cloned"
fi

###############################################################################
# STEP 8: Start Docker Services
###############################################################################

print_step "Starting Docker Infrastructure"

cd ~/SISO-INTERNAL
print_info "Starting Docker services with docker-compose..."

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    print_warning "docker-compose.yml not found in current directory"
    print_info "Looking in parent directory..."
    cd ..
fi

# Start services
docker-compose up -d

# Wait for services to be healthy
print_info "Waiting for services to start (this may take a few minutes)..."
sleep 10

print_success "Docker services started"

###############################################################################
# STEP 9: Verify Services Are Running
###############################################################################

print_step "Verifying Docker Services"

docker-compose ps
echo ""

# Check if services are up
RUNNING=$(docker-compose ps --services --filter "status=running" | wc -l | tr -d ' ')
if [ "$RUNNING" -gt 0 ]; then
    print_success "$RUNNING service(s) are running"
else
    print_warning "No services are currently running"
fi

###############################################################################
# STEP 10: Check Resource Usage
###############################################################################

print_step "Checking Docker Resource Usage"

docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""

# Calculate total memory
TOTAL_MEM=$(docker stats --no-stream --format "{{.MemUsage}}" | awk '{s+=$2} END {print s}')
print_info "Total Docker memory usage: ${TOTAL_MEM}"

###############################################################################
# STEP 11: Create Management Scripts
###############################################################################

print_step "Creating Management Scripts"

# Create start script
cat > ~/start-docker.sh << 'EOF'
#!/bin/bash
# Start Docker infrastructure on Mac Mini

echo "Starting Docker infrastructure..."

# Start Colima if not running
if ! colima status > /dev/null 2>&1; then
    echo "Starting Colima..."
    colima start --cpu 8 --memory 14 --disk 100
fi

# Navigate to project
cd ~/SISO-INTERNAL

# Start Docker services
echo "Starting Docker services..."
docker-compose up -d

# Show status
echo ""
echo "✅ Docker is running!"
docker-compose ps
EOF

chmod +x ~/start-docker.sh

# Create monitor script
cat > ~/monitor.sh << 'EOF'
#!/bin/bash
# Monitor Docker infrastructure

while true; do
    clear
    echo "=== Docker Infrastructure Monitor ==="
    echo "Time: $(date)"
    echo ""

    echo "=== Container Status ==="
    docker-compose ps
    echo ""

    echo "=== Resource Usage ==="
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    echo ""

    echo "=== Recent Logs (last 5 lines) ==="
    docker-compose logs --tail=5
    echo ""

    echo "Press Ctrl+C to stop monitoring"
    sleep 5
done
EOF

chmod +x ~/monitor.sh

# Create deploy script
cat > ~/deploy.sh << 'EOF'
#!/bin/bash
# Deploy updates to Docker infrastructure

echo "Deploying updates..."

# Navigate to project
cd ~/SISO-INTERNAL

# Pull latest code
echo "Pulling latest code..."
git pull

# Rebuild and restart services
echo "Rebuilding Docker containers..."
docker-compose up -d --build

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
docker-compose ps
EOF

chmod +x ~/deploy.sh

# Create status script
cat > ~/status.sh << 'EOF'
#!/bin/bash
# Check Docker infrastructure status

echo "=== Docker Infrastructure Status ==="
echo ""
echo "Colima Status:"
colima status
echo ""

echo "Docker Services:"
docker-compose ps
echo ""

echo "Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
EOF

chmod +x ~/status.sh

print_success "Management scripts created"
echo ""
echo "Available scripts:"
echo "  ~/start-docker.sh  - Start Docker infrastructure"
echo "  ~/monitor.sh      - Live monitoring dashboard"
echo "  ~/deploy.sh       - Deploy updates"
echo "  ~/status.sh       - Check infrastructure status"

###############################################################################
# SETUP COMPLETE
###############################################################################

echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ SETUP COMPLETE!                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "🎉 Your Mac Mini Docker infrastructure is now running!"
echo ""
echo "Quick Start Commands:"
echo "  ~/status.sh          - Check everything is running"
echo "  ~/monitor.sh         - View live monitoring dashboard"
echo "  ~/deploy.sh          - Deploy code updates"
echo ""
echo "View logs:"
echo "  cd ~/SISO-INTERNAL"
echo "  docker-compose logs -f"
echo ""
print_info "Keep this RustDesk terminal open to monitor logs"
print_info "Docker will keep running even if you close RustDesk"
echo ""
echo "For help, see: ~/.blackbox/.plans/active/distributed-docker-infrastructure/"
echo ""
