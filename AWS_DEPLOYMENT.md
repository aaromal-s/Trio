# AegisOps AI — Production Deployment Guide (Vercel & AWS)

This guide documents the enterprise production deployment architectures for **AegisOps AI**, detailing step-by-step instructions, environment variable configurations, SSL/TLS setup, and cloud cost management.

---

## Architecture Overview

```
                                  +------------------------------+
                                  |     Users / Global SREs      |
                                  +--------------+---------------+
                                                 |
                       +-------------------------+-------------------------+
                       | HTTPS                                             | HTTPS
                       v                                                   v
         +---------------------------+                       +---------------------------+
         |     Vercel Edge CDN       |                       |   AWS App Runner / ALB    |
         |  (React 19 + Vite Static) |                       | (FastAPI + Python Engine) |
         +-------------+-------------+                       +-------------+-------------+
                       |                                                   |
                       | Calls API via HTTPS                               | Queries & Audits
                       | (VITE_API_BASE_URL)                               v
                       +-------------------------------------> +---------------------------+
                                                               |   Amazon RDS PostgreSQL   |
                                                               |    (Multi-AZ Storage)     |
                                                               +---------------------------+
```

---

## Option 1: Hybrid Decoupled Deployment (Recommended)
- **Frontend**: Vercel (Edge CDN, Instant Rollbacks, Automatic Previews)
- **Backend API**: AWS App Runner (Fully Managed Container Service, Automatic TLS, Auto-scaling)
- **Database**: Amazon RDS for PostgreSQL (Engine v16.x)

### 1. Database Provisioning (Amazon RDS PostgreSQL)

1. Launch an RDS PostgreSQL instance in your target AWS region (e.g., `us-east-1`):
   ```bash
   aws rds create-db-instance \
       --db-instance-identifier aegisops-prod-db \
       --db-instance-class db.t4g.micro \
       --engine postgres \
       --engine-version 16.3 \
       --allocated-storage 20 \
       --master-username aegis_admin \
       --master-user-password "YourStrongProdPassword123!" \
       --backup-retention-period 7 \
       --publicly-accessible false \
       --vpc-security-group-ids sg-xxxxxxxxx
   ```
2. Note the database endpoint:
   `aegisops-prod-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432`

---

### 2. Backend Deployment (AWS App Runner)

AWS App Runner provides seamless HTTPS container hosting with built-in health checks and automatic zero-downtime rolling deploys.

1. **Build and Push the Container to AWS ECR**:
   ```bash
   # Log in to Amazon ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

   # Create repository
   aws ecr create-repository --repository-name aegisops-backend --region us-east-1

   # Tag & push
   docker build -t aegisops-backend:latest ./backend
   docker tag aegisops-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/aegisops-backend:latest
   docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/aegisops-backend:latest
   ```

2. **Configure App Runner Service**:
   Create an App Runner service using the pushed image.
   - **Port**: `8000`
   - **Health Check Path**: `/api/v1/system/health`
   - **Health Check Protocol**: `HTTP`
   - **Environment Variables**:
     ```env
     SECRET_KEY=generate_a_64_char_cryptographically_secure_random_key_here
     DATABASE_URL=postgresql://aegis_admin:YourStrongProdPassword123!@aegisops-prod-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/aegisops
     CORS_ORIGINS=https://aegisops.vercel.app,https://yourdomain.com
     TELEMETRY_REFRESH_INTERVAL_SECONDS=5
     ```

3. App Runner will generate an HTTPS endpoint:
   `https://xxxxxx.us-east-1.awsapprunner.com`

---

### 3. Frontend Deployment (Vercel)

1. **Install Vercel CLI & Link Repository**:
   ```bash
   cd frontend
   npx -y vercel
   ```

2. **Configure Environment Variables on Vercel**:
   In the Vercel Dashboard under **Project Settings > Environment Variables**:
   - `VITE_API_BASE_URL`: `https://xxxxxx.us-east-1.awsapprunner.com/api/v1`

3. **Deploy to Production**:
   ```bash
   npx -y vercel --prod
   ```

4. The frontend is automatically deployed to global edge locations with SSL, SPA routing rules from `vercel.json`, and instant asset caching.

---

## Option 2: Full AWS Native Architecture (Single Cloud)

If your enterprise requires all compute and edge assets to remain within AWS:

- **Frontend**: Amazon S3 (Static Hosting) + Amazon CloudFront (CDN + SSL via AWS Certificate Manager)
- **Backend API**: AWS ECS Fargate or AWS App Runner
- **Database**: Amazon RDS PostgreSQL with Private Subnet peering

### S3 & CloudFront Deployment:
```bash
# Build production bundle
cd frontend
npm run build

# Sync dist/ to S3 bucket
aws s3 sync dist/ s3://aegisops-static-frontend-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E123456789 --paths "/*"
```

---

## Cost Optimization & Free Tier Considerations

| Component | Service | Tier / Sizing | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel Hobby / AWS S3+CloudFront | Edge CDN Static Hosting | $0.00 (Free Tier eligible) |
| **Backend API** | AWS App Runner | 1 vCPU, 2 GB RAM (Pause on idle) | ~$5.00 - $15.00 / month |
| **Database** | Amazon RDS PostgreSQL | `db.t4g.micro` (Single-AZ) | Eligible for 750 hrs/mo free tier (Year 1), ~$13.50/mo thereafter |
| **Storage** | 20 GB General Purpose SSD (gp3) | Backup retention 7 days | ~$2.30 / month |

---

## Verification & Health Check Checklist

After completing deployment:
1. [ ] Check backend health endpoint: `curl -I https://<BACKEND-URL>/api/v1/system/health` (should return `200 OK`)
2. [ ] Check OpenAPI documentation: `https://<BACKEND-URL>/docs`
3. [ ] Check frontend connectivity: Open `https://<FRONTEND-URL>`, verify live IST clock updates every 1s, and telemetry stream updates every 5s.
4. [ ] Verify authentication: Register a new operator account, verify token generation, and check that audit logs record the event.
