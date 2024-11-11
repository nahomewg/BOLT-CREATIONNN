#!/bin/bash

# Test database connection
echo "Testing database connection..."
npm run test:db

# If the test fails, exit
if [ $? -ne 0 ]; then
  echo "Database connection test failed. Aborting deployment."
  exit 1
fi

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the application
echo "Building application..."
npm run build

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod