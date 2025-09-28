#!/bin/bash

# QuickCRM Production Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

echo -e "${BLUE}🚀 Starting QuickCRM deployment for environment: $ENVIRONMENT${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Creating from template...${NC}"
    cp env.production.template .env.production
    echo -e "${YELLOW}📝 Please edit .env.production with your production values before continuing.${NC}"
    exit 1
fi

# Load environment variables
source .env.production

echo -e "${BLUE}📋 Environment Configuration:${NC}"
echo -e "  - Domain: ${DOMAIN_NAME:-'Not set'}"
echo -e "  - Database: ${DB_NAME:-'Not set'}"
echo -e "  - API URL: ${API_URL:-'Not set'}"

# Create necessary directories
echo -e "${BLUE}📁 Creating necessary directories...${NC}"
mkdir -p ssl
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p logs

# Set proper permissions
echo -e "${BLUE}🔐 Setting permissions...${NC}"
chmod 755 scripts/
chmod +x scripts/*.sh

# Build and start services
echo -e "${BLUE}🔨 Building and starting services...${NC}"

if [ "$ENVIRONMENT" = "production" ]; then
    # Production deployment
    echo -e "${BLUE}🏭 Deploying to production...${NC}"
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down --remove-orphans
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml up --build -d
    
    # Wait for services to be ready
    echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
    sleep 30
    
    # Check service health
    echo -e "${BLUE}🏥 Checking service health...${NC}"
    
    # Check frontend
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is healthy${NC}"
    else
        echo -e "${RED}❌ Frontend health check failed${NC}"
    fi
    
    # Check backend
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
    fi
    
    # Check database
    if docker exec quickcrm-database pg_isready -U ${DB_USER:-quickcrm_user} -d ${DB_NAME:-quickcrm} > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is healthy${NC}"
    else
        echo -e "${RED}❌ Database health check failed${NC}"
    fi
    
else
    # Development deployment
    echo -e "${BLUE}🛠️  Deploying to development...${NC}"
    docker-compose up --build -d
fi

# Show running containers
echo -e "${BLUE}📊 Running containers:${NC}"
docker-compose -f docker-compose.prod.yml ps

# Show logs
echo -e "${BLUE}📋 Recent logs:${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}🌐 Application URLs:${NC}"
echo -e "  - Frontend: http://localhost"
echo -e "  - Backend API: http://localhost:5000"
echo -e "  - Database: localhost:5432"

echo -e "${BLUE}📝 Useful commands:${NC}"
echo -e "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo -e "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo -e "  - Restart services: docker-compose -f docker-compose.prod.yml restart"
echo -e "  - Update services: docker-compose -f docker-compose.prod.yml up --build -d"

