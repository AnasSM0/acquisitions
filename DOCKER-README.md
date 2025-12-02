# Acquisitions API - Docker Setup Guide

A Node.js application with Express, Drizzle ORM, and Neon Database, fully containerized for development and production environments.

## 🏗️ Architecture Overview

### Development Environment

- **Neon Local**: PostgreSQL proxy running in Docker for local development
- **Hot Reload**: Source code mounted as volume for instant updates
- **Database**: Ephemeral Neon branches for testing and development
- **Connection**: `postgres://postgres:postgres@neon-local:5432/acquisitions_dev`

### Production Environment

- **Neon Cloud**: Managed PostgreSQL database on Neon's infrastructure
- **Optimized Build**: Multi-stage Docker build for minimal image size
- **Security**: Non-root user, health checks, and proper logging
- **Connection**: Secure connection to Neon Cloud database with SSL

## 📋 Prerequisites

- Docker Desktop installed (version 20.10+)
- Docker Compose installed (version 2.0+)
- Node.js 20+ (for local development without Docker)
- A Neon account and project (for production)

## 🚀 Quick Start

### Development Setup (with Neon Local)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd acquisitions
   ```

2. **Configure environment variables**

   The `.env.development` file is already configured for Neon Local:

   ```bash
   # Review the file
   cat .env.development
   ```

3. **Start the development environment**

   ```bash
   npm run docker:dev
   ```

   This command will:
   - Build the application Docker image
   - Start Neon Local PostgreSQL proxy
   - Start the application with hot-reload enabled
   - Create necessary networks and volumes

4. **Run database migrations**

   Once containers are running, execute migrations:

   ```bash
   docker-compose -f docker-compose.dev.yml exec app npm run db:generate
   docker-compose -f docker-compose.dev.yml exec app npm run db:migrate
   ```

5. **Access the application**
   - API: http://localhost:3000
   - Health Check: http://localhost:3000/health
   - Database: localhost:5432 (accessible from host machine)

6. **View logs**

   ```bash
   npm run docker:logs
   ```

7. **Stop the development environment**
   ```bash
   npm run docker:dev:down
   ```

### Production Setup (with Neon Cloud)

1. **Get your Neon Cloud connection string**
   - Go to [Neon Console](https://console.neon.tech)
   - Create a new project or use existing one
   - Copy the connection string from the dashboard
   - It should look like: `postgres://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname?sslmode=require`

2. **Configure production environment**

   Edit `.env.production` and add your credentials:

   ```bash
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<your-neon-cloud-connection-string>
   JWT_SECRET=<your-strong-secret-min-32-chars>
   ARCJET_KEY=<your-arcjet-production-key>
   LOG_LEVEL=info
   ```

   **⚠️ IMPORTANT**: Never commit `.env.production` with real credentials!

3. **Build and run production containers**

   ```bash
   npm run docker:prod
   ```

4. **Run database migrations in production**

   ```bash
   docker-compose -f docker-compose.prod.yml exec app npm run db:migrate
   ```

5. **Verify deployment**

   ```bash
   curl http://localhost:3000/health
   ```

6. **Stop production environment**
   ```bash
   npm run docker:prod:down
   ```

## 📁 Project Structure

```
acquisitions/
├── src/
│   ├── config/          # Configuration files (database, logger, arcjet)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Drizzle ORM models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── validations/     # Zod schemas
│   ├── app.js           # Express app setup
│   ├── index.js         # Entry point
│   └── server.js        # Server initialization
├── drizzle/             # Database migrations
├── logs/                # Application logs
├── Dockerfile           # Multi-stage Docker build
├── docker-compose.dev.yml   # Development environment
├── docker-compose.prod.yml  # Production environment
├── .env.development     # Development environment variables
├── .env.production      # Production environment variables (template)
├── .dockerignore        # Docker build exclusions
└── package.json         # Node.js dependencies and scripts
```

## 🛠️ Available Scripts

### Local Development (without Docker)

