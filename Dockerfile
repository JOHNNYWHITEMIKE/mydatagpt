# Dockerfile for Next.js app with standalone output

# 1. Base Image
FROM node:20-alpine AS base
WORKDIR /app

# 2. Install Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# 3. Build the Application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set build-time secrets
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=${GEMINI_API_KEY}
RUN npm run build

# 4. Production Image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Add a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

# The server.js file from the standalone output is the entrypoint
CMD ["node", "server.js"]
