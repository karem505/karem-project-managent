#!/bin/bash

# ============================================================================
# Railway Deployment Setup Script
# ============================================================================
# This script helps you set up environment variables for Railway deployment
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}Railway Deployment Setup for Project Management System${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found${NC}"
    echo -e "Install it with: ${GREEN}npm i -g @railway/cli${NC}"
    echo -e "Or continue manually using Railway Dashboard"
    echo ""
    RAILWAY_CLI=false
else
    echo -e "${GREEN}✓ Railway CLI detected${NC}"
    RAILWAY_CLI=true
fi

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}✗ Python not found. Please install Python 3.x${NC}"
    exit 1
fi

# Determine Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

echo -e "${GREEN}✓ Python detected: $PYTHON_CMD${NC}"
echo ""

# ============================================================================
# Generate Django SECRET_KEY
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. Generating Django SECRET_KEY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

SECRET_KEY=$($PYTHON_CMD -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for i in range(50)))")

echo -e "${GREEN}✓ Generated SECRET_KEY:${NC}"
echo -e "${YELLOW}$SECRET_KEY${NC}"
echo ""
echo -e "Save this key securely - you'll need it for Railway environment variables"
echo ""

# ============================================================================
# Environment Variables Template
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. Backend Environment Variables${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Copy these variables to your Railway backend service:"
echo -e "${GREEN}(Railway Dashboard → Your Service → Variables → RAW Editor)${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cat << EOF
# Core Django Settings
SECRET_KEY=$SECRET_KEY
DEBUG=False
ALLOWED_HOSTS=.railway.app
USE_POSTGRES=True

# Database (Reference PostgreSQL service - adjust if your service name differs)
DB_NAME=\${{Postgres.PGDATABASE}}
DB_USER=\${{Postgres.PGUSER}}
DB_PASSWORD=\${{Postgres.PGPASSWORD}}
DB_HOST=\${{Postgres.PGHOST}}
DB_PORT=\${{Postgres.PGPORT}}

# CORS (Update with your frontend URL after deployment)
CORS_ALLOWED_ORIGINS=https://your-frontend.railway.app

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080

# Optional: Redis (uncomment if using Redis service)
# REDIS_HOST=\${{Redis.REDIS_HOST}}
# REDIS_PORT=\${{Redis.REDIS_PORT}}
EOF
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================================
# Frontend Variables
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. Frontend Environment Variables${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Copy these variables to your Railway frontend service:"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cat << 'EOF'
# Backend API URL (Update with your backend URL after deployment)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1

# Node Environment
NODE_ENV=production
EOF
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ============================================================================
# Railway CLI Commands
# ============================================================================
if [ "$RAILWAY_CLI" = true ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}4. Railway CLI Quick Commands${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${GREEN}Login to Railway:${NC}"
    echo -e "  railway login"
    echo ""
    echo -e "${GREEN}Link to existing project:${NC}"
    echo -e "  railway link"
    echo ""
    echo -e "${GREEN}Set environment variable (alternative to dashboard):${NC}"
    echo -e "  railway variables set SECRET_KEY='$SECRET_KEY'"
    echo ""
    echo -e "${GREEN}Deploy:${NC}"
    echo -e "  railway up"
    echo ""
    echo -e "${GREEN}Run migrations after deployment:${NC}"
    echo -e "  railway run python backend/manage.py migrate"
    echo ""
    echo -e "${GREEN}Create superuser:${NC}"
    echo -e "  railway run python backend/manage.py createsuperuser"
    echo ""
    echo -e "${GREEN}View logs:${NC}"
    echo -e "  railway logs"
    echo ""
fi

# ============================================================================
# Next Steps
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. Deployment Checklist${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Backend Setup:${NC}"
echo -e "  ☐ Create Railway project"
echo -e "  ☐ Add PostgreSQL database to project"
echo -e "  ☐ Deploy backend service from GitHub"
echo -e "  ☐ Set all environment variables (copy from above)"
echo -e "  ☐ Run migrations: ${GREEN}railway run python backend/manage.py migrate${NC}"
echo -e "  ☐ Create superuser: ${GREEN}railway run python backend/manage.py createsuperuser${NC}"
echo -e "  ☐ Verify deployment: Visit your-backend.railway.app/api/v1/"
echo ""
echo -e "${YELLOW}Frontend Setup (Optional - Full Stack):${NC}"
echo -e "  ☐ Create frontend service in same Railway project"
echo -e "  ☐ Set root directory to: ${GREEN}frontend${NC}"
echo -e "  ☐ Set frontend environment variables"
echo -e "  ☐ Update backend CORS_ALLOWED_ORIGINS with frontend URL"
echo -e "  ☐ Redeploy backend"
echo -e "  ☐ Verify frontend: Visit your-frontend.railway.app"
echo ""
echo -e "${YELLOW}Post-Deployment:${NC}"
echo -e "  ☐ Test login functionality"
echo -e "  ☐ Create test project and tasks"
echo -e "  ☐ Configure custom domain (optional)"
echo -e "  ☐ Enable auto-deploy from GitHub"
echo ""

# ============================================================================
# Additional Resources
# ============================================================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. Additional Resources${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "📄 Detailed Guide: ${GREEN}RAILWAY_SETUP.md${NC}"
echo -e "📄 Environment Templates:"
echo -e "   - Backend: ${GREEN}.env.railway${NC}"
echo -e "   - Frontend: ${GREEN}.env.railway.frontend${NC}"
echo ""
echo -e "🔗 Railway Dashboard: ${GREEN}https://railway.app/dashboard${NC}"
echo -e "🔗 Railway Docs: ${GREEN}https://docs.railway.app/${NC}"
echo ""

# ============================================================================
# Save SECRET_KEY to file (optional)
# ============================================================================
echo -e "${YELLOW}Would you like to save the SECRET_KEY to a file? (y/N)${NC}"
read -r SAVE_KEY

if [[ "$SAVE_KEY" =~ ^[Yy]$ ]]; then
    echo "$SECRET_KEY" > .secret_key.txt
    echo -e "${GREEN}✓ SECRET_KEY saved to .secret_key.txt${NC}"
    echo -e "${RED}⚠️  IMPORTANT: Add .secret_key.txt to .gitignore and never commit it!${NC}"

    # Add to gitignore if not already there
    if ! grep -q ".secret_key.txt" .gitignore 2>/dev/null; then
        echo ".secret_key.txt" >> .gitignore
        echo -e "${GREEN}✓ Added .secret_key.txt to .gitignore${NC}"
    fi
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Setup information generated successfully!${NC}"
echo -e "${GREEN}Follow the steps above to deploy to Railway.${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
