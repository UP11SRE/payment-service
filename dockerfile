# Use Node.js 14 LTS as base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 5000 (or the port your Express.js application listens on)
EXPOSE 8083

# Command to run the application
CMD ["npm", "start"]
