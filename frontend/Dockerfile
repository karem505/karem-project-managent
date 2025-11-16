# Base stage - shared dependencies
FROM node:20-alpine as base

# Install dependencies only when needed
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base as development

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy all files
COPY . .

# Expose port
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=development

# Start Next.js in development mode with hot reload
CMD ["npm", "run", "dev"]

# Production dependencies stage
FROM base as deps

# Install production dependencies only
RUN npm ci --only=production

# Production builder stage
FROM base as builder

# Install all dependencies for building
RUN npm ci

# Copy source files
COPY . .

# Build the Next.js application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production stage
FROM node:20-alpine as production

WORKDIR /app

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Start Next.js in production mode
CMD ["npm", "run", "start"]
