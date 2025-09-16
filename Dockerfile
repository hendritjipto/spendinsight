# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./


# Install system dependencies for canvas
RUN apt-get update && \
	apt-get install -y \
	libcairo2-dev \
	libjpeg-dev \
	libpango1.0-dev \
	libgif-dev \
	librsvg2-dev \
	&& rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port 8081
EXPOSE 8081

# Start the app
CMD ["node", "index.js"]
