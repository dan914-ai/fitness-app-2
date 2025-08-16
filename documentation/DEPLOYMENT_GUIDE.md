# Fitness App - Comprehensive Deployment Guide

## Table of Contents
1. [Server Requirements](#server-requirements)
2. [Database Setup Instructions](#database-setup-instructions)
3. [Environment Variables](#environment-variables)
4. [Docker Configuration](#docker-configuration)
5. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
6. [Monitoring and Logging](#monitoring-and-logging)
7. [Security Considerations](#security-considerations)
8. [Scaling Strategy](#scaling-strategy)
9. [Backup and Recovery](#backup-and-recovery)
10. [Troubleshooting](#troubleshooting)

## 1. Server Requirements

### Minimum Requirements (Development/Staging)
- **CPU**: 2 vCPUs
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Bandwidth**: 100 Mbps
- **OS**: Ubuntu 22.04 LTS or Amazon Linux 2

### Recommended Requirements (Production)
- **CPU**: 4-8 vCPUs
- **RAM**: 16GB
- **Storage**: 200GB SSD (with automatic scaling)
- **Bandwidth**: 1 Gbps
- **OS**: Ubuntu 22.04 LTS

### Software Requirements
- **Node.js**: 18.x or 20.x LTS
- **MySQL**: 8.0+
- **Redis**: 7.0+ (for caching and sessions)
- **Nginx**: 1.24+ (as reverse proxy)
- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **Git**: 2.40+

### Cloud Provider Recommendations
- **AWS**: EC2 t3.medium/large, RDS MySQL, ElastiCache, S3
- **Google Cloud**: Compute Engine n2-standard-2/4, Cloud SQL, Memorystore, Cloud Storage
- **Azure**: Standard D2s v3/D4s v3, Azure Database for MySQL, Azure Cache, Blob Storage

## 2. Database Setup Instructions

### MySQL Configuration

#### 2.1 Install MySQL 8.0
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server-8.0

# Amazon Linux 2
sudo yum install mysql80-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### 2.2 Secure MySQL Installation
```bash
sudo mysql_secure_installation
```

#### 2.3 Create Database and User
```sql
-- Connect to MySQL as root
sudo mysql -u root -p

-- Create database
CREATE DATABASE fitness_app_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER 'fitness_app'@'%' IDENTIFIED BY 'your_strong_password_here';
GRANT ALL PRIVILEGES ON fitness_app_prod.* TO 'fitness_app'@'%';

-- Create read-only user for analytics
CREATE USER 'fitness_analytics'@'%' IDENTIFIED BY 'analytics_password_here';
GRANT SELECT ON fitness_app_prod.* TO 'fitness_analytics'@'%';

FLUSH PRIVILEGES;
```

#### 2.4 Configure MySQL for Production
Edit `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
# Basic Settings
bind-address = 0.0.0.0
port = 3306
max_connections = 500
max_connect_errors = 10

# InnoDB Settings
innodb_buffer_pool_size = 8G  # 70% of RAM
innodb_log_file_size = 1G
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Query Cache (disabled in MySQL 8.0 by default)
query_cache_type = 0
query_cache_size = 0

# Slow Query Log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Character Set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Binary Logging (for replication)
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
expire_logs_days = 7
```

#### 2.5 Run Database Migrations
```bash
# Create schema structure
mysql -u fitness_app -p fitness_app_prod < schema/create_tables.sql

# Insert initial data
mysql -u fitness_app -p fitness_app_prod < schema/seed_data.sql

# Create indexes
mysql -u fitness_app -p fitness_app_prod < schema/create_indexes.sql
```

### Redis Configuration

#### 2.6 Install Redis
```bash
# Ubuntu/Debian
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
```

Redis configuration:
```conf
bind 127.0.0.1 ::1
protected-mode yes
port 6379
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## 3. Environment Variables

### 3.1 Create Environment Files

#### Production (.env.production)
```env
# Application
NODE_ENV=production
APP_NAME=FitnessApp
APP_URL=https://api.yourfitness.app
APP_PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=fitness_app_prod
DB_USERNAME=fitness_app
DB_PASSWORD=your_strong_password_here
DB_CONNECTION_LIMIT=100

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Session
SESSION_SECRET=your_session_secret_here_min_32_chars
SESSION_LIFETIME=86400

# JWT
JWT_SECRET=your_jwt_secret_here_min_64_chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_here_min_64_chars
JWT_REFRESH_EXPIRE=30d

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=fitness-app-uploads

# Email
MAIL_DRIVER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your_sendgrid_api_key
MAIL_FROM_ADDRESS=noreply@yourfitness.app
MAIL_FROM_NAME=Fitness App

# Push Notifications
FCM_SERVER_KEY=your_firebase_server_key
APNS_KEY_ID=your_apple_key_id
APNS_TEAM_ID=your_apple_team_id

# OAuth (Social Login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id

# AI Service
AI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4

# Monitoring
SENTRY_DSN=https://your_sentry_dsn@sentry.io/project_id
NEWRELIC_LICENSE_KEY=your_newrelic_key

# Feature Flags
FEATURE_AI_WORKOUTS=true
FEATURE_SOCIAL_FEED=true
FEATURE_PREMIUM_SUBSCRIPTION=true

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### 3.2 Environment Variable Management
```bash
# Install dotenv-cli
npm install -g dotenv-cli

# Load environment variables
dotenv -e .env.production -- node server.js

# Use environment-specific configs
cp .env.production /etc/fitness-app/.env
chmod 600 /etc/fitness-app/.env
```

## 4. Docker Configuration

### 4.1 Dockerfile (Application)
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

### 4.2 Docker Compose Configuration
```yaml
version: '3.9'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: fitness_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: fitness_app_prod
      MYSQL_USER: fitness_app
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/conf.d:/etc/mysql/conf.d
      - ./schema:/docker-entrypoint-initdb.d
    networks:
      - fitness_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: fitness_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - fitness_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 3s
      retries: 3

  # Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fitness_app
    restart: unless-stopped
    env_file:
      - .env.production
    ports:
      - "3000:3000"
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    networks:
      - fitness_network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: fitness_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/nginx/conf.d:/etc/nginx/conf.d
      - ./docker/nginx/ssl:/etc/nginx/ssl
      - ./static:/usr/share/nginx/html/static
    depends_on:
      - app
    networks:
      - fitness_network

volumes:
  mysql_data:
  redis_data:

networks:
  fitness_network:
    driver: bridge
```

### 4.3 Nginx Configuration
```nginx
# /docker/nginx/conf.d/fitness-app.conf
upstream fitness_app {
    least_conn;
    server app:3000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.yourfitness.app;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourfitness.app;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript;

    # API Routes
    location /api {
        proxy_pass http://fitness_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static Files
    location /static {
        alias /usr/share/nginx/html/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health Check
    location /health {
        access_log off;
        proxy_pass http://fitness_app/health;
    }
}
```

## 5. CI/CD Pipeline Setup

### 5.1 GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'yarn'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Run tests
        run: |
          yarn test:unit
          yarn test:integration
      
      - name: Run linting
        run: yarn lint
      
      - name: Check types
        run: yarn type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to Production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/fitness-app
            docker-compose pull
            docker-compose up -d --remove-orphans
            docker system prune -f
```

### 5.2 GitLab CI/CD Pipeline
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

# Test Stage
test:unit:
  stage: test
  image: node:20-alpine
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
  script:
    - yarn install --frozen-lockfile
    - yarn test:unit
  only:
    - merge_requests
    - main

test:integration:
  stage: test
  image: node:20-alpine
  services:
    - mysql:8.0
    - redis:7-alpine
  variables:
    MYSQL_ROOT_PASSWORD: test
    MYSQL_DATABASE: fitness_test
    DB_HOST: mysql
    REDIS_HOST: redis
  script:
    - yarn install --frozen-lockfile
    - yarn test:integration
  only:
    - merge_requests
    - main

# Build Stage
build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main

# Deploy Stage
deploy:production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
  script:
    - ssh -o StrictHostKeyChecking=no $PRODUCTION_USER@$PRODUCTION_HOST "
        cd /opt/fitness-app &&
        docker-compose pull &&
        docker-compose up -d --remove-orphans &&
        docker system prune -f
      "
  only:
    - main
  when: manual
```

## 6. Monitoring and Logging

### 6.1 Application Monitoring Setup

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'fitness-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/metrics'

  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql-exporter:9104']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

#### Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "title": "Fitness App Monitoring",
    "panels": [
      {
        "title": "API Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Database Connections",
        "targets": [
          {
            "expr": "mysql_global_status_threads_connected"
          }
        ]
      }
    ]
  }
}
```

### 6.2 Centralized Logging

#### ELK Stack Configuration
```yaml
# docker-compose.logging.yml
version: '3.9'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5000:5000"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  es_data:
```

#### Logstash Pipeline Configuration
```ruby
# logstash/pipeline/logstash.conf
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [type] == "api" {
    grok {
      match => {
        "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}"
      }
    }
  }
  
  if [type] == "mysql" {
    grok {
      match => {
        "message" => "%{TIMESTAMP_ISO8601:timestamp} %{NUMBER:thread_id} %{WORD:command} %{GREEDYDATA:query}"
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "fitness-app-%{type}-%{+YYYY.MM.dd}"
  }
}
```

### 6.3 Application Performance Monitoring (APM)

#### New Relic Configuration
```javascript
// newrelic.js
'use strict';

exports.config = {
  app_name: ['Fitness App Production'],
  license_key: process.env.NEWRELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  distributed_tracing: {
    enabled: true
  },
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated'
  },
  error_collector: {
    enabled: true,
    ignore_status_codes: [404]
  },
  browser_monitoring: {
    enable: true,
    auto_instrument: true
  }
};
```

#### Sentry Error Tracking
```javascript
// sentry.config.js
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  }
});
```

### 6.4 Health Checks and Alerts

#### Health Check Endpoint
```javascript
// healthcheck.js
const express = require('express');
const mysql = require('mysql2/promise');
const redis = require('redis');

const router = express.Router();

router.get('/health', async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    services: {}
  };

  // Check Database
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });
    await connection.query('SELECT 1');
    await connection.end();
    checks.services.database = 'healthy';
  } catch (error) {
    checks.services.database = 'unhealthy';
  }

  // Check Redis
  try {
    const client = redis.createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    });
    await client.connect();
    await client.ping();
    await client.quit();
    checks.services.redis = 'healthy';
  } catch (error) {
    checks.services.redis = 'unhealthy';
  }

  // Check S3
  try {
    // S3 health check logic
    checks.services.s3 = 'healthy';
  } catch (error) {
    checks.services.s3 = 'unhealthy';
  }

  const isHealthy = Object.values(checks.services).every(status => status === 'healthy');
  res.status(isHealthy ? 200 : 503).json(checks);
});

