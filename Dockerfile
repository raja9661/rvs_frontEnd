FROM node:alpine3.20 as build

ARG VITE_Backend_Base_URL

ENV VITE_Backend_Base_URL=${VITE_Backend_Base_URL}

#Build App
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

#Servce with NGINX
FROM nginx:1.23-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf *
COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT [ "nginx", "-g", "daemon off;"]