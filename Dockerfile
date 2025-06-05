# # ========================
# # Build Stage
# # ========================
# FROM node:18-alpine as build

# # Set backend API base URL
# ARG VITE_Backend_Base_URL
# ENV VITE_Backend_Base_URL=${VITE_Backend_Base_URL}

# WORKDIR /app

# # Install dependencies
# COPY package.json package-lock.json* ./
# RUN npm install

# # Copy source code and build
# COPY . .
# RUN npm run build

# # ========================
# # Production Stage
# # ========================
# FROM nginx:1.23-alpine

# # Clean default nginx html content
# RUN rm -rf /usr/share/nginx/html/*

# # Copy built app from previous stage
# COPY --from=build /app/dist /usr/share/nginx/html

# # Copy custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Expose port 80
# EXPOSE 80

# # Start NGINX
# CMD ["nginx", "-g", "daemon off;"]




# Build stage
FROM node:alpine3.20 as build

ARG VITE_Backend_Base_URL
ENV VITE_Backend_Base_URL=${VITE_Backend_Base_URL}

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .
RUN npm run build

# Production stage with NGINX
FROM nginx:1.23-alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf *

# Copy built React app
COPY --from=build /app/dist .

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]