module.exports = router;
```

#### AlertManager Configuration
```yaml
# alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'team-notifications'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
    - match:
        severity: warning
      receiver: 'slack-warnings'

receivers:
  - name: 'team-notifications'
    slack_configs:
      - channel: '#fitness-app-alerts'
        title: 'Fitness App Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}\n{{ end }}'

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'
        description: '{{ .GroupLabels.alertname }}'

  - name: 'slack-warnings'
    slack_configs:
      - channel: '#fitness-app-warnings'
        send_resolved: true
```

## 7. Security Considerations

### 7.1 Application Security

#### Security Headers Middleware
```javascript
// security.middleware.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// API Key rate limiting for premium users
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
  skip: (req) => req.user?.isPremium
});

app.use('/api/', apiLimiter);
```

#### Input Validation
```javascript
// validation.middleware.js
const { body, validationResult } = require('express-validator');
const xss = require('xss');

// Sanitize input
const sanitizeInput = (req, res, next) => {
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      req.body[key] = xss(req.body[key]);
    }
  });
  next();
};

// Validation rules
const validationRules = {
  createWorkout: [
    body('workout_name').isString().isLength({ max: 255 }).trim(),
    body('exercises').isArray().notEmpty(),
    body('exercises.*.exercise_id').isInt(),
    body('exercises.*.sets').isArray().notEmpty(),
    body('exercises.*.sets.*.weight_kg').isFloat({ min: 0, max: 1000 }),
    body('exercises.*.sets.*.reps').isInt({ min: 1, max: 999 }),
  ],
  
  updateProfile: [
    body('username').optional().isAlphanumeric().isLength({ min: 3, max: 50 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('instagram_username').optional().matches(/^[a-zA-Z0-9._]{1,30}$/),
    body('weight_unit').optional().isIn(['kg', 'lbs']),
  ]
};
```

### 7.2 Infrastructure Security

#### Firewall Rules
```bash
# UFW Configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3306/tcp  # MySQL (restrict source IPs)
sudo ufw enable
```

#### SSL/TLS Configuration
```bash
# Let's Encrypt SSL Certificate
sudo certbot --nginx -d api.yourfitness.app -d www.yourfitness.app

# Auto-renewal
sudo certbot renew --dry-run
```

#### Database Security
```sql
-- Regular security audit
-- Check for users with excessive privileges
SELECT user, host, Super_priv, Grant_priv FROM mysql.user WHERE Super_priv = 'Y' OR Grant_priv = 'Y';

-- Check for anonymous users
SELECT user, host FROM mysql.user WHERE user = '';

-- Review grants
SHOW GRANTS FOR 'fitness_app'@'%';
```

## 8. Scaling Strategy

### 8.1 Horizontal Scaling

#### Load Balancer Configuration (HAProxy)
```
# haproxy.cfg
global
    maxconn 4096
    log stdout local0
    
defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog
    
frontend fitness_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/fitness-app.pem
    redirect scheme https if !{ ssl_fc }
    default_backend fitness_backend
    
backend fitness_backend
    balance roundrobin
    option httpchk GET /health
    server app1 10.0.1.10:3000 check
    server app2 10.0.1.11:3000 check
    server app3 10.0.1.12:3000 check
```

### 8.2 Database Scaling

#### MySQL Master-Slave Replication
```sql
-- On Master
CREATE USER 'replication'@'%' IDENTIFIED BY 'replication_password';
GRANT REPLICATION SLAVE ON *.* TO 'replication'@'%';
FLUSH PRIVILEGES;

SHOW MASTER STATUS;

-- On Slave
CHANGE MASTER TO
    MASTER_HOST='master_ip',
    MASTER_USER='replication',
    MASTER_PASSWORD='replication_password',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS=154;

START SLAVE;
SHOW SLAVE STATUS\G;
```

### 8.3 Caching Strategy

#### Redis Caching Implementation
```javascript
// cache.service.js
const redis = require('redis');
const { promisify } = require('util');

class CacheService {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    });
    
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  async get(key) {
    const data = await this.getAsync(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key, value, ttl = 3600) {
    await this.setAsync(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern) {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
}

// Usage example
const cache = new CacheService();

// Cache user profile
app.get('/api/users/:id', async (req, res) => {
  const cacheKey = `user:${req.params.id}`;
  
  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  // Fetch from database
  const user = await User.findById(req.params.id);
  
  // Cache for 1 hour
  await cache.set(cacheKey, user, 3600);
  
  res.json(user);
});
```

## 9. Backup and Recovery

### 9.1 Automated Backup Script
```bash
#!/bin/bash
# backup.sh

# Configuration
BACKUP_DIR="/backup/mysql"
S3_BUCKET="fitness-app-backups"
MYSQL_USER="backup_user"
MYSQL_PASS="backup_password"
MYSQL_DB="fitness_app_prod"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="fitness_backup_${DATE}.sql.gz"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Perform MySQL dump
mysqldump -u${MYSQL_USER} -p${MYSQL_PASS} \
  --single-transaction \
  --routines \
  --triggers \
  --databases ${MYSQL_DB} | gzip > ${BACKUP_DIR}/${BACKUP_FILE}

# Upload to S3
aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE} s3://${S3_BUCKET}/mysql/

# Clean up old local backups (keep last 7 days)
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +7 -delete

# Verify backup
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: ${BACKUP_FILE}"
    # Send success notification
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"MySQL backup completed successfully"}' \
      ${SLACK_WEBHOOK_URL}
else
    echo "Backup failed!"
    # Send failure notification
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"MySQL backup FAILED! Check immediately."}' \
      ${SLACK_WEBHOOK_URL}
