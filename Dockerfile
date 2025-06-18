FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Set environment variables for build
ENV SUPABASE_URL="https://xkgdzmxltnnclvnrpylo.supabase.co"
ENV SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZ2R6bXhsdG5uY2x2bnJweWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjQ4NzAsImV4cCI6MjA2NTg0MDg3MH0.SA4YpYtRac5fpgOpRBp5_w46GbHFshqc4FufYY5KgpM"
ENV JWT_SECRET="shogun-trade-secret"

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Set runtime environment variables
ENV SUPABASE_URL="https://xkgdzmxltnnclvnrpylo.supabase.co"
ENV SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZ2R6bXhsdG5uY2x2bnJweWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjQ4NzAsImV4cCI6MjA2NTg0MDg3MH0.SA4YpYtRac5fpgOpRBp5_w46GbHFshqc4FufYY5KgpM"
ENV JWT_SECRET="shogun-trade-secret"

CMD ["node", "server.js"]
