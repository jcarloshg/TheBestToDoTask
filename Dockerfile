# Multi-stage build for optimal image size and security

# ============================================================================
# Stage 1: Builder - Install dependencies and compile TypeScript
# ============================================================================
FROM node:20-alpine AS builder

# Install build dependencies (required for native modules like argon2)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production + development for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# ============================================================================
# Stage 2: Runtime - Minimal production image
# ============================================================================
FROM node:20-alpine

# Install runtime dependencies only (required for argon2)
RUN apk add --no-cache python3

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy package files from builder
COPY package*.json ./

# Install production dependencies only (no dev dependencies)
RUN npm ci --only=production && \
    npm cache clean --force

# Copy compiled application from builder
COPY --from=builder /app/dist ./dist

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)});"

# Start application
CMD ["node", "dist/index.js"]
