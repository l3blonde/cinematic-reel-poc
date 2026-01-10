# Bullet 10: Production Deployment to Digital Ocean

**Ocean's 4 Team - Cinematic Reels POC**

---

## Folder Structure (Deployment Infrastructure)

```
Server Infrastructure (Digital Ocean Droplet)

-- var/
------  www/
--------------- cinematic-reel-poc/          # our cloned GitHub repo
---------------  backend/
---------------  server.js            # PM2 manages this
---------------  uploads/             # user uploaded files
-------------------- output/              # generated videos
---------------  frontend/
-------------------- dist/                # built React app (nginx serves this)
-- etc/
---- nginx/
---------- sites-available/
---------------  cinematic-reel           # nginx config file
------------ sites-enabled/
------------ cinematic-reel → ../sites-available/cinematic-reel  # Symlink
---- root/
-------- .pm2/                            # PM2 process data
```

---

## Goal

Deploy POC to Digital Ocean server with nginx reverse proxy and PM2 process manager for 24/7 uptime.

---

## Test

Visit `http://165.232.82.22` → upload images → select filter/transition → generate reel → download MP4.

---

## Background Research

**Digital Ocean History:**
- 2016: First Ubuntu + Nginx droplet tutorial published
- 2021: Ubuntu 18.04 deployment guide updated
- 2025: Ubuntu 22.04/24.04 LTS guides, Nginx 1.28.0 stable release
- Current: Ubuntu 25.10 available, 2GB RAM droplets $12/month

**PM2 Best Practices (2025):**
- Cluster mode for multi-core CPU utilization
- Ecosystem file for configuration management
- Systemd startup script for auto-restart on reboot
- Zero-downtime reload with `pm2 reload`
- Monitoring with PM2 Plus for production

**Nginx as Reverse Proxy:**
- SSL termination with Let's Encrypt (production)
- Upstream keepalive for connection pooling
- Static asset serving (faster than Node.js)
- Load balancing for horizontal scaling

---

## Pseudocode

```
DEPLOYMENT WORKFLOW:

1. LOCAL MACHINE:
   - Write code for each bullet (1-9)
   - Test locally
   - Push to GitHub after each bullet completion
   
2. DIGITAL OCEAN:
   - Create Ubuntu droplet (2GB RAM)
   - Install dependencies (Node.js, FFmpeg, nginx, PM2)
   
3. SERVER SETUP:
   - Clone GitHub repository to /var/www/
   - Install npm dependencies
   - Build frontend (Vite → dist folder)
   
4. NGINX CONFIGURATION:
   - Configure reverse proxy (API requests → localhost:3000)
   - Serve static files (frontend dist folder)
   - Set file size limit to 500MB
   
5. PM2 PROCESS MANAGEMENT:
   - Start backend with PM2
   - Enable auto-restart on crash
   - Save process list for reboot persistence
   
6. PRODUCTION FIXES:
   - Change frontend API URLs to relative paths
   - Update backend CORS to allow production IP
   - Test end-to-end workflow
```

---

## Step-by-Step Implementation

### Step 1: Push Code to GitHub (Bullet by Bullet)

**What we did locally before deployment:**

```bash
# After completing Bullet 1 (Project Setup)
git init
git add backend/server.js backend/config/ package.json
git commit -m "project setup with Express and config"
git push origin main

# After completing Bullet 2 (Frontend Setup)
git add frontend/
git commit -m "react frontend with UploadForm component"
git push origin main

# After completing Bullet 3 (Backend Architecture)
git add backend/routes/ backend/controllers/
git commit -m "backend MVC architecture with health endpoint"
git push origin main

# After completing Bullet 4 (File Upload)
git add backend/config/multer.js backend/controllers/upload.controller.js
git commit -m "file upload with multer and validation"
git push origin main

# After completing Bullet 5 (Basic Video Generation)
git add backend/services/videoService.js backend/controllers/reel.controller.js
git commit -m "FFmpeg video generation with concat"
git push origin main

# After completing Bullet 6 (Cinematic Filters)
git add backend/config/filters.js
git commit -m "added 5 cinematic filters (deepBlue, vintageExplorer, etc)"
git push origin main

# After completing Bullet 7 (Transitions)
git add backend/config/transitions.js
git commit -m "added crossfade, fade, and hard cut transitions"
git push origin main

# After completing Bullet 8 (Audio Support)
git add backend/services/videoService.js
git commit -m "audio import with 10s offset support"
git push origin main

# After completing Bullet 9 (Frontend Integration)
git add frontend/src/components/UploadForm.jsx
git commit -m "connected frontend to all backend endpoints"
git push origin main
```
---

