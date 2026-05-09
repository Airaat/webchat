FROM ubuntu:24.04

# Install Node.js 20 (official method)
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean

WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install dependencies (including @y/hub)
RUN npm ci --only=production

# Copy the rest of your app
COPY . .

# Run your app
CMD ["node", "index.js"]
