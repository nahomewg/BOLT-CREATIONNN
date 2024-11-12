#!/bin/bash

# Build the application
echo "Building application..."
npm run build

# Run tests
echo "Running tests..."
npm test

# Generate sitemap
echo "Generating sitemap..."
npm run postbuild

# Deploy to Netlify
echo "Deploying to Netlify..."
netlify deploy --prod 