fi
```

### 9.2 Backup Cron Jobs
```cron
# Crontab configuration
# MySQL backups - every 6 hours
0 */6 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1

# Redis backup - every hour
0 * * * * redis-cli BGSAVE >> /var/log/redis-backup.log 2>&1

# Application logs backup - daily
0 2 * * * tar -czf /backup/logs/app_logs_$(date +\%Y\%m\%d).tar.gz /var/log/fitness-app/ && aws s3 cp /backup/logs/app_logs_$(date +\%Y\%m\%d).tar.gz s3://fitness-app-backups/logs/

# Cleanup old backups - weekly
0 3 * * 0 aws s3 rm s3://fitness-app-backups/ --recursive --exclude "*" --include "*.sql.gz" --include "*.tar.gz" --older-than "30 days"
```

### 9.3 Disaster Recovery Plan

#### Recovery Procedures
```bash
#!/bin/bash
# restore.sh

# Configuration
S3_BUCKET="fitness-app-backups"
MYSQL_USER="root"
MYSQL_PASS="root_password"
RESTORE_DATE=$1

if [ -z "$RESTORE_DATE" ]; then
    echo "Usage: ./restore.sh YYYYMMDD"
    exit 1
fi

# Download backup from S3
echo "Downloading backup from ${RESTORE_DATE}..."
aws s3 cp s3://${S3_BUCKET}/mysql/ . --recursive --exclude "*" --include "*${RESTORE_DATE}*"

