# Backend API - TypeScript, Express, GraphQL, Socket.IO

A modern backend API built with TypeScript, Express.js, Apollo GraphQL, Socket.IO, MongoDB Atlas, Redis ElastiCache, and AWS S3, designed to be deployed on AWS EKS with multi-environment support.

## 🚀 Features

- **TypeScript** - Full type safety and modern JavaScript features
- **Express.js** - Fast, unopinionated web framework
- **Apollo GraphQL** - Powerful GraphQL server with playground
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB Atlas** - Cloud-hosted MongoDB database
- **Redis ElastiCache** - In-memory data structure store
- **AWS S3** - File storage and management
- **Docker** - Containerized application
- **Kubernetes** - EKS deployment ready
- **GitHub Actions** - Automated CI/CD pipeline
- **Multi-Environment** - Development, Staging, and Production
- **Health Checks** - Application and service health monitoring
- **Rate Limiting** - API rate limiting with Redis
- **Logging** - Structured logging with Winston
- **Security** - Helmet, CORS, JWT authentication
- **File Upload** - REST endpoints for file upload to S3
- **REST API** - Additional REST endpoints for various scenarios

## 📋 Prerequisites

- Node.js 18+ 
- Docker
- AWS CLI configured
- kubectl installed
- EKS clusters (staging and production)
- MongoDB Atlas clusters (staging and production)
- Redis ElastiCache clusters (staging and production)
- AWS S3 buckets (staging and production)
- SSL certificates for your domains
- GitHub repository with secrets configured

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Environment Configuration
   NODE_ENV=development # development, staging, production

   # Server Configuration
   PORT=3000
   HOST=0.0.0.0

   # MongoDB Atlas Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   MONGODB_DB_NAME=your_database_name

   # Redis ElastiCache Configuration
   REDIS_HOST=your-redis-cluster.redis.amazonaws.com
   REDIS_PORT=6379

   # AWS S3 Configuration
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_S3_BUCKET_NAME=your-s3-bucket-name

   # JWT Configuration
   JWT_ACCESS_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d

   # GraphQL Configuration
   GRAPHQL_PATH=/graphql
   GRAPHQL_PLAYGROUND=true # Set to false in production

   # Socket.IO Configuration
   SOCKET_CORS_ORIGIN=http://localhost:3000

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Logging
   LOG_LEVEL=info # debug, info, warn, error
   LOG_FILE_PATH=logs/app.log

   # Security
   BCRYPT_ROUNDS=12
   SESSION_SECRET=your-session-secret-key

   # Health Check
   HEALTH_CHECK_INTERVAL=30000
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

## 🏃‍♂️ Development

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Lint code**
   ```bash
   npm run lint
   ```

## 🐳 Docker

1. **Build Docker image**
   ```bash
   npm run docker:build
   ```

2. **Run Docker container**
   ```bash
   npm run docker:run
   ```

## ☸️ Multi-Environment Deployment

### Environment Overview

| Environment | Branch | URL | Replicas | Resources | Features |
|-------------|--------|-----|----------|-----------|----------|
| **Development** | `feature/*` | `localhost:3000` | 1 | Minimal | Debug, Playground |
| **Staging** | `develop` | `api-staging.yourdomain.com` | 2 | Medium | Debug, Playground |
| **Production** | `main` | `api.yourdomain.com` | 3 | High | Optimized, Secure |

### GitHub Actions Setup

1. **Configure GitHub Secrets**
   
   Go to your GitHub repository → Settings → Secrets and variables → Actions, and add the following secrets:
   
   ```
   # AWS Credentials (shared)
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   
   # Staging Environment
   STAGING_MONGODB_URI=your-staging-mongodb-connection-string
   STAGING_REDIS_HOST=your-staging-redis-host
   STAGING_S3_BUCKET_NAME=your-staging-s3-bucket-name
   STAGING_JWT_ACCESS_SECRET=your-staging-jwt-secret
   
   # Production Environment
   PRODUCTION_MONGODB_URI=your-production-mongodb-connection-string
   PRODUCTION_REDIS_HOST=your-production-redis-host
   PRODUCTION_S3_BUCKET_NAME=your-production-s3-bucket-name
   PRODUCTION_JWT_ACCESS_SECRET=your-production-jwt-secret
   ```

2. **Update GitHub Actions Configuration**
   
   Edit the workflow files and update:
   - `ECR_REPOSITORY`: Your ECR repository name
   - `EKS_CLUSTER_NAME`: Your EKS cluster names
   - `AWS_REGION`: Your AWS region
   - SSL certificate ARNs for each environment

3. **Deploy to Environments**
   
   **Staging Deployment:**
   ```bash
   git checkout develop
   git add .
   git commit -m "Deploy to staging"
   git push origin develop
   ```
   
   **Production Deployment:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

### Environment-Specific Configurations

#### Staging Environment
- **Namespace**: `staging`
- **Replicas**: 2
- **Resources**: 256Mi-512Mi memory, 250m-500m CPU
- **Features**: Debug logging, GraphQL playground enabled
- **Rate Limiting**: 200 requests per 15 minutes
- **URL**: `https://api-staging.yourdomain.com`

