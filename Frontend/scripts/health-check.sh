#!/bin/bash

# QuickCRM Health Check Script
# Usage: ./scripts/health-check.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏥 QuickCRM Health Check${NC}"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Check if containers are running
echo -e "${BLUE}📊 Checking container status...${NC}"

# Frontend check
if docker ps | grep -q "quickcrm-frontend"; then
    echo -e "${GREEN}✅ Frontend container is running${NC}"
    
    # Check frontend health
    if curl -f http://localhost/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is responding${NC}"
    else
        echo -e "${RED}❌ Frontend is not responding${NC}"
    fi
else
    echo -e "${RED}❌ Frontend container is not running${NC}"
fi

# Backend check
if docker ps | grep -q "quickcrm-backend"; then
    echo -e "${GREEN}✅ Backend container is running${NC}"
    
    # Check backend health
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is responding${NC}"
    else
        echo -e "${RED}❌ Backend is not responding${NC}"
    fi
else
    echo -e "${RED}❌ Backend container is not running${NC}"
fi

# Database check
if docker ps | grep -q "quickcrm-database"; then
    echo -e "${GREEN}✅ Database container is running${NC}"
    
    # Check database health
    if docker exec quickcrm-database pg_isready -U quickcrm_user -d quickcrm > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is responding${NC}"
    else
        echo -e "${RED}❌ Database is not responding${NC}"
    fi
else
    echo -e "${RED}❌ Database container is not running${NC}"
fi

# Redis check
if docker ps | grep -q "quickcrm-redis"; then
    echo -e "${GREEN}✅ Redis container is running${NC}"
    
    # Check Redis health
    if docker exec quickcrm-redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis is responding${NC}"
    else
        echo -e "${RED}❌ Redis is not responding${NC}"
    fi
else
    echo -e "${RED}❌ Redis container is not running${NC}"
fi

# Check disk space
echo -e "${BLUE}💾 Checking disk space...${NC}"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}✅ Disk usage: ${DISK_USAGE}%${NC}"
else
    echo -e "${YELLOW}⚠️  Disk usage: ${DISK_USAGE}% (Warning: High usage)${NC}"
fi

# Check memory usage
echo -e "${BLUE}🧠 Checking memory usage...${NC}"
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -lt 80 ]; then
    echo -e "${GREEN}✅ Memory usage: ${MEMORY_USAGE}%${NC}"
else
    echo -e "${YELLOW}⚠️  Memory usage: ${MEMORY_USAGE}% (Warning: High usage)${NC}"
fi

# Check logs for errors
echo -e "${BLUE}📋 Checking recent errors...${NC}"
ERROR_COUNT=$(docker-compose -f docker-compose.prod.yml logs --tail=100 2>&1 | grep -i error | wc -l)
if [ $ERROR_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ No recent errors found${NC}"
else
    echo -e "${YELLOW}⚠️  Found ${ERROR_COUNT} recent errors${NC}"
    echo -e "${BLUE}Recent errors:${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=50 2>&1 | grep -i error | tail -5
fi

echo "================================"
echo -e "${BLUE}🏥 Health check completed${NC}"
