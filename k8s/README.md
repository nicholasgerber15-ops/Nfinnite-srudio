# Kubernetes Deployment Guide

## Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Helm (optional)
- cert-manager (for SSL)

## Quick Start

### 1. Install cert-manager

```bash
# Add Helm repo
helm repo add jetstack https://charts.jetstack.io
helm repo update

# Install cert-manager
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.13.0
```

### 2. Create Secrets

```bash
# Create secrets for sensitive data
kubectl create namespace nfinnite

kubectl create secret generic nfinnite-secrets \
  --from-literal=OPENAI_API_KEY=sk-... \
  --from-literal=ANTHROPIC_API_KEY=sk-ant-... \
  --from-literal=DB_PASSWORD=your_secure_password \
  --from-literal=API_KEY_SECRET=your_secret_key \
  --from-literal=REDIS_PASSWORD=your_redis_password \
  -n nfinnite

# Create imagePullSecret for GitHub Container Registry
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=your_github_username \
  --docker-password=your_github_token \
  -n nfinnite
```

### 3. Deploy Applications

```bash
# Deploy databases (PostgreSQL, Redis)
kubectl apply -f k8s/databases.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n nfinnite --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n nfinnite --timeout=300s

# Deploy application
kubectl apply -f k8s/app.yaml

# Deploy Ingress
kubectl apply -f k8s/ingress.yaml
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n nfinnite

# Check services
kubectl get svc -n nfinnite

# Check ingress
kubectl get ingress -n nfinnite

# View logs
kubectl logs -n nfinnite deployment/nfinnite-api -f

# Port forward for testing
kubectl port-forward -n nfinnite svc/nfinnite-api 3000:3000
# Visit http://localhost:3000/health
```

## Configuration

### Scale Replicas

```bash
kubectl scale deployment nfinnite-api -n nfinnite --replicas=5
```

### Update Image

```bash
kubectl set image deployment/nfinnite-api \
  api=ghcr.io/nicholasgerber15-ops/nfinnite-srudio:v1.0.0 \
  -n nfinnite
```

### Update ConfigMap

```bash
kubectl edit configmap nfinnite-config -n nfinnite
```

### Update Secrets

```bash
# Create new secret
kubectl create secret generic nfinnite-secrets-new \
  --from-literal=OPENAI_API_KEY=sk-... \
  -n nfinnite --dry-run=client -o yaml | kubectl apply -f -

# Restart pods to pick up new secret
kubectl rollout restart deployment/nfinnite-api -n nfinnite
```

## Monitoring

### View Resource Usage

```bash
# Node stats
kubectl top nodes

# Pod stats
kubectl top pods -n nfinnite
```

### Check HPA Status

```bash
kubectl get hpa -n nfinnite
kubectl describe hpa nfinnite-api-hpa -n nfinnite
```

### View Events

```bash
kubectl get events -n nfinnite --sort-by='.lastTimestamp'
```

## Logging

### View Logs

```bash
# Current deployment logs
kubectl logs -n nfinnite deployment/nfinnite-api -f

# Specific pod logs
kubectl logs -n nfinnite pod/nfinnite-api-xxxxx -f

# Previous container logs (after restart)
kubectl logs -n nfinnite pod/nfinnite-api-xxxxx --previous
```

### Stream Logs to File

```bash
kubectl logs -n nfinnite deployment/nfinnite-api -f > app.log
```

## Debugging

### Shell into Pod

```bash
kubectl exec -it -n nfinnite pod/nfinnite-api-xxxxx -- sh
```

### Describe Pod

```bash
kubectl describe pod nfinnite-api-xxxxx -n nfinnite
```

### Check Pod Events

```bash
kubectl describe pod nfinnite-api-xxxxx -n nfinnite | grep -A 20 Events
```

## Maintenance

### Database Backup

```bash
# Port forward to PostgreSQL
kubectl port-forward -n nfinnite svc/postgres 5432:5432 &

# Backup
pg_dump -h localhost -U postgres -d nfinnite > backup.sql

# Restore
psql -h localhost -U postgres -d nfinnite < backup.sql
```

### Migration

```bash
# Run database migrations
kubectl exec -n nfinnite deployment/nfinnite-api -- npm run migrate
```

## Cleanup

### Delete Deployment

```bash
# Delete application
kubectl delete -f k8s/app.yaml -n nfinnite

# Delete databases
kubectl delete -f k8s/databases.yaml -n nfinnite

# Delete ingress
kubectl delete -f k8s/ingress.yaml -n nfinnite

# Delete namespace
kubectl delete namespace nfinnite
```

## Production Best Practices

1. **Resource Limits**: Set appropriate CPU/memory limits
2. **Health Checks**: Configure liveness and readiness probes
3. **Pod Disruption Budget**: Protect critical pods
4. **Network Policies**: Restrict traffic between pods
5. **RBAC**: Use minimal required permissions
6. **Secrets**: Encrypt secrets at rest
7. **Monitoring**: Setup Prometheus and Grafana
8. **Logging**: Use centralized logging (ELK, Loki)
9. **Backup**: Regular database backups
10. **Updates**: Use gradual rollouts with canary deployments

## Troubleshooting

### Pod stuck in Pending

```bash
# Check events
kubectl describe pod <pod-name> -n nfinnite

# Might be resource constraints
kubectl top nodes
```

### ImagePullBackOff

```bash
# Verify image exists
docker pull ghcr.io/nicholasgerber15-ops/nfinnite-srudio:latest

# Check imagePullSecret
kubectl get secret ghcr-secret -n nfinnite
```

### CrashLoopBackOff

```bash
# Check logs
kubectl logs <pod-name> -n nfinnite

# Check previous logs
kubectl logs <pod-name> -n nfinnite --previous
```

## Support

- Check [DEPLOYMENT.md](../DEPLOYMENT.md) for general deployment
- Review [Architecture](../docs/ARCHITECTURE.md)
- Open GitHub Issue
