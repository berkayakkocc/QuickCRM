#!/bin/bash

# QuickCRM Monitoring Setup Script
# Usage: ./scripts/monitoring-setup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Setting up QuickCRM monitoring...${NC}"

# Create monitoring directory
mkdir -p monitoring

# Prometheus configuration
echo -e "${BLUE}📈 Creating Prometheus configuration...${NC}"
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'quickcrm-frontend'
    static_configs:
      - targets: ['frontend:80']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'quickcrm-backend'
    static_configs:
      - targets: ['backend:80']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'quickcrm-database'
    static_configs:
      - targets: ['database:5432']
    scrape_interval: 30s

  - job_name: 'quickcrm-redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
    scrape_interval: 30s
EOF

# Alert rules
echo -e "${BLUE}🚨 Creating alert rules...${NC}"
cat > monitoring/alert_rules.yml << 'EOF'
groups:
  - name: quickcrm.rules
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "{{ $labels.job }} has been down for more than 1 minute."

      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is above 80% for more than 5 minutes."

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is above 80% for more than 5 minutes."

      - alert: DiskSpaceLow
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space on {{ $labels.instance }}"
          description: "Disk space is below 20% on {{ $labels.instance }}."
EOF

# Grafana dashboard
echo -e "${BLUE}📊 Creating Grafana dashboard...${NC}"
cat > monitoring/grafana-dashboard.json << 'EOF'
{
  "dashboard": {
    "id": null,
    "title": "QuickCRM Monitoring",
    "tags": ["quickcrm"],
    "style": "dark",
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Service Status",
        "type": "stat",
        "targets": [
          {
            "expr": "up",
            "legendFormat": "{{ job }}"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 0
        }
      },
      {
        "id": 2,
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU Usage %"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 0
        }
      },
      {
        "id": 3,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "legendFormat": "Memory Usage %"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 8
        }
      },
      {
        "id": 4,
        "title": "Disk Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100",
            "legendFormat": "Disk Usage %"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 8
        }
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
EOF

# Log rotation configuration
echo -e "${BLUE}📝 Setting up log rotation...${NC}"
cat > monitoring/logrotate.conf << 'EOF'
/var/log/quickcrm/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f docker-compose.prod.yml restart nginx
    endscript
}
EOF

# Health check script
echo -e "${BLUE}🏥 Creating health check script...${NC}"
cat > monitoring/health-check.sh << 'EOF'
#!/bin/bash

# QuickCRM Health Check for Monitoring
# This script is designed to be run by monitoring systems

# Check if services are responding
check_service() {
    local service=$1
    local url=$2
    
    if curl -f -s "$url" > /dev/null 2>&1; then
        echo "1"  # Service is up
    else
        echo "0"  # Service is down
    fi
}

# Check frontend
check_service "frontend" "http://localhost/health"

# Check backend
check_service "backend" "http://localhost:5000/health"

# Check database
if docker exec quickcrm-database pg_isready -U quickcrm_user -d quickcrm > /dev/null 2>&1; then
    echo "1"
else
    echo "0"
fi

# Check Redis
if docker exec quickcrm-redis redis-cli ping > /dev/null 2>&1; then
    echo "1"
else
    echo "0"
fi
EOF

chmod +x monitoring/health-check.sh

# Create monitoring docker-compose
echo -e "${BLUE}🐳 Creating monitoring docker-compose...${NC}"
cat > monitoring/docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: quickcrm-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alert_rules.yml:/etc/prometheus/alert_rules.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - quickcrm-network

  grafana:
    image: grafana/grafana:latest
    container_name: quickcrm-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana-dashboard.json:/var/lib/grafana/dashboards/quickcrm.json
    networks:
      - quickcrm-network

  node-exporter:
    image: prom/node-exporter:latest
    container_name: quickcrm-node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - quickcrm-network

volumes:
  grafana-data:
    driver: local

networks:
  quickcrm-network:
    external: true
EOF

echo -e "${GREEN}✅ Monitoring setup completed!${NC}"
echo -e "${BLUE}📊 Monitoring URLs:${NC}"
echo -e "  - Prometheus: http://localhost:9090"
echo -e "  - Grafana: http://localhost:3001 (admin/admin123)"
echo -e "  - Node Exporter: http://localhost:9100"

echo -e "${BLUE}🚀 To start monitoring:${NC}"
echo -e "  docker-compose -f monitoring/docker-compose.monitoring.yml up -d"

echo -e "${BLUE}📝 Monitoring features:${NC}"
echo -e "  - Service health monitoring"
echo -e "  - CPU, Memory, Disk usage"
echo -e "  - Alert rules configured"
echo -e "  - Grafana dashboard ready"
echo -e "  - Log rotation configured"
