#!/bin/sh

echo "🚀 Starting Blackbird application..."

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
./wait-for-it.sh mongodb 27017 60

if [ $? -ne 0 ]; then
    echo "❌ MongoDB is not ready after 60 seconds. Exiting..."
    exit 1
fi

echo "✅ MongoDB is ready!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema (creates collections if they don't exist)
echo "📊 Pushing database schema..."
npx prisma db push --accept-data-loss

# Seed the database
echo "🌱 Seeding database..."
npx prisma db seed

# Start the application
echo "🎯 Starting Next.js application..."
exec npm start