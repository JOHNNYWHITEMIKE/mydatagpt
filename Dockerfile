# 1. Builder Stage: Install dependencies and build the application
FROM node:20-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy dependency definition files
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN pnpm build

# 2. Production Stage: Create a minimal image with only the built app
FROM node:20-slim AS runner
WORKDIR /app

# Set environment for production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to the non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Set the default command to start the app
CMD ["npm", "start", "-p", "3000"]
