# Stage 1: Build the React application
FROM node:20-slim AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

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
