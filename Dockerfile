# Stage 1: Base image
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Install dev dependencies for development
FROM base AS development
RUN npm ci
COPY . .
RUN mkdir -p /app/logs && chown -R node:node /app/logs
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Install only production dependencies
FROM base AS production-deps
RUN npm ci --omit=dev

# Stage 4: Copy source and prepare final build
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 nodejs

# Copy production node_modules
COPY --from=production-deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application source code
COPY --chown=nodejs:nodejs . .

# Create logs directory with correct permissions
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]