# Find the backup file
BACKUP_FILE=$(ls -1 fitness_backup_${RESTORE_DATE}*.sql.gz | head -n 1)

if [ -z "$BACKUP_FILE" ]; then
    echo "No backup found for date: ${RESTORE_DATE}"
    exit 1
fi

# Restore database
echo "Restoring database from ${BACKUP_FILE}..."
gunzip < ${BACKUP_FILE} | mysql -u${MYSQL_USER} -p${MYSQL_PASS}

# Verify restoration
if [ $? -eq 0 ]; then
    echo "Database restored successfully!"
    
    # Clear cache
    redis-cli FLUSHALL
    
    # Restart application
    docker-compose restart app
    
    echo "Recovery completed!"
else
    echo "Database restoration failed!"
    exit 1
fi
```

## 10. Troubleshooting

### 10.1 Common Issues and Solutions

#### Database Connection Issues
```bash
# Check MySQL status
sudo systemctl status mysql

# Check connection limit
mysql -u root -p -e "SHOW VARIABLES LIKE 'max_connections';"

# Monitor active connections
mysql -u root -p -e "SHOW PROCESSLIST;"

# Kill stuck queries
mysql -u root -p -e "KILL QUERY <process_id>;"
```

#### High Memory Usage
```bash
# Check memory usage
free -h
top -o %MEM

