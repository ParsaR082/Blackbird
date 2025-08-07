# Docker Deployment Summary

## Changes Made for Docker Compatibility

### 1. Dockerfile Modifications
- **Fixed MongoDB connection during build**: Added default build-time environment variables to prevent MongoDB connection errors during `npm run build`
- **Updated CMD instruction**: Changed from `CMD ["./scripts/start-app.sh"]` to `CMD ["/bin/sh", "./scripts/start-app.sh"]` for proper shell execution

### 2. Shell Script Compatibility (Alpine Linux)
- **wait-for-it.sh**: Completely rewrote the script to be compatible with Alpine Linux's basic `sh` shell
  - Changed from bash-specific syntax to POSIX-compliant shell commands
  - Simplified the script to use basic `nc` (netcat) for port checking
  - New syntax: `./wait-for-it.sh host port timeout`

- **start-app.sh**: Updated for Alpine Linux compatibility
  - Changed shebang from `#!/bin/bash` to `#!/bin/sh`
  - Updated wait-for-it.sh call to use new syntax: `./wait-for-it.sh mongodb 27017 60`

### 3. Environment Variables
- **Build-time variables**: Added `MONGODB_URI` and `DATABASE_URL` with default values for build process
- **Runtime variables**: Configured through `.env.docker` file for actual deployment

## Current Status
✅ **Docker build successful**: Image builds without errors
✅ **Container startup successful**: Both MongoDB and app containers start properly
✅ **Health check passing**: Application responds on port 3000
✅ **Database connection working**: MongoDB connection established
⚠️ **Seed script warning**: Database seeding shows some warnings but doesn't prevent startup

## Ubuntu Deployment Instructions

### Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo apt install docker-compose -y

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
# Log out and back in for this to take effect
```

### Deployment Steps

1. **Clone/Upload your project to Ubuntu server**
```bash
# If using git
git clone <your-repository-url>
cd Blackbird

# Or upload files via SCP/SFTP
```

2. **Set up environment variables**
```bash
# Copy and configure environment file
cp .env.example .env.docker
nano .env.docker  # Edit with your production values
```

3. **Build and run the application**
```bash
# Build the Docker image
docker build -t blackbird-app .

# Start the services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

4. **Verify deployment**
```bash
# Check if application is responding
curl http://localhost:3000/api/health

# Should return: {"status":"ok","timestamp":"...","environment":"production"}
```

### Production Configuration

1. **Reverse Proxy Setup (Nginx)**
```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/blackbird
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/blackbird /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

2. **SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

3. **Firewall Configuration**
```bash
# Configure UFW firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Management Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app
docker-compose logs -f mongodb

# Restart application
docker-compose restart app

# Update application
docker-compose down
docker build -t blackbird-app .
docker-compose up -d

# Database backup
docker exec blackbird-mongo mongodump --out /backup
docker cp blackbird-mongo:/backup ./mongodb-backup
```

### Monitoring and Maintenance

1. **System Resources**
```bash
# Monitor Docker containers
docker stats

# Check disk usage
docker system df
docker system prune  # Clean up unused resources
```

2. **Application Logs**
```bash
# Application logs
docker-compose logs app --tail=100 -f

# MongoDB logs
docker-compose logs mongodb --tail=100 -f
```

### Troubleshooting

1. **Container won't start**
```bash
docker-compose logs app
docker-compose ps
```

2. **Database connection issues**
```bash
# Check MongoDB container
docker exec -it blackbird-mongo mongosh
# Test connection from app container
docker exec -it blackbird-app nc -z mongodb 27017
```

3. **Port conflicts**
```bash
# Check what's using port 3000
sudo netstat -tulpn | grep :3000
# Or use different ports in docker-compose.yml
```

## Important Notes

- The application runs on port 3000 by default
- MongoDB runs on port 27017
- Make sure to configure your `.env.docker` file with production values
- The database will be seeded automatically on first run
- Health check endpoint: `http://your-server:3000/api/health`
- All scripts are now compatible with Alpine Linux (sh shell)

## Security Considerations

- Change default MongoDB credentials
- Use strong JWT secrets
- Configure proper CORS settings
- Set up SSL/TLS certificates
- Regular security updates
- Monitor application logs
- Backup database regularly