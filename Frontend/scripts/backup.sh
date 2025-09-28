#!/bin/bash

# QuickCRM Backup Script
# Usage: ./scripts/backup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="quickcrm_backup_${DATE}"

echo -e "${BLUE}💾 Starting QuickCRM backup...${NC}"

# Create backup directory
mkdir -p $BACKUP_DIR

# Load environment variables
if [ -f ".env.production" ]; then
    source .env.production
fi

# Database backup
echo -e "${BLUE}🗄️  Backing up database...${NC}"
docker exec quickcrm-database pg_dump -U ${DB_USER:-quickcrm_user} -d ${DB_NAME:-quickcrm} > "${BACKUP_DIR}/${BACKUP_NAME}_database.sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database backup completed${NC}"
else
    echo -e "${RED}❌ Database backup failed${NC}"
    exit 1
fi

# Application files backup
echo -e "${BLUE}📁 Backing up application files...${NC}"
tar -czf "${BACKUP_DIR}/${BACKUP_NAME}_files.tar.gz" \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=.git \
    --exclude=backups \
    --exclude=logs \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application files backup completed${NC}"
else
    echo -e "${RED}❌ Application files backup failed${NC}"
    exit 1
fi

# Docker volumes backup
echo -e "${BLUE}🐳 Backing up Docker volumes...${NC}"
docker run --rm -v quickcrm_postgres-data:/data -v $(pwd)/${BACKUP_DIR}:/backup alpine tar czf /backup/${BACKUP_NAME}_postgres-data.tar.gz -C /data .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PostgreSQL data backup completed${NC}"
else
    echo -e "${RED}❌ PostgreSQL data backup failed${NC}"
fi

# Redis data backup
echo -e "${BLUE}🔴 Backing up Redis data...${NC}"
docker run --rm -v quickcrm_redis-data:/data -v $(pwd)/${BACKUP_DIR}:/backup alpine tar czf /backup/${BACKUP_NAME}_redis-data.tar.gz -C /data .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Redis data backup completed${NC}"
else
    echo -e "${RED}❌ Redis data backup failed${NC}"
fi

# Create backup manifest
echo -e "${BLUE}📋 Creating backup manifest...${NC}"
cat > "${BACKUP_DIR}/${BACKUP_NAME}_manifest.txt" << EOF
QuickCRM Backup Manifest
========================
Date: $(date)
Backup Name: ${BACKUP_NAME}
Version: 1.0.0

Files included:
- ${BACKUP_NAME}_database.sql (PostgreSQL dump)
- ${BACKUP_NAME}_files.tar.gz (Application files)
- ${BACKUP_NAME}_postgres-data.tar.gz (PostgreSQL data volume)
- ${BACKUP_NAME}_redis-data.tar.gz (Redis data volume)

Database Information:
- Database: ${DB_NAME:-quickcrm}
- User: ${DB_USER:-quickcrm_user}

To restore:
1. Stop services: docker-compose -f docker-compose.prod.yml down
2. Restore database: docker exec -i quickcrm-database psql -U ${DB_USER:-quickcrm_user} -d ${DB_NAME:-quickcrm} < ${BACKUP_NAME}_database.sql
3. Restore volumes: docker run --rm -v quickcrm_postgres-data:/data -v \$(pwd):/backup alpine tar xzf /backup/${BACKUP_NAME}_postgres-data.tar.gz -C /data
4. Start services: docker-compose -f docker-compose.prod.yml up -d
EOF

# Calculate backup size
BACKUP_SIZE=$(du -sh "${BACKUP_DIR}/${BACKUP_NAME}"* | awk '{sum+=$1} END {print sum}' 2>/dev/null || echo "Unknown")

echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
echo -e "${BLUE}📊 Backup Information:${NC}"
echo -e "  - Backup Name: ${BACKUP_NAME}"
echo -e "  - Location: ${BACKUP_DIR}/"
echo -e "  - Size: ${BACKUP_SIZE}"

# Cleanup old backups (keep last 7 days)
echo -e "${BLUE}🧹 Cleaning up old backups...${NC}"
find $BACKUP_DIR -name "quickcrm_backup_*" -type f -mtime +7 -delete

echo -e "${GREEN}✅ Cleanup completed${NC}"
echo -e "${BLUE}💡 Tip: Consider uploading backups to cloud storage for disaster recovery${NC}"

