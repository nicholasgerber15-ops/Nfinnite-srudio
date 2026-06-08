# Deployment Guide

## Overview

Nfinnite Studio can be deployed to various platforms:
- **GitHub Actions** (automated CI/CD)
- **Docker** (containerized)
- **Kubernetes** (orchestrated)
- **Cloud Platforms** (AWS, Azure, GCP, Heroku)
- **Traditional VPS** (Docker Compose)

## Prerequisites

### Secrets Required in GitHub

Add these secrets to your GitHub repository settings:

```
OPENAI_API_KEY              # OpenAI API key
ANTHROPIC_API_KEY           # Anthropic API key
DB_PASSWORD                 # PostgreSQL password
API_KEY_SECRET              # Secret key for API

# Staging Deployment
STAGING_DEPLOY_KEY          # SSH private key
STAGING_DEPLOY_HOST         # Server IP/domain
STAGING_DEPLOY_USER         # Deploy username
STAGING_DEPLOY_PATH         # Deployment path

# Production Deployment
PRODUCTION_DEPLOY_KEY       # SSH private key
PRODUCTION_DEPLOY_HOST      # Server IP/domain
PRODUCTION_DEPLOY_USER      # Deploy username
PRODUCTION_DEPLOY_PATH      # Deployment path

# Notifications
SLACK_WEBHOOK               # Slack webhook for notifications
```

## Automated Deployment (GitHub Actions)

### Deployment Flow

1. **Push to `main`** → Stages to staging environment
2. **Create version tag** (`git tag v1.0.0`) → Deploys to production

### Manual Deployment

```bash
# Trigger manual deployment
gh workflow run deploy.yml -f environment=production
```

### View Deployment Status

```bash
# List recent deployments
gh deployment list -R nicholasgerber15-ops/Nfinnite-srudio

# Watch workflow
gh run watch
```

## Docker Deployment

### Build Image

```bash
docker build -f docker/Dockerfile -t nfinnite-studio:1.0.0 .
```

### Run Container

```bash
docker run -d \
  -e OPENAI_API_KEY=sk-... \
  -e NODE_ENV=production \
  -p 3000:3000 \
  nfinnite-studio:1.0.0
```

### Push to Registry

```bash
# Tag image
docker tag nfinnite-studio:1.0.0 ghcr.io/nicholasgerber15-ops/nfinnite-srudio:1.0.0

# Login to registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Push
docker push ghcr.io/nicholasgerber15-ops/nfinnite-srudio:1.0.0
```

## Production Deployment (Docker Compose)

### Setup Server

```bash
# SSH to server
ssh user@your-server.com

# Clone repository
git clone https://github.com/nicholasgerber15-ops/Nfinnite-srudio.git
cd Nfinnite-srudio

# Create .env.prod
cat > .env.prod << EOF
NODE_ENV=production
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DB_PASSWORD=secure_password_here
API_KEY_SECRET=your_secret_key_here
DB_NAME=nfinnite
DB_USER=postgres
EOF

# Setup SSL certificates
mkdir -p docker/ssl
# Copy your SSL certs or generate with Let's Encrypt
```

### Deploy with Docker Compose

```bash
# Pull latest image
docker pull ghcr.io/nicholasgerber15-ops/nfinnite-srudio:latest

# Start services
docker-compose -f docker/docker-compose.prod.yml up -d

# View logs
docker-compose -f docker/docker-compose.prod.yml logs -f app

# Check status
docker-compose -f docker/docker-compose.prod.yml ps
```

### Health Check

```bash
curl https://api.nfinnite.ai/health
```

## Kubernetes Deployment

### Create Namespace

```bash
kubectl create namespace nfinnite
```

### Create Secrets

```bash
kubectl create secret generic nfinnite-secrets \
  --from-literal=openai-api-key=sk-... \
  --from-literal=anthropic-api-key=sk-ant-... \
  --from-literal=db-password=... \
  -n nfinnite
```

### Deploy with Helm (future)

```bash
helm repo add nfinnite https://charts.nfinnite.ai
helm install nfinnite nfinnite/nfinnite-studio -n nfinnite
```

## Cloud Platform Deployment

### [Azure App Service](https://docs.github.com/en/actions/how-tos/deploy/deploy-to-third-party-platforms/nodejs-to-azure-app-service)

1. Create App Service plan
2. Create Node.js web app
3. Add `AZURE_WEBAPP_PUBLISH_PROFILE` secret
4. Push code → Auto-deployed

### AWS ECS

```bash
# Create ECR repository
aws ecr create-repository --repository-name nfinnite-studio

# Build and push
docker build -t nfinnite-studio .
docker tag nfinnite-studio:latest $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/nfinnite-studio:latest
docker push $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/nfinnite-studio:latest

# Deploy with CloudFormation or Terraform
```

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/nfinnite-studio

# Deploy
gcloud run deploy nfinnite-studio \
  --image gcr.io/PROJECT_ID/nfinnite-studio \
  --platform managed \
  --region us-central1 \
  --set-env-vars OPENAI_API_KEY=sk-...
```

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create nfinnite-studio

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set OPENAI_API_KEY=sk-...

# Deploy
git push heroku main
```

## Post-Deployment

### Database Migrations

```bash
# SSH to server
ssh user@your-server.com
cd Nfinnite-srudio

# Run migrations
docker-compose -f docker/docker-compose.prod.yml exec app npm run migrate
```

### Monitoring

```bash
# View application logs
docker-compose -f docker/docker-compose.prod.yml logs -f app

# Monitor resources
docker stats

# Check health
curl https://api.nfinnite.ai/health/ready
```

### Backup

```bash
# Backup database
docker-compose -f docker/docker-compose.prod.yml exec postgres \
  pg_dump -U postgres nfinnite > backup.sql

# Backup volumes
docker run --rm -v nfinnite-postgres-data:/data \
  -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz /data
```

## Rollback

### Rollback to Previous Release

```bash
# Stop current deployment
docker-compose -f docker/docker-compose.prod.yml down

# Pull previous version
docker pull ghcr.io/nicholasgerber15-ops/nfinnite-srudio:previous-tag

# Update image in docker-compose.prod.yml
# Then restart
docker-compose -f docker/docker-compose.prod.yml up -d
```

## Troubleshooting

### Container won't start

```bash
# View detailed logs
docker-compose -f docker/docker-compose.prod.yml logs app

# Check environment variables
docker-compose -f docker/docker-compose.prod.yml exec app env

# Shell into container
docker-compose -f docker/docker-compose.prod.yml exec app sh
```

### Database connection issues

```bash
# Verify PostgreSQL is running
docker-compose -f docker/docker-compose.prod.yml ps postgres

# Test connection
docker-compose -f docker/docker-compose.prod.yml exec postgres \
  psql -U postgres -c "SELECT 1"
```

### High memory usage

```bash
# Check container stats
docker stats --no-stream

# Restart service
docker-compose -f docker/docker-compose.prod.yml restart app
```

## Scaling

### Horizontal Scaling

```bash
# Deploy multiple instances with load balancer
# Update docker-compose.prod.yml to scale app service
docker-compose -f docker/docker-compose.prod.yml up -d --scale app=3
```

### Performance Tuning

```yaml
# In docker-compose.prod.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Support

- Check [Setup Guide](./docs/SETUP.md)
- Review [Architecture](./docs/ARCHITECTURE.md)
- Open GitHub Issue
