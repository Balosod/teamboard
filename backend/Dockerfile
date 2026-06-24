# ============ BUILD STAGE ============
FROM node:22-alpine AS builder

WORKDIR /app

# Copy backend package files (inside 'backend' folder)
COPY backend/package*.json ./
RUN npm install

# Copy backend source code
COPY backend/ ./

RUN npm run build

# ============ PRODUCTION STAGE ============
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["node", "dist/main"]