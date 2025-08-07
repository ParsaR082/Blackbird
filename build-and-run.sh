#!/bin/bash

echo "🐳 Building and running Blackbird with local MongoDB..."

# Create Docker network if it doesn't exist
docker network create blackbird-network 2>/dev/null || true

# Stop and remove existing containers
echo "🧹 Cleaning up existing containers..."
docker stop blackbird-mongo blackbird-app 2>/dev/null || true
docker rm blackbird-mongo blackbird-app 2>/dev/null || true

# Start MongoDB container
echo "🍃 Starting MongoDB container..."
docker run -d \
  --name blackbird-mongo \
  --network blackbird-network \
  -p 27017:27017 \
  -v blackbird_mongodb_data:/data/db \
  mongo:7.0

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to start..."
sleep 10

# Build the application
echo "🔨 Building application..."
docker build -t blackbird-app .

# Start the application container
echo "🚀 Starting application container..."
docker run -d \
  --name blackbird-app \
  --network blackbird-network \
  -p 3000:3000 \
  -e DATABASE_URL="mongodb://blackbird-mongo:27017/blackbird-db" \
  -e NODE_ENV=production \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-your-nextauth-secret-here}" \
  -e CSRF_SECRET="${CSRF_SECRET:-your-csrf-secret-here}" \
  -e GEMINI_API_KEY="${GEMINI_API_KEY:-your-gemini-api-key}" \
  -e CSRF_DEBUG=true \
  blackbird-app

echo "✅ Deployment complete!"
echo "🌐 Application will be available at: http://localhost:3000"
echo "📊 MongoDB is running on: localhost:27017"
echo "👤 Default admin credentials:"
echo "   Email: superadmin@blackbird.local"
echo "   Password: BlackbirdAdmin42!"
echo ""
echo "📋 To check logs:"
echo "   App logs: docker logs -f blackbird-app"
echo "   MongoDB logs: docker logs -f blackbird-mongo"
echo ""
echo "🛑 To stop:"
echo "   docker stop blackbird-app blackbird-mongo"