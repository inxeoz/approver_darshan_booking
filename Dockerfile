# Stage 1 — Build
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_TARGET
ENV VITE_TARGET=$VITE_TARGET

COPY package*.json ./
RUN npm install

COPY . .

# Copy environment
COPY .env.production ./

ENV NODE_ENV=production

RUN npm run build



# Stage 2 — Run
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built app
COPY --from=build /app/build ./build
COPY --from=build /app/package*.json ./

# Install only production dependencies (skip dev)
RUN npm install --omit=dev

EXPOSE 3000
CMD ["node", "build"]
