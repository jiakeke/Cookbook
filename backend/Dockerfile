# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application's source code
COPY . .

# Expose the port the app runs on
# This should be mapped to the host port in docker-compose.yml
# The actual port is set by the PORT environment variable.
EXPOSE 5000

# Define the command to run the application
CMD ["node", "server.js"]
