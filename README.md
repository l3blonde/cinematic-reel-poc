# Cinematic Reel POC
**Ocean's 4 Team**

Live at http://165.232.82.22

Quick end to end build

## What Problem Are We Solving

Divers take heaps of photos and videos underwater
but can't easily turn them into shareable
cinematic reels for social media.
They want something quick that takes
their raw dive footage and makes
it look professional without needing video editing skills.

**Current state:** Raw dive photos/videos sitting on phone  
**Desired state:** Slick 30 to 60 second cinematic reel
ready to post on Instagram/TikTok

**Success metric:**
Upload files → Get back a reel in under 2 minutes

## Tech Stack

**Frontend:** React + Vite (port 5173)  
**Backend:** Node.js + Express (port 3000)  
**Video Processing:** FFmpeg + fluent-ffmpeg  
**File Upload:** Multer (500MB limit)  
**Deployment:** Digital Ocean Ubuntu + Nginx + PM2

## Features Implemented

**File Upload:**
Upload images (jpg, png) and videos (mp4, mov, avi)
Multiple files at once
500MB per file limit
Stored in backend/uploads/ folder

**Cinematic Filters:**
Deep Blue (Underwater): Enhanced blues, brightness adjustments
Vintage Explorer: Retro film look with grain
Biolume (Glowing): Saturated colors for bioluminescence
Ultra Vivid (BBC Nature): High contrast and saturation
None (Original): No filter applied

**Transitions:**
None (Hard Cuts): Instant clip changes
Fade: Smooth black fades between clips
Crossfade: Blended transitions (images only, videos force hard cuts)

**Audio Support:**
Import MP3/WAV background music
Music starts at 10 seconds (skips intros)
Auto mixed with video length using shortest flag
Optional feature, reels work without audio

**Dynamic Reel Length:**
2 to 3 files: 3 seconds each = 6 to 9 second reels
4 to 5 files: 2.5 seconds each = 10 to 12.5 second reels
6+ files: 2 seconds each = 12+ second reels
Videos keep original duration
Optimized for social media (Instagram/TikTok)

## Architecture

```
CLIENT (browser)
  uploadFiles(files) → POST /api/v1/uploads → wait → get reelUrl
  
SERVER (backend)
  Route → Controller → Service → FFmpeg → return video URL
  
Request Flow:
  POST /api/v1/uploads → routes/upload.routes.js
  → controllers/upload.controller.js (validate files)
  → POST /api/v1/reels → routes/reel.routes.js
  → controllers/reel.controller.js (call service)
  → services/videoService.js (FFmpeg processing)
  → return { reelUrl: '/output/reel-123.mp4' }
```

## Tracer Bullet Development

We used tracer bullet programming to break down the POC into small testable steps.
Each bullet was tested in browser before moving to next one.

## Why Tracer Bullets?

Ever seen movies or video games where people are shooting machine guns?
You'll see bright streaks in the air showing the path of bullets.
Those are tracer bullets. Soldiers use them to refine their aim.

Same principle applies to projects and POCs, especially when building something you've never built before.
As team Ocean's 4, none of us have built this feature yet.
So we used tracer bullet programming technique to break down our code into small traceable and testable steps.
We test each bullet in the browser and check console logs for feedback.

Tracer code has advantages: we see something working early, we build structure to work in, we hit small targets and don't wait for the app to crash.

**Bullet 1:** Backend basics (Node.js Express on port 3000)  
**Bullet 2:** React frontend basics (Vite on port 5173)  
**Bullet 3:** Backend structure (routes, controllers, services separation)  
**Bullet 4:** File upload with Multer (500MB limit, validation)  
**Bullet 5:** Basic video generation (FFmpeg concat, scale to 1280x720)  
**Bullet 6:** Cinematic filters (color grading, saturation, contrast)  
**Bullet 7:** Transitions (fade, crossfade with xfade filter)  
**Bullet 8:** Audio support (music import, 10s offset, shortest flag)  
**Bullet 9:** Frontend integration (UploadForm component, fetch API)  
**Bullet 10:** Digital Ocean deployment (Nginx, PM2, CORS fixes)

## Running Locally

Install FFmpeg first:
```bash
brew install ffmpeg
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open browser to http://localhost:5173

## Environment Variables

Backend .env file:
```
NODE_ENV=development
PORT=3000
UPLOAD_DIR=uploads
OUTPUT_DIR=output
MAX_FILE_SIZE=524288000
```

Frontend works without env vars for local dev

## Deployment (Digital Ocean)

Server: Ubuntu 22.04 droplet (1 vCPU, 2GB RAM)  
IP: 165.232.82.22  
Process Manager: PM2  
Reverse Proxy: Nginx  
Repository: GitHub (pushed bullet by bullet)

**Deployment steps:**
```bash
# SSH into server
ssh root@165.232.82.22

# Clone repo
git clone <repo-url> /var/www/cinematic-reel-poc

# Install dependencies
cd /var/www/cinematic-reel-poc/backend
npm install
cd ../frontend
npm install
npm run build

# Start backend with PM2
pm2 start backend/server.js --name cinematic-reel-backend

# Configure Nginx
nano /etc/nginx/sites-available/cinematic-reel

# Restart services
pm2 restart cinematic-reel-backend
systemctl restart nginx
```

**Production fixes applied:**
CORS updated for production IP (165.232.82.22)
Express body parser limit increased to 500MB
Nginx client_max_body_size set to 500M
Frontend API URLs changed from localhost:3000 to relative paths
Clean rebuild to clear cached JavaScript

## File Size Limits Alignment

All three layers must match for large file uploads:

**Multer:** 500MB (backend/config/multer.js)  
**Express:** 500MB (backend/config/express.js)  
**Nginx:** 500M (nginx config client_max_body_size)

If any layer is lower, uploads will fail

## Storage Strategy

**POC:** Local filesystem (backend/uploads/ and backend/output/)  
**Production:** Would migrate to Digital Ocean Spaces ($5/month flat rate) or AWS S3 (pay per use)

Digital Ocean Spaces is cheaper and simpler for dive app use case

## Known Issues

Progress bar sometimes over 100% (FFmpeg quirk, non critical)
Crossfade only works for image only reels (videos need different approach)
No preview before generating (direct download only)
Error messages could be more specific
Browser cache can show old JavaScript (hard refresh needed)

## Future Enhancements

**Production Ready:**
Move storage to Digital Ocean Spaces or AWS S3
Add user authentication and accounts
Database for storing user reels and metadata
Progress tracking with websockets
Video preview before download
Better error handling and validation

**Dive Specific:**
Pixverse and GoEnhanceAI APIs for AI enhancement
Embed dive data into video metadata (depth, GPS, temperature, marine species)
More professional transitions (Meta Edit style effects)
Spotify/SoundCloud API for music library
Animal specific sounds (whale songs, turtle sounds based on photo content)
Dive+ style blur removal and clarity enhancement
Multi dive story mode (Polarsteps style trip compilation)

**Advanced Features:**
Unit testing and integration tests
Automated deployment pipeline
Performance monitoring
CDN for video delivery
Mobile app version

## License
MIT

## Team

Ocean's 4 Team  
Thomas More  
2025

Built with lots of coffee and Stack Overflow by students who learned FFmpeg the hard way! :)
