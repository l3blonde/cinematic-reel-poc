# Tracer Bullet Plan: Cinematic Reel POC
**Ocean's 4 Team**

Quick end-to-end build

## What Problem Are We Solving
Divers take heaps of photos and videos underwater
but can't easily turn them into shareable
cinematic reels for social media.
They want something quick that takes
their raw dive footage and makes
it look professional without needing video editing skills.

**Current state:** Raw dive photos/videos sitting on phone  
**Desired state:** Slick 30-60 second cinematic reel
ready to post on Instagram/TikTok

**Success metric:**
Upload files → Get back a reel in under 2 minutes:

- CLIENT (browser)
uploadFiles(files) → POST /api/upload → wait → get reelUrl
- SERVER (backend)
Route → Controller → Service → FFmpeg → return video URL
- Request Flow:
  - POST /api/upload -> routes/reel.js → "hi, someone wants to upload!" ->
  - controllers/reelController.js → "ok, let's validate files, call service" ->
  - services/videoService.js → "Hi, turn images and videos into cinematic reel with FFmpeg" ->
  - return { reelUrl: '/output/reel-123.mp4' }

**Functions we need:**
- function onUpload() // triggered when files are selected by user
- FormData() // creates a multipart payload (multipart/form-data) required for file upload
- data.append() // add files to the payload
- fetch() // sends HTTPs requests to backend
- app.post() // defines HTTP upload endpoint
- uploadFiles(req, res) // controller fucntion to validate input
- getReelStatus(req, res) //checks async processing state and returns progress/ready URL
- saveUploadedFiles(files) // moves files from temp to perm storage
- generateReel(files) // calls FFmpeg to create cinematic reel
- cleanupTempFiles() // deletes temp uploads to prevent diskl bloat

**Why Postman:**
It's an app to test APIs without building a frontend first.
Like a fake browser that sends HTTP requests.
We want to test backend upload endpoint BEFORE wiring up React.
We want to make debugging way easier.
**Why Multer:**
We need a node middleware to handle file uploas as express cannot read files by itself
const upload = multer({ dest: "uploads/" }) = "when files arrive, store them in uploads/"
**Why FFmpeg:**
We want a free API to turn diver's footages into cinematic reels

**Frontend Pseudocode:**
```pseudocode
USER selescts files -> onUpoad() or handleUpload()
If files exist     -> guard clause: no files? don't send request!
   create multipart payload -> FormData() 
   attach files        -> data.append("files", file)
   send HTTP POST to backend -> fetch('/api/upload')
   recieve response/reel URL  -> res.json()
   get back url, play/display video -> function handleReel(url) {}
```

**Backend Pseudocode:**
```pseudocode
RECEIVE upload request ->uploadFiles(req, res)
If no files            -> guard clause: If no files? 400 error
   return error       -> return res.sendStatus(400)
PASS files to video service -> createReel(files) //seperation of concerns
GENERATE cinematic reel      -> generateReel(files)
RETURN reeel URL to client   -> res.json({ reelURL })

```
**Conceptual flow:**
- [User] -> selects files
- [React UI] -> FormData
- [REST API /fetch] -> multipart upload
- [Express Route] -> files
- [Video Service] -> FFmpeg
- [Cinematic Reel] -> URL
- -> [Frontend]

---

## Why Tracer Bullets?

Ever seen movies or video games where people are shooting machine guns?
You'll see bright streaks in the air showing the path of bullets.
Those are tracer bullets. Soldiers use them to refine their aim.
Same principle applies to projects and POCs, especially when building something you've never built before.
As team Ocean's 4, none of us have built this feature yet.
So we used tracer bullet programming technique to break down our code into small traceable and testable steps.
We test each bullet in the browser and check console logs for feedback.
Tracer code has advantages: we see something working early, we build structure to work in, we hit small targets and don't wait for the app to crash.
---

## What We've Done

### [x] Bullet #1: Backend basics
- [x] Created Node.js Express project in WebStorm
- [x] Got `backend/server.js` running on port 3000
- [x] Added health check endpoint
- [x] **Status**: Works! Backend returns "Hello World! Cinematic Reels from Dive Logs"

