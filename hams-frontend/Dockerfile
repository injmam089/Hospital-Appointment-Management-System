# Stage 1: Build the React application
FROM node:20-slim AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Build argument for API URL (defaults to port 8055)
ARG VITE_API_URL=http://localhost:8055
ENV VITE_API_URL=$VITE_API_URL

# Copy sources and build production assets
COPY . .
RUN npm run build

# Stage 2: Serve using Nginx Alpine
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default assets and copy production build
RUN rm -rf ./*
COPY --from=builder /app/dist .

# Copy hardened nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
