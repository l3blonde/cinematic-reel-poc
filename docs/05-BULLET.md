# Bullet 5: FFmpeg Basic Video Generation

**Goal:** Transform uploaded images/videos into a single MP4 file 
with dynamic duration calculation (2-3s per item based on count)

**Test:**
1. Upload 3 images → POST to `/api/v1/reels` → download MP4 (3s per image = 9s total)
2. Upload 7 images → MP4 should be 2s per image = 14s total
3. Check video plays in browser and is 1280x720 resolution

---

## 0. Install FFmpeg

**Before you start coding, install FFmpeg on your system:**

### macOS
```bash
brew install ffmpeg
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

### Windows
```bash
# Download from https://ffmpeg.org/download.html
# Add to PATH environment variable
```

**Verify installation:**
```bash
ffmpeg -version
# Should show: ffmpeg version 7.1 (latest as of 2024)
```

**Note:** Latest FFmpeg version as of 2024 is **7.1 "Péter"** (released September 30, 2024). 
FFmpeg is actively developed with releases every few months.

---

## 1. Folder Structure

```
backend/
-- routes/
---- reel.routes.js          
-- controllers/
---- reel.controller.js      
-- services/
---- videoService.js        
-- output/               
---- reel-1736437281234.mp4
```

**File Purposes:**
- `reel.routes.js` - Routes POST requests to controller
- `reel.controller.js` - Validates files array, builds file paths, handles errors
- `videoService.js` - Core FFmpeg logic for video generation: scaling, padding, concatenation, duration calculation
- `output/` - Temporary storage for generated videos

---

## 2. Pseudocode

```
FUNCTION generateReel(files, options):
  1. Calculate duration per image based on file count
     - ≤3 files → 3s each
     - 4-5 files → 2.5s each
     - ≥6 files → 2s each
  
  2. Create FFmpeg command
  
  3. FOR EACH file:
     - IF image: add with loop and calculated duration
     - IF video: add without loop (use original duration)
  
  4. Apply complex filter chain:
     - Scale to 1280x720 (maintain aspect ratio)
     - Pad with black bars if needed
     - Apply framerate 30fps
     - Concatenate all segments
  
  5. Output as MP4 with yuv420p pixel format
  
  6. Return { filename, url }
```

---

## 3. Step-by-Step Implementation

### Step 3.1: Create Reel Routes

```javascript
// backend/routes/reel.routes.js
const express = require("express")
const router = express.Router()
const reelController = require("../controllers/reel.controller")

router.post("/", reelController.generateReel)

module.exports = router
```
---

### Step 3.2: Create Reel Controller

```javascript
// backend/controllers/reel.controller.js
const videoService = require("../services/videoService")
const path = require("path")
const config = require("../config/config")

const generateReel = async (req, res, next) => {
  try {
    const { files, filter = "none", transition = "none", audio = null } = req.body

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "No files provided" })
    }

    const imagePaths = files.map((filename) => 
      path.join(config.uploadDir, filename)
    )

    const audioPath = audio ? path.join(config.uploadDir, audio) : null

    const result = await videoService.generateReel(imagePaths, {
      filter,
      transition,
      audio: audioPath,
    })

    res.json({
      message: "Reel generated successfully",
      reel: {
        filename: result.filename,
        url: result.url,
        appliedFilter: filter,
        appliedTransition: transition,
        hasAudio: !!audioPath,
      },
    })
  } catch (error) {
    console.error("Error generating reel:", error.message)
    next(error)
  }
}

module.exports = { generateReel }
```
---

### Step 3.3: Create Video Service (Core FFmpeg Logic)

```javascript
// backend/services/videoService.js
const ffmpeg = require("fluent-ffmpeg")
const path = require("path")
const fs = require("fs")
const { FILTERS } = require("../config/filters")

const OUTPUT_DIR = path.join(__dirname, "../output")

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const getFileDurationAndType = (files) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
  const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"]

  const fileInfos = files.map((file) => {
    const filePath = typeof file === "string" ? file : file.path
    const ext = path.extname(filePath).toLowerCase()
    const isImage = imageExtensions.includes(ext)
    const isVideo = videoExtensions.includes(ext)

    return { path: filePath, isImage, isVideo }
  })

  const imageCount = fileInfos.filter((f) => f.isImage).length

  let imageDuration
  if (imageCount <= 3) {
    imageDuration = 3
  } else if (imageCount <= 5) {
    imageDuration = 2.5
  } else {
    imageDuration = 2
  }

  return { fileInfos, imageDuration }
}

