# Multi-stage Dockerfile for Node.js Application
# Stage 1: Base image with dependencies
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Stage 2: Development
FROM base AS development

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy application source
COPY . .

# Expose the application port
EXPOSE 3000

# Run the application in development mode
CMD ["npm", "run", "dev"]

# Stage 3: Production dependencies
FROM base AS production-deps

# Install only production dependencies
RUN npm ci --only=production

# Stage 4: Build (if needed for any build steps)
FROM base AS build

RUN npm ci
COPY . .

# Run any build commands if necessary
# RUN npm run build

# Stage 5: Production
FROM node:20-alpine AS production

WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies
COPY --from=production-deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
