# Tracer Bullet Plan - Cinematic Reel POC
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

---

## What's Next

### [ ] Bullet #3: Backend structure (separation of concerns)
We need to split backend into proper folders for learning:
- Create `routes/` - define endpoints
- Create `controllers/` - handle requests
- Create `services/` - business logic
- Create `utils/` - helper functions
- Refactor existing health check through this structure
- **Goal**: Request flows route → controller → service (orthogonality!)

### [ ] Bullet #4: File uploads (backend)
- Install `multer` for handling uploads
- Create upload route + controller + service
- Validate file types (images + videos only)
- Store files temporarily
- **Test**: Can upload a dive photo from Postman

### [ ] Bullet #5: Upload UI (frontend)
- Build file picker component
- Handle drag-and-drop
- Show upload progress
- Display uploaded files (thumbnails)
- **Test**: Upload dive photos/videos from browser

### [ ] Bullet #6: FFmpeg basics
- Install `fluent-ffmpeg` and `ffmpeg-static`
- Create `videoService.js`
- Test basic operations (format conversion, frame extraction)
- **Test**: Can we make FFmpeg do something simple?

### [ ] Bullet #7: Generate simple reel
- Combine images into video sequence
- Add transitions between images
- Set timing/duration
- Add fade effects
- **Test**: 3 dive photos → 10 sec reel

### [ ] Bullet #8: Handle video clips too
- Mix video clips with images
- Add optional background music
- Apply cinematic filters (black bars, 16:9 aspect)
- **Test**: Images + video clips → cinematic reel

### [ ] Bullet #9: Wire up frontend
- Add "Generate Reel" button
- Show processing spinner
- Preview generated reel
- Download button
- **Test**: End-to-end from browser

### [ ] Bullet #10: Handle errors properly
- Add error middleware
- Log errors to console
- Clean up temp files after processing
- Validate inputs
- **Test**: What happens if upload fails?

### [ ] Bullet #11: Document what we learned
- Document test results

---