```bash
npm run dev              # Start app with hot-reload
npm run start            # Start app in production mode
```

### Docker Development

```bash
npm run docker:dev       # Start dev environment with Neon Local
npm run docker:dev:down  # Stop and remove dev containers
npm run docker:logs      # View logs from all containers
```

### Docker Production

```bash
npm run docker:prod      # Start production environment
npm run docker:prod:down # Stop production containers
npm run docker:build     # Build Docker image manually
```

### Database

```bash
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Run pending migrations
npm run db:studio        # Open Drizzle Studio UI
```

### Code Quality

```bash
npm run lint             # Check code with ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
```

## 🔧 Environment Variables

### Development (.env.development)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://postgres:postgres@neon-local:5432/acquisitions_dev
JWT_SECRET=dev-secret-key-change-in-production
ARCJET_KEY=your-arcjet-dev-key
LOG_LEVEL=debug
```

### Production (.env.production)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require
JWT_SECRET=your-production-jwt-secret-min-32-chars
ARCJET_KEY=your-production-arcjet-key
LOG_LEVEL=info
```

## 🐳 Docker Configuration Details

### Multi-Stage Dockerfile

The Dockerfile uses multiple stages for optimization:

1. **Base**: Common setup for all stages
2. **Development**: Includes devDependencies, enables hot-reload
3. **Production-deps**: Only production dependencies
4. **Build**: Optional build stage for compilation
5. **Production**: Minimal image with non-root user

### Development Compose (docker-compose.dev.yml)

- **Neon Local**: PostgreSQL proxy on port 5432
- **App**: Node.js app with volume mounts for hot-reload
- **Network**: Isolated bridge network for services
- **Volumes**: Persistent database storage, mounted source code

### Production Compose (docker-compose.prod.yml)

- **App**: Production-optimized container
- **Health Checks**: Automated container health monitoring
- **Restart Policy**: Automatic restart on failure
- **Logging**: JSON file logging with rotation

## 🔐 Security Best Practices

1. **Never commit sensitive data**
   - Use `.env.production` only locally
   - Use secrets management in CI/CD (GitHub Secrets, AWS Secrets Manager, etc.)

2. **Strong secrets**
   - JWT_SECRET should be minimum 32 characters
   - Use cryptographically secure random strings

3. **Non-root user**
   - Production container runs as user `nodejs` (UID 1001)

4. **Network isolation**
   - Services communicate through Docker networks
   - Only necessary ports are exposed

## 🔍 Troubleshooting

### Database Connection Issues

**Development:**

```bash
# Check if Neon Local is healthy
docker-compose -f docker-compose.dev.yml ps

# View Neon Local logs
docker-compose -f docker-compose.dev.yml logs neon-local

# Test connection from app container
docker-compose -f docker-compose.dev.yml exec app sh
# Inside container:
nc -zv neon-local 5432
```

**Production:**

```bash
# Verify DATABASE_URL in .env.production
# Ensure SSL mode is enabled: ?sslmode=require
# Check Neon Cloud dashboard for connection limits
```

### Container Won't Start

```bash
# View container logs
docker-compose -f docker-compose.dev.yml logs app

# Inspect container
docker inspect <container-id>

# Remove all containers and volumes (clean slate)
docker-compose -f docker-compose.dev.yml down -v
docker system prune -a
```

### Hot Reload Not Working

```bash
# Ensure volumes are mounted correctly
docker-compose -f docker-compose.dev.yml config

# Restart the app container
docker-compose -f docker-compose.dev.yml restart app
```

### Migration Errors

```bash
# Generate new migration
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Apply migrations manually
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Access database directly
docker-compose -f docker-compose.dev.yml exec neon-local psql -U postgres -d acquisitions_dev
```

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Local Setup](https://neon.com/docs/local/neon-local)
- [Docker Documentation](https://docs.docker.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Express.js](https://expressjs.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in Docker environment
5. Submit a pull request

## 📝 License

ISC

---

**Need help?** Open an issue on GitHub or contact the development team.
