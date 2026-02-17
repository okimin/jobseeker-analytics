# Deployment Runbook

This document provides comprehensive procedures for deploying, maintaining, and recovering the JustAJobApp application. It serves as the operational runbook for the production environment.

## Table of Contents

- [Deployment Architecture](#deployment-architecture)
- [Automated Deployment](#automated-deployment)
- [Manual Deployment](#manual-deployment)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Post-Deployment Validation](#post-deployment-validation)
- [Rollback Procedures](#rollback-procedures)
- [Backup and Restore](#backup-and-restore)
- [Disaster Recovery](#disaster-recovery)
- [Secrets Management](#secrets-management)
- [Troubleshooting](#troubleshooting)

---

## Deployment Architecture

### Infrastructure Overview

| Component | Technology | Hosting |
|-----------|------------|---------|
| Frontend | Next.js 16+ | AWS Lightsail Container Service (`jaja-frontend`) |
| Backend | FastAPI/Python 3.11 | AWS Lightsail Container Service (`jaja-backend`) |
| Database | PostgreSQL 13 | AWS Lightsail Managed Database |
| CI/CD | GitHub Actions | GitHub-hosted runners |

### Service Endpoints

| Service | Container Port | Public Port | Health Check Path |
|---------|---------------|-------------|-------------------|
| Frontend | 3000 | 80 (HTTPS) | `/` |
| Backend | 8000 | 80 (HTTPS) | `/` |

### Deployment Flow

```
Push to main branch
         │
         ▼
GitHub Actions (cd.yml) triggered
         │
         ▼
    ┌────────────────────────┐
    │   Two Parallel Jobs    │
    └────────────────────────┘
         │           │
         ▼           ▼
   Backend Job   Frontend Job
         │           │
         ▼           ▼
   Build Image   Build Image
    (amd64)       (amd64)
         │           │
         ▼           ▼
   Push to AWS   Push to AWS
    Lightsail     Lightsail
         │           │
         ▼           ▼
   Deploy with   Deploy with
  Health Checks  Health Checks
         │           │
         ▼           ▼
      Live          Live
```

---

## Automated Deployment

### Trigger

Deployments are automatically triggered when code is pushed to the `main` branch.

### Workflow Location

- **Primary workflow**: `.github/workflows/cd.yml`
- **Backend action**: `.github/actions/deploy-backend-to-lightsail/action.yaml`
- **Frontend action**: `.github/actions/deploy-frontend-to-lightsail/action.yaml`

### Process

1. GitHub Actions runner checks out the repository
2. AWS CLI is configured with credentials from GitHub Secrets
3. Old container images are cleaned up from Lightsail
4. Docker images are built for `linux/amd64` platform
5. Images are pushed to AWS Lightsail container registry
6. New deployment is created with updated environment variables
7. Health checks validate the deployment (10s interval, 2 healthy/unhealthy thresholds)

### Monitoring Deployment Status

```bash
# Check backend deployment status
aws lightsail get-container-services --service-name jaja-backend \
  --query "containerServices[0].state"

# Check frontend deployment status
aws lightsail get-container-services --service-name jaja-frontend \
  --query "containerServices[0].state"

# View deployment logs
aws lightsail get-container-log --service-name jaja-backend \
  --container-name backend
```

### Expected Deployment States

| State | Description |
|-------|-------------|
| `DEPLOYING` | New deployment in progress |
| `RUNNING` | Deployment successful, service healthy |
| `READY` | Service ready to receive traffic |
| `DISABLED` | Service manually disabled |

---

## Manual Deployment

Use manual deployment only when automated deployment is unavailable or for emergency hotfixes.

### Prerequisites

1. AWS CLI v2 installed and configured
2. Docker installed (for building images)
3. Lightsail plugin installed:
   ```bash
   curl "https://s3.us-west-2.amazonaws.com/lightsailctl/latest/linux-amd64/lightsailctl" \
     -o "/usr/local/bin/lightsailctl"
   chmod +x /usr/local/bin/lightsailctl
   ```
4. Required environment variables set (see [Secrets Management](#secrets-management))

### Backend Manual Deployment

```bash
# 1. Navigate to repository root
cd /path/to/jobseeker-analytics

# 2. Build Docker image
docker build -t jaja-backend-backend:manual \
  --platform=linux/amd64 \
  ./backend

# 3. Push to Lightsail
aws lightsail push-container-image \
  --service-name jaja-backend \
  --label backend \
  --image jaja-backend-backend:manual

# 4. Get the image reference from the push output, then deploy
# Replace :jaja-backend.backend.X with the actual version number from step 3
aws lightsail create-container-service-deployment \
  --service-name jaja-backend \
  --containers '{
    "backend": {
      "image": ":jaja-backend.backend.latest",
      "environment": {
        "DATABASE_URL": "'"${DATABASE_URL}"'",
        "COOKIE_SECRET": "'"${COOKIE_SECRET}"'",
        "GOOGLE_API_KEY": "'"${GOOGLE_API_KEY}"'",
        "GOOGLE_CLIENT_ID": "'"${GOOGLE_CLIENT_ID}"'",
        "GOOGLE_CLIENT_SECRET": "'"${GOOGLE_CLIENT_SECRET}"'",
        "GOOGLE_CLIENT_REDIRECT_URI": "'"${GOOGLE_CLIENT_REDIRECT_URI}"'",
        "STRIPE_SECRET_KEY": "'"${STRIPE_SECRET_KEY}"'",
        "STRIPE_WEBHOOK_SECRET": "'"${STRIPE_WEBHOOK_SECRET}"'",
        "TOKEN_ENCRYPTION_KEY": "'"${TOKEN_ENCRYPTION_KEY}"'",
        "APP_URL": "'"${APP_URL}"'",
        "API_URL": "'"${API_URL}"'",
        "ORIGIN": "'"${ORIGIN}"'",
        "ENV": "prod"
      },
      "ports": {"8000": "HTTP"}
    }
  }' \
  --public-endpoint '{
    "containerName": "backend",
    "containerPort": 8000,
    "healthCheck": {
      "path": "/",
      "intervalSeconds": 10,
      "healthyThreshold": 2,
      "unhealthyThreshold": 2,
      "timeoutSeconds": 5,
      "successCodes": "200-499"
    }
  }'
```

### Frontend Manual Deployment

```bash
# 1. Navigate to repository root
cd /path/to/jobseeker-analytics

# 2. Build Docker image with build-time args
docker build \
  --build-arg NEXT_PUBLIC_API_URL="${API_URL}" \
  --build-arg NEXT_PUBLIC_APP_URL="${APP_URL}" \
  -t jaja-frontend-frontend:manual \
  --platform=linux/amd64 \
  ./frontend

# 3. Push to Lightsail
aws lightsail push-container-image \
  --service-name jaja-frontend \
  --label frontend \
  --image jaja-frontend-frontend:manual

# 4. Deploy
aws lightsail create-container-service-deployment \
  --service-name jaja-frontend \
  --containers '{
    "frontend": {
      "image": ":jaja-frontend.frontend.latest",
      "environment": {
        "NODE_ENV": "production",
        "NEXT_PUBLIC_APP_URL": "'"${APP_URL}"'",
        "NEXT_PUBLIC_API_URL": "'"${API_URL}"'",
        "APP_URL": "'"${APP_URL}"'",
        "GH_APP_ID": "'"${GH_APP_ID}"'",
        "GH_PRIVATE_KEY": "'"${GH_PRIVATE_KEY}"'",
        "GH_INSTALLATION_ID": "'"${GH_INSTALLATION_ID}"'"
      },
      "ports": {"3000": "HTTP"}
    }
  }' \
  --public-endpoint '{
    "containerName": "frontend",
    "containerPort": 3000,
    "healthCheck": {
      "path": "/",
      "intervalSeconds": 10,
      "healthyThreshold": 2,
      "unhealthyThreshold": 2,
      "timeoutSeconds": 5,
      "successCodes": "200-499"
    }
  }'
```

---

## Pre-Deployment Checklist

Complete this checklist before any production deployment:

### Code Quality

- [ ] All tests pass locally (`pytest` for backend, `npm test` for frontend)
- [ ] Linting passes (`ruff check` for backend, `npm run lint` for frontend)
- [ ] No TypeScript errors (`npm run build` completes successfully)
- [ ] PR has been reviewed and approved
- [ ] No security vulnerabilities in dependencies (check Dependabot/Snyk alerts)

### Database

- [ ] Database migrations are included if schema changes are needed
- [ ] Migrations have been tested locally
- [ ] Migrations are backward-compatible (can roll back if needed)
- [ ] No destructive migrations (DROP TABLE, DROP COLUMN) without explicit approval

### Configuration

- [ ] All required environment variables are configured in GitHub Secrets
- [ ] No hardcoded secrets in code
- [ ] API endpoint URLs are correct for production

### Communication

- [ ] Team is aware of the deployment
- [ ] Users have been notified if downtime is expected
- [ ] Rollback plan is ready

---

## Post-Deployment Validation

After each deployment, verify the following:

### Automated Health Checks

The deployment includes automated health checks:
- **Interval**: 10 seconds
- **Healthy threshold**: 2 consecutive successful checks
- **Unhealthy threshold**: 2 consecutive failed checks
- **Timeout**: 5 seconds per check
- **Success codes**: 200-499

### Manual Validation Steps

1. **Verify services are running**:
   ```bash
   # Check service status
   aws lightsail get-container-services --service-name jaja-backend
   aws lightsail get-container-services --service-name jaja-frontend
   ```

2. **Test authentication flow**:
   - Navigate to the application URL
   - Click "Login with Google"
   - Complete OAuth flow
   - Verify dashboard loads correctly

3. **Test critical functionality**:
   - [ ] User can view dashboard
   - [ ] Email sync initiates correctly (for premium users)
   - [ ] Payment flow works (test mode)
   - [ ] Coach features work (if applicable)

4. **Check for errors in logs**:
   ```bash
   aws lightsail get-container-log \
     --service-name jaja-backend \
     --container-name backend
   ```

5. **Verify database connectivity**:
   - Check that the application can connect to the database
   - Verify migrations ran successfully (if applicable)


6. **Verify security configuration integrity**
   - Verify that the application's security posture (defined by `get_security_fingerprint`) has not drifted unintentionally during deployment. Current_Hash is only accessible by maintainers.
     1. **Match:** `Current_Hash == Previous_Hash`. (Pass: Configuration is unchanged).
     2. **Intentional Mismatch:** `Current_Hash != Previous_Hash` AND the associated commit message or PR explicitly authorizes a configuration change (e.g., "Rotate Stripe Webhook Secret").
     3. **Unknown Mismatch:** `Current_Hash != Previous_Hash` with no documented authorization.

   - *Execute these steps for a Mismatch.*
     * **If the change was accidental:** Revert the environment variable in GitHub Secrets and re-run the job.
     * **If the change was intentional:** Update the "stored" hash and document the rotation in the deployment changelog.


---

## Rollback Procedures

### When to Rollback

Initiate rollback if:
- Health checks fail after deployment
- Critical functionality is broken
- Significant increase in error rates
- Security vulnerability discovered in new code

### Rollback Methods

#### Method 1: Redeploy Previous Git Commit (Recommended)

```bash
# 1. Identify the last known good commit
git log --oneline -10

# 2. Create a rollback branch
git checkout -b rollback/<issue-description> <good-commit-sha>

# 3. Push to trigger deployment
git push origin rollback/<issue-description>

# 4. Merge to main after verification
git checkout main
git merge rollback/<issue-description>
git push origin main
```

#### Method 2: Redeploy Previous Container Image

```bash
# 1. List available images
aws lightsail get-container-images --service-name jaja-backend

# 2. Identify the previous working image (e.g., :jaja-backend.backend.5)

# 3. Redeploy with the previous image
aws lightsail create-container-service-deployment \
  --service-name jaja-backend \
  --containers '{
    "backend": {
      "image": ":jaja-backend.backend.5",
      ... (same environment variables as current deployment)
    }
  }' \
  --public-endpoint '{ ... }'
```

#### Method 3: Database Migration Rollback

If the issue is related to database migrations:

```bash
# 1. Connect to a machine with database access

# 2. Check current migration version
alembic current

# 3. Downgrade to previous version
alembic downgrade -1

# 4. Or downgrade to specific version
alembic downgrade <revision_id>
```

**Warning**: Only rollback migrations if you're certain the rollback is safe and won't cause data loss.

### Rollback Verification

After rollback:
1. Verify services are healthy
2. Test critical user flows
3. Check error rates return to normal
4. Document the incident

---

## Backup and Restore

### Database Backups

#### AWS Lightsail Automated Backups

AWS Lightsail managed databases include automated backups:

| Setting | Value |
|---------|-------|
| Backup retention | 7 days (default) |
| Backup window | Automatic (AWS-managed) |
| Point-in-time recovery | Supported |

#### Create Manual Backup (Snapshot)

```bash
# Create a snapshot before major changes
aws lightsail create-relational-database-snapshot \
  --relational-database-name <your-database-name> \
  --relational-database-snapshot-name "pre-deployment-$(date +%Y%m%d-%H%M%S)"

# List available snapshots
aws lightsail get-relational-database-snapshots
```

#### Export Database (pg_dump)

For complete database exports:

```bash
# 1. Get database connection info
aws lightsail get-relational-database \
  --relational-database-name <your-database-name>

# 2. Get master password
aws lightsail get-relational-database-master-user-password \
  --relational-database-name <your-database-name>

# 3. Export database
PGPASSWORD="<master-password>" pg_dump \
  -h <endpoint-address> \
  -p <port> \
  -U <master-username> \
  -d <database-name> \
  -F c \
  -f backup-$(date +%Y%m%d-%H%M%S).dump
```

### Restore Procedures

#### Restore from Lightsail Snapshot

```bash
# 1. List available snapshots
aws lightsail get-relational-database-snapshots

# 2. Create new database from snapshot
aws lightsail create-relational-database-from-snapshot \
  --relational-database-name <new-database-name> \
  --relational-database-snapshot-name <snapshot-name> \
  --availability-zone <az> \
  --publicly-accessible

# 3. Update application to use new database
# Update DATABASE_URL in GitHub Secrets and redeploy
```

#### Restore from pg_dump Export

```bash
# 1. Create new database (if needed)
PGPASSWORD="<password>" psql \
  -h <endpoint> -U <username> \
  -c "CREATE DATABASE restored_db;"

# 2. Restore from dump
PGPASSWORD="<password>" pg_restore \
  -h <endpoint> \
  -p <port> \
  -U <username> \
  -d restored_db \
  -F c \
  backup-YYYYMMDD-HHMMSS.dump
```

### Application State Backup

The application is stateless beyond the database. To fully restore:

1. **Code**: Available in Git repository
2. **Configuration**: Stored in GitHub Secrets
3. **Database**: Restore from snapshot or pg_dump
4. **Container Images**: Rebuilt from source code

---

## Disaster Recovery

### Recovery Time Objectives

| Scenario | RTO Target | RPO Target |
|----------|------------|------------|
| Container failure | < 5 minutes | 0 (stateless) |
| Database failure | < 30 minutes | < 1 hour |
| Region failure | < 4 hours | < 1 hour |
| Complete rebuild | < 8 hours | Last backup |

### Disaster Scenarios and Recovery

#### Scenario 1: Container Service Failure

**Symptoms**: Service unreachable, health checks failing

**Recovery**:
```bash
# 1. Check service status
aws lightsail get-container-services --service-name jaja-backend

# 2. If DISABLED, re-enable
aws lightsail update-container-service \
  --service-name jaja-backend \
  --power nano \
  --scale 1 \
  --is-disabled false

# 3. If still failing, redeploy
# Trigger by pushing to main or manual deployment
```

#### Scenario 2: Database Corruption or Failure

**Symptoms**: Application errors, database connection failures

**Recovery**:
```bash
# 1. Check database status
aws lightsail get-relational-database \
  --relational-database-name <database-name>

# 2. If database is down, restore from latest snapshot
aws lightsail create-relational-database-from-snapshot \
  --relational-database-name <new-database-name> \
  --relational-database-snapshot-name <latest-snapshot>

# 3. Update DATABASE_URL in GitHub Secrets

# 4. Redeploy application
```

#### Scenario 3: Complete Infrastructure Loss

**Recovery Steps**:

1. **Recreate Lightsail Container Services**:
   ```bash
   aws lightsail create-container-service \
     --service-name jaja-backend \
     --power nano \
     --scale 1

   aws lightsail create-container-service \
     --service-name jaja-frontend \
     --power nano \
     --scale 1
   ```

2. **Restore Database**: Follow [Restore Procedures](#restore-procedures)

3. **Configure Secrets**: Ensure all GitHub Secrets are configured

4. **Deploy Application**: Push to main branch or manual deploy

5. **Verify**: Complete [Post-Deployment Validation](#post-deployment-validation)

### Regular DR Testing

Recommended quarterly:
- [ ] Test database restore from snapshot
- [ ] Verify backup integrity (restore to test environment)
- [ ] Practice rollback procedures
- [ ] Review and update this runbook

---

## Secrets Management

### GitHub Secrets (Production)

All production secrets are stored in GitHub Secrets under the `prod` environment.

| Secret | Purpose | Rotation Frequency |
|--------|---------|-------------------|
| `AWS_ACCESS_KEY_ID` | AWS API access | Annual |
| `AWS_SECRET_ACCESS_KEY` | AWS API access | Annual |
| `AWS_REGION` | AWS region | N/A (config) |
| `COOKIE_SECRET` | Session signing | Annual |
| `TOKEN_ENCRYPTION_KEY` | OAuth token encryption | Annual |
| `GOOGLE_CLIENT_ID` | OAuth client | As needed |
| `GOOGLE_CLIENT_SECRET` | OAuth client | As needed |
| `GOOGLE_API_KEY` | Gemini API | As needed |
| `STRIPE_SECRET_KEY` | Payment processing | As needed |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification | As needed |
| `GH_APP_ID` | GitHub App | N/A |
| `GH_PRIVATE_KEY` | GitHub App | Annual |
| `GH_INSTALLATION_ID` | GitHub App | N/A |

### Secret Rotation Procedure

1. Generate new secret value
2. Update in GitHub Secrets (Settings > Secrets > Actions)
3. Trigger new deployment to apply
4. Verify application functionality
5. Revoke old secret (if applicable)

### Local Development

Local secrets are stored in:
- `backend/.env` (gitignored)
- `frontend/.env` (gitignored)

See `backend/.env.example` and `frontend/.env.sample` for required variables.

---

## Troubleshooting

### Common Issues

#### Deployment Stuck in DEPLOYING State

```bash
# Check deployment status and logs
aws lightsail get-container-services --service-name jaja-backend

aws lightsail get-container-log \
  --service-name jaja-backend \
  --container-name backend
```

**Common causes**:
- Docker image build failure
- Health check failures
- Invalid environment variables

#### Health Checks Failing

```bash
# Test health endpoint directly
curl -v https://<service-url>/
```

**Common causes**:
- Application crash on startup
- Database connection issues
- Missing environment variables

#### Database Connection Errors

```bash
# Verify database is accessible
aws lightsail get-relational-database \
  --relational-database-name <database-name>

# Check if database is in AVAILABLE state
```

**Common causes**:
- Database password changed
- Network/security group issues
- Database at capacity

#### Container Image Push Failures

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check Lightsail service exists
aws lightsail get-container-services
```

### Log Access

```bash
# Backend logs
aws lightsail get-container-log \
  --service-name jaja-backend \
  --container-name backend

# Frontend logs
aws lightsail get-container-log \
  --service-name jaja-frontend \
  --container-name frontend

# Filter by time (last hour)
aws lightsail get-container-log \
  --service-name jaja-backend \
  --container-name backend \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ)
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-08 | Deployment Team | Initial runbook creation |