# Clear cache
sync && echo 3 > /proc/sys/vm/drop_caches

# Check for memory leaks
node --inspect=0.0.0.0:9229 server.js
# Use Chrome DevTools for heap snapshots
```

#### Slow API Response
```bash
# Enable slow query log
mysql -u root -p -e "SET GLOBAL slow_query_log = 'ON';"
mysql -u root -p -e "SET GLOBAL long_query_time = 2;"

# Analyze slow queries
pt-query-digest /var/log/mysql/slow.log

# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.yourfitness.app/health
```

### 10.2 Debug Mode Configuration
```javascript
// debug.config.js
if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
  // Enable detailed logging
  require('longjohn');
  
  // SQL query logging
  require('mysql2').debug = true;
  
  // Express route logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
  
  // Memory usage logging
  setInterval(() => {
    const used = process.memoryUsage();
    console.log('Memory Usage:', {
      rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(used.external / 1024 / 1024)}MB`,
    });
  }, 60000);
}
```

### 10.3 Emergency Response Procedures

#### Rollback Procedure
```bash
#!/bin/bash
# rollback.sh

# Get previous version
PREVIOUS_VERSION=$(docker images | grep fitness-app | head -2 | tail -1 | awk '{print $2}')

echo "Rolling back to version: ${PREVIOUS_VERSION}"

# Update docker-compose to use previous version
sed -i "s/fitness-app:latest/fitness-app:${PREVIOUS_VERSION}/g" docker-compose.yml

# Restart services
docker-compose down
docker-compose up -d

# Verify rollback
sleep 10
curl -f http://localhost:3000/health || exit 1

echo "Rollback completed successfully!"
```

## Conclusion

This deployment guide provides a comprehensive framework for deploying and maintaining the fitness app in production. Regular updates to this documentation should be made as the infrastructure evolves and new best practices emerge.

### Key Takeaways:
1. **Automation**: Automate as much as possible through CI/CD pipelines
2. **Monitoring**: Implement comprehensive monitoring from day one
3. **Security**: Follow security best practices and perform regular audits
4. **Backups**: Maintain regular backups and test recovery procedures
5. **Documentation**: Keep deployment documentation up to date

### Support Contacts:
- **DevOps Team**: devops@yourfitness.app
- **On-Call Engineer**: +1-XXX-XXX-XXXX
- **Escalation**: engineering-lead@yourfitness.app

---

*Last Updated: January 2025*
*Version: 1.0*