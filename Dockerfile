# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5003

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy the built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy any additional files needed
COPY --from=builder /app/src/config ./src/config
COPY --from=builder /app/src/controllers ./src/controllers
COPY --from=builder /app/src/middleware ./src/middleware
COPY --from=builder /app/src/routes ./src/routes
COPY --from=builder /app/src/services ./src/services
COPY --from=builder /app/src/utils ./src/utils

# Create temp and logs directories
RUN mkdir -p /app/temp/uploads /app/logs && chown -R nodejs:nodejs /app/temp /app/logs

USER nodejs

EXPOSE 5003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5003/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/server.js"]