### Step 2: Created Digital Ocean Droplet

```bash
# 1. Created Droplet via DigitalOcean Dashboard
# - Ubuntu 24.04 LTS
# - SSH key or password authentication
# - Hostname: cinematic-reel-poc

# 2. Copied IP address (e.g., 165.232.82.22)
```
---

### Step 3: Installed Dependencies on Server

```bash
# SSH into server
ssh root@165.232.82.22

# Update system packages
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install FFmpeg
apt install -y ffmpeg

# Install nginx
apt install -y nginx

# Install PM2 globally
npm install -g pm2

# Verify installations
node -v        # v18.20.5
npm -v         # 10.8.2
ffmpeg -version  # 6.1.1
nginx -v       # 1.24.0
pm2 -v         # 5.4.2
```

---

### Step 4: Cloned Repository and Install Dependencies

```bash
# Navigate to web directory
cd /var/www

# Clone GitHub repository
git clone https://github.com/l3blonde/cinematic-reel-poc
cd cinematic-reel-poc

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

### Step 5: Built Frontend for Production

```bash
cd /var/www/cinematic-reel-poc/frontend
npm run build
# Creates frontend/dist/ folder with optimized files
```

---

### Step 6: Configured Nginx Reverse Proxy

```bash
# Create nginx config file
nano /etc/nginx/sites-available/cinematic-reel
```

**File: /etc/nginx/sites-available/cinematic-reel**

```nginx
server {
    listen 80;
    server_name 165.232.82.22;
    
    client_max_body_size 500M;

    # Frontend - serve static files
    location / {
        root /var/www/cinematic-reel-poc/frontend/dist;
        try_files $uri /index.html;
    }

    # Backend API - proxy to Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve generated videos
    location /output/ {
        alias /var/www/cinematic-reel-poc/backend/output/;
        add_header Content-Type video/mp4;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/cinematic-reel /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart nginx
systemctl restart nginx
```
---

### Step 7: Started Backend with PM2

```bash
cd /var/www/cinematic-reel-poc
pm2 start backend/server.js --name cinematic-reel-backend

# Save process list
pm2 save

# Enable auto-start on reboot
pm2 startup
# Copy and run the command it outputs

# Check status
pm2 status

# View logs
pm2 logs cinematic-reel-backend --lines 20
```

---

### Step 8: Fixed Frontend API URLs for Production

**Problem:** Frontend hardcoded `http://localhost:3000/api/v1/uploads` which only works locally.

**Solution:** Changed to relative paths so nginx proxy handles routing.

**File: frontend/src/components/UploadForm.jsx**

```javascript
// BEFORE (development):
const uploadResponse = await fetch("http://localhost:3000/api/v1/uploads", {
  method: "POST",
  body: formData,
})

const generateResponse = await fetch("http://localhost:3000/api/v1/reels", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ files, filter, transition, audio }),
})

// AFTER (production):
const uploadResponse = await fetch("/api/v1/uploads", {
  method: "POST",
  body: formData,
})

const generateResponse = await fetch("/api/v1/reels", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ files, filter, transition, audio }),
})
```

**After changing URLs:**

```bash
# Rebuild frontend
cd /var/www/cinematic-reel-poc/frontend
npm run build

# Restart nginx
systemctl restart nginx
```

---

### Step 9: Fixed Backend CORS for Production

**Problem:** Backend CORS only allowed `http://localhost:5173` (dev frontend).

**Solution:** Add production IP to allowed origins.

**File: backend/config/express.js**

```javascript
// BEFORE (development only):
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))

// AFTER (production + development):
const allowedOrigins = [
  "http://localhost:5173",      // Development
  "http://165.232.82.22"        // Production
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}))
```

**After changing CORS:**

```bash
# Restart backend
pm2 restart cinematic-reel-backend

# Verify restart
pm2 status
```

---

### Step 10: Tested Live Deployment

**Open browser:**

```
http://165.232.82.22
```

**Test workflow:**
1. Upload 2-3 dive photos (jpg)
2. Select filter: Deep Blue
3. Select transition: Crossfade
4. Selected mp3 audio file
5. Click "Create My Reel" and wait 10-30 seconds
6. Video player appears with reel
7. Click "Download MP4"
8. Video plays in local media player

**Check backend logs:**

```bash
ssh root@165.232.82.22
pm2 logs cinematic-reel-backend --lines 50
```

**Expected log output:**

```
Server running in production mode on http://localhost:3000
Health check: http://localhost:3000/api/v1/health
Upload endpoint: http://localhost:3000/api/v1/uploads
Generate reel: http://localhost:3000/api/v1/reels
POST /api/v1/uploads 200 1523ms
POST /api/v1/reels 200 8734ms
```

---

## Reflections and Learnings
### What We Learned About Deployment
**Deployment is more than copying files:**  
Deployment involves environment configuration (nginx, PM2), 
network configuration (CORS, reverse proxy), 
and infrastructure management (disk space, memory, auto-restart). 
Understanding the full stack (frontend build → nginx routing → backend processing → FFmpeg execution) 
is crucial for debugging production issues.

**Three-tier architecture:**  
Our POC follows classic three-tier pattern: nginx (presentation/routing layer) → Node.js (application layer) → FFmpeg (processing layer). 
Each tier has specific responsibility and failure points.

**Configuration alignment is critical:**  
File size limits must match across multer (500MB) + Express (500MB) + nginx (500M). 
CORS origins must include production IP. API URLs must be relative paths for nginx proxy to work. 
Missing any alignment breaks the app.

**Git workflow discipline:**  
Pushing code bullet by bullet created clear history for debugging. 
When Bullet 7 worked locally but failed on server, git log showed exact files changed in that bullet. 
This isolated the issue to transitions config.

**Process management matters:**  
PM2 isn't optional for production. Without it, SSH disconnect kills backend, 
crashes aren't auto-recovered, and logs disappear. 
PM2 transforms Node.js from fragile script to production service.

### Why Digital Ocean for POC?

**Simplicity:** No AWS IAM roles, VPCs, security groups. Just create droplet, get IP, deploy.
**Learning:** Exposes full Linux environment (nginx, systemd, apt) vs abstracted platforms (Heroku, Vercel).  
**Control:** Root access to configure anything. Good for learning system administration.

For **production** we'd consider AWS (better scaling, managed services) 
or stick with Digital Ocean + managed database (less ops burden).

### Dive App Production Deployment Considerations

**Dive metadata:** If embedding GPS/depth into video metadata, 
need separate metadata file or database. 
MP4 metadata fields: `ffmpeg -i video.mp4 -metadata location="27.9881,86.9250" -metadata depth="18m"`.

**User authentication:** POC has no auth. 
Production needs user accounts to associate reels with divers.

**Multi-dive stories:** Polarsteps-style feature requires database to store dives, 
then concatenate reels across multiple dive sessions. 
Complex FFmpeg logic + UI for selecting dives.

**Error handling:** POC crashes on invalid video codec. 
Production needs validation: check file type before FFmpeg, 
reject incompatible codecs (VP9, AV1), transcode to H.264 if needed.
