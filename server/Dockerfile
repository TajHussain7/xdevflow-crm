FROM node:22-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
