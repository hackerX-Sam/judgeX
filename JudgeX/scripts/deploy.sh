#!/bin/bash

echo "Starting JudgeX Deployment..."

# Ensure we are in the project root directory
cd "$(dirname "$0")/.."

# 1. Pull latest changes
echo "Pulling latest changes from main branch..."
git pull origin main

# 2. Stop currently running containers
echo "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# 3. Build and start new containers
echo "Building and starting new containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Cleanup dangling images
echo "Cleaning up dangling images..."
docker image prune -f

echo "Deployment completed successfully!"