### [x] Bullet #2: React frontend basics
- [x] Setup React with Vite (running on port 5173)
- [x] Cleaned up default Vite stuff
- [x] Added minimal black-white styling
- [x] Got basic "Cinematic Reel Creator" header showing
- [x] **Status**: Frontend running, looks minimal and clean

### [ ] Bullet #3: Backend structure (separation of concerns)
We need to split backend into proper folders for learning:
- [x] `config/` - express setup
- [x] `routes/` - define endpoints
- [x] `controllers/` - handle requests and health check logic
- [x] `server.js` - write it together
- **Goal**:
HTTP Request → Route → Middleware → Controller → Service → Response (orthogonality!)

### [x] Bullet #4: File upload + Video generation (CORE POC FEATURE)
This is the heart of our POC,
we want to upload files and generate a cinematic reel.

**Backend:**
- [x] Installed `multer` for handling multipart uploads
- [x] Created upload config with file validation (images + videos only)
- [x] Store files in `backend/uploads/` temporarily
- [x] Fixed absolute path issue with `path.join(__dirname)`
**Video Processing:**
- [x] Installed FFmpeg CLI (`brew install ffmpeg`)
- [x] Installed `fluent-ffmpeg` npm package
- [x] Created `services/videoService.js` (business logic layer)
- [x] Built `generateReel()` function that:
  - Takes uploaded images
  - Loops each image for 3 seconds
  - Scales to 1280x720
  - Concatenates into smooth MP4
  - Saves to `backend/output/`
- [x] Created reel generation route + controller
**Frontend:**
- [x] Built `UploadForm.jsx` component
- [x] File picker for selecting dive photos/videos
- [x] Shows uploaded files list
- [x] "Generate Reel" button sends to backend
- [x] Download link appears when video ready
-  Added CORS support so frontend can talk to backend

**Test passed**:
Upload 2-3 images from browser → Click "Generate Reel" → Download MP4 video of your dive photos as a slideshow
**Status**: WORKING! End-to-end POC video generation feature complete.
We can create simple cinematic reels from the browser.

### [x] Bullet #5: Cinematic Effects (Filters + Transitions + Audio)
Add professional polish to make dive videos look cinematic:

**Filters Implemented:**
- [x] Deep Blue (Underwater): Enhanced blues, brightness adjustments
- [x] Vintage Explorer: Retro film look with grain
- [x] Biolume (Glowing): Saturated colors for bioluminescence
- [x] Ultra Vivid: High contrast and saturation

**Transitions Implemented:**
- [x] None (Hard Cuts): Instant clip changes
- [x] Fade: Smooth black fades between clips
- [x] Crossfade: Blended transitions (images only)

**Audio Support:**
- [x] Import MP3/WAV background music
- [x] Music starts at 10 seconds (skips intros)
- [x] Auto-mixed with video length using `-shortest`
- [x] Optional feature - reels work without audio

**Dynamic Reel Length:**
- [x] 2-3 files: 3 seconds each = 6-9 second reels
- [x] 4-5 files: 2.5 seconds each = 10-12.5 second reels
- [x] 6+ files: 2 seconds each = 12+ second reels
- [x] Videos keep original duration
- [x] Optimized for social media (Instagram/TikTok)

**Status**: COMPLETE! All filters, transitions, and audio working with images and videos.

---

## What's Next

### [ ] Bullet #6: Digital Ocean Deployment
Deploy the working POC so professors can test it live:
- Set up Digital Ocean Droplet (Ubuntu server)
- Install Node.js, FFmpeg on server
- Configure Nginx reverse proxy
- Deploy backend + frontend
- Add environment variables for production
- Test live: Upload images → Generate reel from any browser
- **Deliverable**: Live URL for professor to test POC

---

## Future Enhancements (Post-POC)

### [ ] Marine Soundscape Mixer
- Connect to Freesound API or Spotify API for music and ocean sounds
- Overlay whale songs, dolphin clicks, reef ambience
- User picks sounds from dropdown

### [ ] Dive Log Text Overlays
- Pre-designed text templates for dive info
- User fills in location, depth, marine life spotted
- FFmpeg burns text into video

### [ ] Preview & Polish
- Preview reel in browser before download
- Progress bar with percentage
- Upload More Files
- Drag-and-drop file upload
- Mobile-friendly responsive design


---

