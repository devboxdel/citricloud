# CITRICLOUD - Production Deployment Guide

## Pre-Deployment Checklist

### Security
- [ ] Change all default passwords and secrets
- [ ] Update `JWT_SECRET_KEY` and `SECRET_KEY` in `.env`
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable CORS only for production domains
- [ ] Disable DEBUG mode (`DEBUG=False`)

### Performance
- [ ] Run optimization script: `./optimize.sh`
- [ ] Configure CDN for static assets
- [ ] Enable Redis caching
- [ ] Set up database connection pooling
- [ ] Configure Gzip/Brotli compression
- [ ] Optimize images (WebP format)

### Monitoring
- [ ] Set up application monitoring (e.g., Sentry)
- [ ] Configure logging and log rotation
- [ ] Set up uptime monitoring
- [ ] Configure database backups
- [ ] Set up alerts for errors

## Deployment Options

### Option 1: Docker Deployment (Recommended)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: citricloud
      POSTGRES_USER: citricloud
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - citricloud-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - citricloud-network

  backend:
    build: ./backend
    command: gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
    environment:
      DATABASE_URL: postgresql://citricloud:${DB_PASSWORD}@postgres:5432/citricloud
      REDIS_URL: redis://redis:6379/0
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      ENVIRONMENT: production
      DEBUG: False
    depends_on:
      - postgres
      - redis
    networks:
      - citricloud-network
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - citricloud-network

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend
    networks:
      - citricloud-network

volumes:
  postgres_data:
  redis_data:

networks:
  citricloud-network:
    driver: bridge
```

### Option 2: Traditional Server Deployment

#### 1. Install System Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install Supervisor for process management
sudo apt install -y supervisor
```

#### 2. Setup Application
```bash
# Clone/copy project
cd /var/www
sudo mkdir citricloud
sudo chown $USER:$USER citricloud
cd citricloud

# Copy files
# ... (copy your project files)

# Run setup
./setup.sh
```

#### 3. Configure Supervisor (Backend)
Create `/etc/supervisor/conf.d/citricloud-backend.conf`:
```ini
[program:citricloud-backend]
directory=/var/www/citricloud/backend
command=/var/www/citricloud/backend/venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/citricloud/backend.err.log
stdout_logfile=/var/log/citricloud/backend.out.log
environment=PATH="/var/www/citricloud/backend/venv/bin"
```

#### 4. Build Frontend
```bash
cd frontend
npm run build
```

#### 5. Configure Nginx
Create `/etc/nginx/sites-available/citricloud`:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main server block
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Frontend (React)
    root /var/www/citricloud/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/citricloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. SSL Certificate (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 7. Start Services
```bash
# Create log directory
sudo mkdir -p /var/log/citricloud
sudo chown www-data:www-data /var/log/citricloud

# Start Supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start citricloud-backend

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Environment Variables (Production)

Update `backend/.env`:
```env
# Application
APP_NAME=CITRICLOUD
APP_VERSION=1.0.0
ENVIRONMENT=production
DEBUG=False
API_PREFIX=/api/v1

# Database (Use strong password)
DATABASE_URL=postgresql://citricloud:STRONG_PASSWORD@localhost:5432/citricloud

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT (Generate strong random key)
JWT_SECRET_KEY=<generate-with-openssl-rand-hex-32>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (Your production domain)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security (Generate strong random key)
SECRET_KEY=<generate-with-openssl-rand-hex-32>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Email (Configure for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Storage
UPLOAD_DIR=/var/www/citricloud/uploads
MAX_UPLOAD_SIZE=10485760

# Performance
ENABLE_COMPRESSION=True
ENABLE_CACHING=True
CACHE_TTL=3600
```

Update `frontend/.env.production`:
```env
VITE_API_URL=https://yourdomain.com/api/v1
```

## Monitoring & Maintenance

### Database Backups
Create backup script `/usr/local/bin/citricloud-backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/citricloud"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U citricloud citricloud | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
```

Schedule with cron:
```bash
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/citricloud-backup.sh
```

### Log Rotation
Create `/etc/logrotate.d/citricloud`:
```
/var/log/citricloud/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

### Health Checks
```bash
# Check backend
curl https://yourdomain.com/api/v1/health

# Check services
sudo systemctl status citricloud-backend
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis-server
```

## Performance Testing

### Lighthouse
```bash
npm install -g lighthouse
lighthouse https://yourdomain.com --view
```

### Load Testing
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test
ab -n 1000 -c 10 https://yourdomain.com/
```

## Troubleshooting

### View Logs
```bash
# Backend logs
sudo tail -f /var/log/citricloud/backend.out.log
sudo tail -f /var/log/citricloud/backend.err.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Restart Services
```bash
# Restart backend
sudo supervisorctl restart citricloud-backend

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql

# Restart Redis
sudo systemctl restart redis-server
```

## Security Hardening

1. **Firewall (UFW)**
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

2. **Fail2Ban**
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

3. **Regular Updates**
```bash
sudo apt update && sudo apt upgrade -y
```

4. **Database Security**
```sql
-- Disable remote PostgreSQL access if not needed
-- Edit /etc/postgresql/*/main/pg_hba.conf
-- Set: local all all md5
```

## Final Checklist

- [ ] All services running
- [ ] SSL certificate valid
- [ ] Domain DNS configured
- [ ] Backups scheduled
- [ ] Monitoring configured
- [ ] Logs rotating
- [ ] Firewall enabled
- [ ] Performance score > 90
- [ ] Security headers configured
- [ ] Error tracking setup

## Support

For production issues:
1. Check logs first
2. Verify all services are running
3. Test API health endpoint
4. Review Nginx configuration
5. Check database connections

Remember to keep your production `.env` file secure and never commit it to version control!
