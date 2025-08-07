# Blackbird Docker Setup with Local MongoDB

This guide explains how to run the Blackbird application with a local MongoDB instance using Docker.

## Quick Start

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up --build
```

### Option 2: Build Scripts

**For Linux/Mac:**
```bash
chmod +x build-and-run.sh
./build-and-run.sh
```

**For Windows:**
```cmd
build-and-run.bat
```

### Option 3: Manual Docker Commands

1. **Create network:**
   ```bash
   docker network create blackbird-network
   ```

2. **Start MongoDB:**
   ```bash
   docker run -d \
     --name blackbird-mongo \
     --network blackbird-network \
     -p 27017:27017 \
     -v blackbird_mongodb_data:/data/db \
     mongo:7.0
   ```

3. **Build and run app:**
   ```bash
   docker build -t blackbird-app .
   docker run -d \
     --name blackbird-app \
     --network blackbird-network \
     -p 3000:3000 \
     --env-file .env.docker \
     blackbird-app
   ```

## Environment Variables

The application uses these key environment variables:

- `DATABASE_URL`: `mongodb://mongodb:27017/blackbird-db`
- `NEXTAUTH_URL`: `http://localhost:3000`
- `NEXTAUTH_SECRET`: Your NextAuth secret
- `CSRF_SECRET`: Your CSRF secret
- `GEMINI_API_KEY`: Your Gemini API key
- `NODE_ENV`: `production`

## Default Admin User

During startup, the application automatically creates a SUPER_ADMIN user:

- **Email:** `superadmin@blackbird.local`
- **Password:** `BlackbirdAdmin42!`
- **Role:** `SUPER_ADMIN`

## Database Configuration

- **Database Name:** `blackbird-db`
- **MongoDB Version:** 7.0
- **Connection:** No authentication required
- **Data Persistence:** Uses Docker volume `blackbird_mongodb_data`

## Accessing Services

- **Application:** http://localhost:3000
- **MongoDB:** localhost:27017

## Useful Commands

### Check Logs
```bash
# Application logs
docker logs -f blackbird-app

# MongoDB logs
docker logs -f blackbird-mongo
```

### Stop Services
```bash
# Stop all containers
docker stop blackbird-app blackbird-mongo

# Using docker-compose
docker-compose down
```

### Connect to MongoDB
```bash
# Using MongoDB shell
docker exec -it blackbird-mongo mongosh blackbird-db

# Using external client
mongosh mongodb://localhost:27017/blackbird-db
```

### Rebuild Application
```bash
# Rebuild and restart
docker stop blackbird-app
docker rm blackbird-app
docker build -t blackbird-app .
docker run -d --name blackbird-app --network blackbird-network -p 3000:3000 --env-file .env.docker blackbird-app
```

## Troubleshooting

### Application won't start
1. Check if MongoDB is running: `docker ps | grep mongo`
2. Check application logs: `docker logs blackbird-app`
3. Verify network connectivity: `docker network ls`

### Database connection issues
1. Ensure MongoDB container is healthy: `docker logs blackbird-mongo`
2. Check if the database URL is correct in environment variables
3. Verify both containers are on the same network

### Port conflicts
If port 3000 or 27017 is already in use:
```bash
# Check what's using the port
netstat -tulpn | grep :3000
netstat -tulpn | grep :27017

# Stop conflicting services or change ports in docker-compose.yml
```

## Data Persistence

- MongoDB data is stored in the `blackbird_mongodb_data` Docker volume
- Data persists between container restarts
- To reset data: `docker volume rm blackbird_mongodb_data`

## Security Notes

- This setup is for development/local use
- No authentication is configured for MongoDB
- Use proper authentication and security measures for production deployments
- The default admin password should be changed after first login