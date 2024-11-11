#!/bin/bash

if [ "$1" = "local" ]; then
    echo "Switching to local database..."
    cp .env.local .env
    npx prisma generate
elif [ "$1" = "supabase" ]; then
    echo "Switching to Supabase database..."
    cp .env.supabase .env
    npx prisma generate
else
    echo "Please specify 'local' or 'supabase'"
    exit 1
fi

# Print current connection
echo "Current DATABASE_URL:"
grep DATABASE_URL .env 