#### Production Environment
- **Namespace**: `production`
- **Replicas**: 3
- **Resources**: 512Mi-1Gi memory, 500m-1000m CPU
- **Features**: Info logging, GraphQL playground disabled
- **Rate Limiting**: 100 requests per 15 minutes
- **URL**: `https://api.yourdomain.com`
- **Approval Required**: Manual approval for production deployments

### Manual Deployment

If you prefer manual deployment:

```bash
# Staging
kubectl apply -f k8s/secrets-staging.yaml
kubectl apply -f k8s/service-account-staging.yaml
kubectl apply -f k8s/deployment-staging.yaml
kubectl apply -f k8s/service-staging.yaml
kubectl apply -f k8s/ingress-staging.yaml

# Production
kubectl apply -f k8s/secrets-production.yaml
kubectl apply -f k8s/service-account-production.yaml
kubectl apply -f k8s/deployment-production.yaml
kubectl apply -f k8s/service-production.yaml
kubectl apply -f k8s/ingress-production.yaml
```

## 📊 API Endpoints

### Health Check
- `GET /health` - Application health status

### GraphQL
- `POST /graphql` - GraphQL endpoint
- `GET /graphql` - GraphQL playground (staging only)

### File Upload (REST)
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files (max 5)
- `POST /api/upload/presigned-url` - Get presigned URL for direct upload
- `DELETE /api/upload/:key` - Delete file from S3
- `GET /api/upload/:key` - Get file info and download URL

### Cache Management (REST)
- `POST /api/cache/set` - Set cache value
- `GET /api/cache/get/:key` - Get cache value
- `DELETE /api/cache/delete/:key` - Delete cache value

### System Information (REST)
- `GET /api/system/info` - System information
- `GET /api/system/status` - System health status

### Utilities (REST)
- `POST /api/utils/email` - Send email (placeholder)
- `POST /api/utils/notification` - Send notification (placeholder)

### Data Export (REST)
- `GET /api/export/users` - Export users data
- `GET /api/export/logs` - Export logs data

### Analytics (REST)
- `GET /api/analytics/requests` - Request analytics
- `GET /api/analytics/errors` - Error analytics

### WebSocket
- Socket.IO connection for real-time features

## 🔧 Configuration

### Environment Variables

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | `development` | `staging` | `production` |
| `GRAPHQL_PLAYGROUND` | `true` | `true` | `false` |
| `LOG_LEVEL` | `debug` | `debug` | `info` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | `200` | `100` |
| `REPLICAS` | `1` | `2` | `3` |

### Kubernetes Resources

- **Staging**: 2 replicas, medium resources
- **Production**: 3 replicas, high resources
- **Services**: ClusterIP services with environment-specific names
- **Ingress**: ALB ingress with SSL termination
- **Secrets**: Environment-specific Kubernetes secrets
- **Service Accounts**: IAM roles for AWS permissions

## 🔍 Monitoring

### Health Checks
- Application health endpoint: `/health`
- Kubernetes liveness and readiness probes
- Database and Redis connectivity checks

### Logging
- Structured JSON logging with Winston
- Environment-specific log levels
- File and console output

### Metrics
- Request/response logging
- Error tracking
- Performance monitoring

## 🔒 Security

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting
- **JWT Authentication** - Token-based auth
- **Input Validation** - Request validation
- **HTTPS** - SSL/TLS encryption
- **Secrets Management** - GitHub Secrets for sensitive data
- **Environment Isolation** - Separate resources per environment

## 🚀 Production Deployment

1. **Set production environment**
   ```bash
   export NODE_ENV=production
   ```

2. **Update production configuration**
   - Disable GraphQL playground
   - Set appropriate CORS origins
   - Configure production logging

3. **Deploy with rolling updates**
   ```bash
   kubectl set image deployment/backend-api-production backend-api=your-ecr-repo/backend-api:production-latest
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testNamePattern="User"
```

## 📝 API Documentation

### GraphQL Schema

```graphql
type User {
  id: ID!
  username: String!
  email: String!
  createdAt: String!
  updatedAt: String!
}

type Message {
  id: ID!
  content: String!
  userId: ID!
  roomId: String!
  createdAt: String!
  user: User
}

type Query {
  me: User
  users: [User!]!
  messages(roomId: String!): [Message!]!
}

type Mutation {
  register(username: String!, email: String!, password: String!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  createMessage(content: String!, roomId: String!): Message!
}
```

### File Upload Examples

**Upload Single File:**
```bash
curl -X POST http://localhost:3000/api/upload/single \
  -F "file=@/path/to/file.jpg" \
  -F "folder=images" \
  -F "userId=123"
```

**Upload Multiple Files:**
```bash
curl -X POST http://localhost:3000/api/upload/multiple \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.png" \
  -F "folder=documents"
```

**Get Presigned URL:**
```bash
curl -X POST http://localhost:3000/api/upload/presigned-url \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "document.pdf",
    "contentType": "application/pdf",
    "folder": "documents"
  }'
```

### Socket.IO Events

- `join-room` - Join a chat room
- `leave-room` - Leave a chat room
- `send-message` - Send a message to a room
- `typing` - Typing indicator
- `private-message` - Send private message

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the logs and health endpoints