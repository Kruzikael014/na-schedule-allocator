# Stage 1
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2
FROM nginx:alpine

# build result
COPY --from=builder /app/dist /usr/share/nginx/html

# Delete default nginx.conf, we use custom conf because react work differently
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx.conf in the root of /app
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY config.js /usr/share/nginx/html/config.js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]