#!/bin/bash

# Vercel Deployment Automation Script
# Usage: ./vercel-deploy.sh [environment] [--preview|--production]
# Example: ./vercel-deploy.sh staging --preview

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
DEPLOYMENT_TYPE=${2:-preview}
PROJECT_NAME=$(node -p "require('./package.json').name")
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="deployment_${ENVIRONMENT}_${TIMESTAMP}.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Validate environment
validate_environment() {
    log "Validating deployment environment: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        development|dev)
            ENV_FILE=".env.development"
            VERCEL_ENV="development"
            ;;
        staging|stage)
            ENV_FILE=".env.staging"
            VERCEL_ENV="preview"
            ;;
        production|prod)
            ENV_FILE=".env.production"
            VERCEL_ENV="production"
            ;;
        *)
            error "Invalid environment: $ENVIRONMENT. Use: development, staging, or production"
            exit 1
            ;;
    esac
    
    if [[ ! -f "$ENV_FILE" ]]; then
        warning "Environment file $ENV_FILE not found. Using default environment variables."
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI not found. Install with: npm install -g vercel"
        exit 1
    fi
    
    # Check if logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        error "Not logged in to Vercel. Run: vercel login"
        exit 1
    fi
    
    # Check if we're in a Node.js project
    if [[ ! -f "package.json" ]]; then
        error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        log "Installing dependencies..."
        npm install
    fi
    
    # Run tests
    log "Running tests..."
    if npm run test:ci &> /dev/null; then
        success "All tests passed"
    else
        error "Tests failed. Deployment aborted."
        exit 1
    fi
    
    # Type checking
    if npm run type-check &> /dev/null; then
        success "Type checking passed"
    else
        error "Type checking failed. Deployment aborted."
        exit 1
    fi
    
    # Build check
    log "Verifying build..."
    if npm run build &> /dev/null; then
        success "Build successful"
    else
        error "Build failed. Deployment aborted."
        exit 1
    fi
}

# Set environment variables
set_environment_variables() {
    log "Setting environment variables for $ENVIRONMENT..."
    
    # Load environment variables from file
    if [[ -f "$ENV_FILE" ]]; then
        while IFS= read -r line; do
            if [[ ! "$line" =~ ^#.* ]] && [[ -n "$line" ]]; then
                key=$(echo "$line" | cut -d '=' -f 1)
                value=$(echo "$line" | cut -d '=' -f 2-)
                
                # Remove quotes if present
                value=$(echo "$value" | sed 's/^"//;s/"$//')
                
                log "Setting environment variable: $key"
                vercel env add "$key" "$VERCEL_ENV" <<< "$value" > /dev/null 2>&1 || true
            fi
        done < "$ENV_FILE"
    fi
}

# Deploy to Vercel
deploy() {
    log "Starting deployment to Vercel..."
    log "Project: $PROJECT_NAME"
    log "Environment: $ENVIRONMENT"
    log "Deployment Type: $DEPLOYMENT_TYPE"
    
    # Set deployment flags
    DEPLOY_FLAGS=""
    
    if [[ "$DEPLOYMENT_TYPE" == "--production" ]] && [[ "$ENVIRONMENT" == "production" ]]; then
        DEPLOY_FLAGS="--prod"
        log "Deploying to PRODUCTION"
    else
        log "Deploying to PREVIEW"
    fi
    
    # Deploy
    log "Executing deployment..."
    DEPLOYMENT_URL=$(vercel $DEPLOY_FLAGS --yes 2>&1 | tee -a "$LOG_FILE" | grep -E "https://.*vercel\.app" | tail -1)
    
    if [[ -n "$DEPLOYMENT_URL" ]]; then
        success "Deployment successful!"
        success "URL: $DEPLOYMENT_URL"
        
        # Wait for deployment to be ready
        log "Waiting for deployment to be ready..."
        sleep 30
        
        # Health check
        if curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" | grep -q "200"; then
            success "Health check passed - deployment is live!"
        else
            warning "Health check failed - deployment might not be fully ready"
        fi
        
    else
        error "Deployment failed - no URL returned"
        exit 1
    fi
}

# Post-deployment tasks
post_deployment() {
    log "Running post-deployment tasks..."
    
    # Update deployment status
    log "Recording deployment in logs..."
    echo "$(date): $ENVIRONMENT deployment successful - $DEPLOYMENT_URL" >> "deployments.log"
    
    # Notify team (if webhook URLs are set)
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        log "Sending Slack notification..."
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 Deployment successful!\n**Project:** $PROJECT_NAME\n**Environment:** $ENVIRONMENT\n**URL:** $DEPLOYMENT_URL\"}" \
            "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || warning "Slack notification failed"
    fi
    
    if [[ -n "$DISCORD_WEBHOOK_URL" ]]; then
        log "Sending Discord notification..."
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"content\":\"🚀 **Deployment Successful**\n**Project:** $PROJECT_NAME\n**Environment:** $ENVIRONMENT\n**URL:** $DEPLOYMENT_URL\"}" \
            "$DISCORD_WEBHOOK_URL" > /dev/null 2>&1 || warning "Discord notification failed"
    fi
    
    success "Post-deployment tasks completed"
}

# Rollback function
rollback() {
    log "Initiating rollback..."
    
    # Get previous deployment
    PREVIOUS_URL=$(vercel ls --meta | grep -E "https://.*vercel\.app" | head -2 | tail -1)
    
    if [[ -n "$PREVIOUS_URL" ]]; then
        log "Rolling back to: $PREVIOUS_URL"
        vercel promote "$PREVIOUS_URL" --yes
        success "Rollback completed"
    else
        error "No previous deployment found for rollback"
        exit 1
    fi
}

# Error handling
handle_error() {
    error "Deployment failed with error code $1"
    log "Check the log file for details: $LOG_FILE"
    
    # Offer rollback option
    read -p "Would you like to rollback to the previous deployment? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rollback
    fi
    
    exit $1
}

# Main execution
main() {
    log "Starting Vercel deployment automation"
    log "Script version: 1.0.0"
    
    # Set error handler
    trap 'handle_error $?' ERR
    
    # Validate inputs
    validate_environment
    
    # Check for rollback command
    if [[ "$1" == "rollback" ]]; then
        rollback
        exit 0
    fi
    
    # Run deployment pipeline
    pre_deployment_checks
    set_environment_variables
    deploy
    post_deployment
    
    success "Deployment pipeline completed successfully!"
    log "Log file saved: $LOG_FILE"
}

# Help function
show_help() {
    echo "Vercel Deployment Automation Script"
    echo ""
    echo "Usage:"
    echo "  $0 [environment] [--preview|--production]"
    echo "  $0 rollback"
    echo "  $0 --help"
    echo ""
    echo "Environments:"
    echo "  development, dev     Deploy to development environment"
    echo "  staging, stage       Deploy to staging environment"
    echo "  production, prod     Deploy to production environment"
    echo ""
    echo "Deployment Types:"
    echo "  --preview           Deploy as preview (default)"
    echo "  --production        Deploy to production (only for prod environment)"
    echo ""
    echo "Examples:"
    echo "  $0 staging --preview"
    echo "  $0 production --production"
    echo "  $0 rollback"
    echo ""
    echo "Environment Variables:"
    echo "  SLACK_WEBHOOK_URL   Slack webhook for notifications"
    echo "  DISCORD_WEBHOOK_URL Discord webhook for notifications"
}

# Handle command line arguments
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help
    exit 0
fi

# Execute main function
main "$@"