const generateReel = async (files, options = {}) => {
  const timestamp = Date.now()
  const outputFilename = `reel-${timestamp}.mp4`
  const outputPath = path.join(OUTPUT_DIR, outputFilename)

  const filterType = options.filter || "none"
  const transitionType = options.transition || "none"
  const audioPath = options.audio || null

  const filterString = FILTERS[filterType]?.ffmpegFilter || ""

  const { fileInfos, imageDuration } = getFileDurationAndType(files)

  return new Promise((resolve, reject) => {
    const command = ffmpeg()

    fileInfos.forEach((fileInfo) => {
      if (fileInfo.isImage) {
        command.input(fileInfo.path)
          .inputOptions(["-loop", "1", "-t", imageDuration.toString()])
      } else if (fileInfo.isVideo) {
        command.input(fileInfo.path)
      }
    })

    if (audioPath) {
      command.input(audioPath).inputOptions(["-ss", "10"])
    }

    const filterComplex = []

    fileInfos.forEach((_, i) => {
      let scaleFilter = `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}]`
      filterComplex.push(scaleFilter)
    })

    filterComplex.push(
      `${fileInfos.map((_, i) => `[v${i}]`).join("")}concat=n=${files.length}:v=1:a=0[outv]`
    )

    command.complexFilter(filterComplex)
      .outputOptions(["-map", "[outv]", "-pix_fmt", "yuv420p", "-c:v", "libx264"])

    if (audioPath) {
      command.outputOptions(["-map", `${files.length}:a`, "-shortest", "-c:a", "aac", "-b:a", "192k"])
    }

    command
      .output(outputPath)
      .on("end", () => {
        resolve({ filename: outputFilename, url: `/output/${outputFilename}` })
      })
      .on("error", (err) => reject(err))
      .run()
  })
}

module.exports = { generateReel }
```
---

## 4. How to Test

### Test in Postman

**Request:**
```
POST http://localhost:3000/api/v1/reels
Content-Type: application/json

{
  "files": ["1736437281234-dive1.jpg", "1736437281234-dive2.jpg", "1736437281234-dive3.jpg"],
  "filter": "none",
  "transition": "none"
}
```

**Expected Response:**
```json
{
  "message": "Reel generated successfully",
  "reel": {
    "filename": "reel-1736437281234.mp4",
    "url": "/output/reel-1736437281234.mp4",
    "appliedFilter": "none",
    "appliedTransition": "none",
    "hasAudio": false
  }
}
```

### Test in Browser

1. Open `http://localhost:5173`
2. Upload 3 images
3. Click "Create My Reel" (no filter, no transition yet)
4. Video should display after 5-10 seconds
5. Verify:
   - Video is 9 seconds long (3 images × 3s each)
   - Resolution is 1280x720
   - Images are centered with black bars if needed
   - No distortion/stretching
---

## 8. Reflections and Learnings

### Background Research on FFmpeg

**Who created FFmpeg?** FFmpeg was originally created in **December 2000 by Fabrice Bellard**,
a French software developer who graduated from **École Polytechnique** and specialized at **Télécom Paris**. 
Bellard is renowned for building low-level, high-performance systems like QEMU and the JavaScript PC emulator.

**Growth and commercialization:** Over 24 years, FFmpeg evolved from a solo project into 
a **massive collaborative open-source framework maintained by a global community**. 
Written primarily in C with **millions of lines of code**, its low-level implementation 
allows extreme efficiency and portability across operating systems and hardware architectures.

**Commercial adoption timeline:**
- **2020:** Major social media platforms began integrating FFmpeg into video pipelines (Snapchat, Facebook infrastructure)
- **February 2023:** Facebook and Instagram publicly detailed using FFmpeg for **AV1-based Reels compression**, 
processing billions of videos daily
- Today, FFmpeg powers video processing in YouTube, Netflix, VLC, OBS, WhatsApp, TikTok,
and virtually every major media platform—**often invisibly to end users**

### What FFmpeg Is Designed To Do

FFmpeg is designed to **handle media at a technical level**: decode, encode, transcode, resize, trim, concatenate, filter audio/video streams, and support hundreds of codecs and container formats. 
It's the **"engine" behind media workflows**, not a user-facing tool.

**Through this project, we learned to:**
- Construct FFmpeg commands programmatically using JavaScript with `fluent-ffmpeg` wrapper
- Study official FFmpeg documentation, Stack Overflow, GitHub examples, Reddit discussions, and community guides
- Translate visual editing concepts (duration, scaling, concatenation) into command-line syntax

### What FFmpeg Cannot Do

**FFmpeg is NOT a visual editor.** It does not provide:
- Graphical interface or timeline
- Real-time previews
- Drag-and-drop editing like Adobe Premiere Pro

**All operations must be explicitly defined via commands and filter graphs.** 
FFmpeg executes instructions precisely but **does not make creative or aesthetic decisions**
you must specify every parameter mathematically.

**However**, through advanced filter chains, FFmpeg can produce **complex professional results**: 
fades, crossfades, overlays, animations, timing-based transitions—all described mathematically rather than visually designed.

### Why FFmpeg Was Suitable For This Project

**Perfect for our needs because:**
1. **Programmatic control:** We needed automated reel generation via API, not manual editing
2. **Free and open-source:** No licensing costs, commercially usable
3. **Cross-platform:** Runs on Mac, Linux, Windows, Docker containers
4. **Proven at scale:** Used by Instagram/Facebook for billions of videos—if it works for them, it works for us
5. **Rich filter library:** Built-in color grading, transitions, effects matching professional software
6. **Lightweight:** No GUI overhead, runs efficiently on servers

**Key learning:** FFmpeg's steep learning curve (complex syntax, cryptic errors) 
was worth mastering because it's the **industry standard backbone** of video processing. 
Understanding FFmpeg commands means understanding how professional video tools work under the hood.
