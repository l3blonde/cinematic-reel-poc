# Bullet 8: Add Audio Support

## Goal
Enable users to upload background music (MP3, WAV, M4A) 
that plays starting at 10 seconds offset, 
mixed with video output, and stops when video ends.

## Test
1. Upload 3 images + 1 MP3 file
2. Select filter and transition
3. Click "Create My Reel"
4. Download and play the video
5. Verify music starts at 10 second mark into the song
6. Test without audio - verify silent video still works

## Folder Structure
```
backend/
-- config/
---- multer.js    
-- config.js          
---- services/
------ videoService.js   
-- controllers/
---- reel.controller.js 
------ uploads/              
```

**What each file does:**
- `multer.js` - File filter updated to accept `.mp3`, `.wav`, `.m4a`
- `videoService.js` - FFmpeg command builder with audio input logic
- `reel.controller.js` - Parse audio filename from request, separates audio from images/videos before processing

---

## Background Research

### Audio Mixing History
- **1927**: First "talkies" (The Jazz Singer) synchronized audio with film
- **1950s-1970s**: Multi-track recording enabled separate dialogue, effects, music
- **1980s**: Digital Audio Workstations (DAWs) revolutionized post-production
- **2000**: FFmpeg created by Fabrice Bellard with audio mixing capabilities
- **2010s**: Social media platforms (Instagram, TikStorage, YouTube) popularized video+music mixing
- **2024**: AAC codec is the preferred standard for MP4 audio (more efficient than MP3)

### Why FFmpeg for Audio Mixing?
1. **Timeline Control**: `adelay` filter controls precise start times (in milliseconds)
2. **Multiple Inputs**: Can mix background music, narration, sound effects simultaneously
3. **Codec Flexibility**: Supports MP3, AAC, WAV, FLAC, M4A, and 100+ audio formats
4. **Volume Control**: `amix` filter balances audio levels automatically
5. **Sync Guarantee**: `-shortest` flag ensures audio/video stay synchronized

### Audio Codec Standards (2024)
- **AAC**: Preferred for MP4 containers, better quality at lower bitrates (192kbps standard)
- **MP3**: Universal compatibility, larger file sizes
- **WAV**: Lossless, huge file sizes (not recommended for web delivery)
- **M4A**: Apple's AAC container, same as AAC in MP4

---

## Pseudocode

```
FUNCTION addAudioSupport():
  
  STEP 1: Update File Filter
    - Add audio extensions to allowed types: mp3, wav, m4a
    - Keep existing image/video validation
    - Return error if file type not allowed
  
  STEP 2: Modify Controller to Separate Files
    - Parse request body for audio filename
    - Filter uploaded files:
      * Images/videos → go to video generation
      * Audio → pass as separate parameter
    - Handle optional audio (reel works without it)
  
  STEP 3: Update Video Service with Audio Logic
    IF audioFile exists:
      - Add audio as FFmpeg input
      - Apply -ss 10 flag (skip first 10 seconds)
      - Map audio stream with -map [fileCount]:a
      - Add -shortest flag (stop when video ends)
      - Set audio codec to AAC at 192kbps
    ELSE:
      - Generate silent video (video-only output)
  
  STEP 4: Test Both Scenarios
    - Test WITH audio: verify music starts at 10s
    - Test WITHOUT audio: verify silent video works
    - Test long music: verify it cuts when video ends
    - Test short music: verify video continues silently
```

---

## Step-by-Step Implementation

### Step 1: Update Multer File Filter

**File:** `backend/config/multer.js`

```javascript
const path = require("path")
const multer = require("multer")
const config = require("./config")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|webm|mp3|wav|m4a/
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedExtensions.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  }
  cb(new Error("Invalid file type. Only images, videos, and audio files are allowed."))
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter: fileFilter,
})

module.exports = upload
```
---

### Step 2: Update Reel Controller

**File:** `backend/controllers/reel.controller.js`

```javascript
const videoService = require("../services/videoService")
const path = require("path")

const generateReel = async (req, res) => {
  try {
    const { files, filter, transition, audio } = req.body

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "No files provided" })
    }

    const imagePaths = files.map((filename) => path.join(__dirname, "../uploads", filename))

    const audioPath = audio ? path.join(__dirname, "../uploads", audio) : null

    const result = await videoService.generateReel(imagePaths, {
      filter: filter || "none",
      transition: transition || "none",
      audio: audioPath,
    })

    res.json({
      success: true,
      reel: result,
    })
  } catch (error) {
    console.error("Error generating reel:", error)
    res.status(500).json({
      error: "Failed to generate reel",
      details: error.message,
    })
  }
}

module.exports = { generateReel }
```

---

### Step 3: Update Video Service with Audio

**File:** `backend/services/videoService.js` (lines 60-90)

```javascript

const generateReel = async (files, options = {}) => {
  
  const audioPath = options.audio || null


  return new Promise((resolve, reject) => {
    const command = ffmpeg()

    // Add image/video inputs
    fileInfos.forEach((fileInfo) => {
      if (fileInfo.isImage) {
        command.input(fileInfo.path).inputOptions(["-loop", "1", "-t", imageDuration.toString()])
      } else if (fileInfo.isVideo) {
        command.input(fileInfo.path)
      } else {
        command.input(fileInfo.path).inputOptions(["-loop", "1", "-t", imageDuration.toString()])
      }
    })

    if (audioPath) {
      command.input(audioPath).inputOptions(["-ss", "10"])
    }


    command.complexFilter(filterComplex).outputOptions(["-map", "[outv]", "-pix_fmt", "yuv420p", "-c:v", "libx264"])

    if (audioPath) {
      command.outputOptions([`-map`, `${files.length}:a`, `-shortest`, `-c:a`, `aac`, `-b:a`, `192k`])
    }

    command
      .output(outputPath)
      .on("end", () => {
        resolve({ filename: outputFilename, url: `/output/${outputFilename}` })
      })
      .on("error", (err) => {
        reject(err)
      })
      .run()
  })
}
```

---

## FFmpeg Audio Command Visualization
1. **Input 0: image1.jpg**
- Looped for 3 seconds
- Treated as video stream [0:v]
- Scaled, filtered, and set to fixed frame rate
- Output labeled as [v0]

2. **Input 1: image2.jpg**
- Looped for 3 seconds
- Treated as video stream [1:v]
- Scaled, filtered, and set to fixed frame rate
- Output labeled as [v1]

3. **Input 2: music.mp3**
- Audio stream [2:a]
- First 10 seconds skipped (offset)

4. **Video processing**
- [v0] and [v1] are concatenated
- Combined video stream labeled as [outv]

5. **Audio and video mapping**
- Video mapped from [outv]
- Audio mapped from [2:a]
- Output stops when the shorter stream ends

6. **Encoding and output**
- Audio encoded as AAC at 192 kbps
- Final file written as output.mp4


---

## How to Test

### Test 1: Upload with Audio (Postman)

```bash
POST http://localhost:3000/api/v1/reels
Content-Type: application/json

{
  "files": ["image1.jpg", "image2.jpg", "image3.jpg", "music.mp3"],
  "filter": "deepBlue",
  "transition": "crossfade",
  "audio": "music.mp3"
}
```

**Expected Response:**
```json
{
  "success": true,
  "reel": {
    "filename": "reel-1704729600000.mp4",
    "url": "/output/reel-1704729600000.mp4"
  }
}
```

**Verification:**
1. Download video from `http://localhost:3000/output/reel-1704729600000.mp4`
2. Play video - music should start at 10 second mark into the song
3. Video should be 9 seconds (3 images × 3s each)
4. Music should play for full 9 seconds then video ends

### Test 2: Upload without Audio (Silent Video)

```bash
POST http://localhost:3000/api/v1/reels
Content-Type: application/json

{
  "files": ["image1.jpg", "image2.jpg"],
  "filter": "vintageExplorer",
  "transition": "fade"
}
```

**Expected:** Silent video (6 seconds, no audio track)

### Test 3: Frontend Integration

1. Open `http://localhost:5173`
2. Choose 3 images
3. Choose 1 MP3 file
4. Select filter: Deep Blue
5. Select transition: Crossfade
6. Click "Create My Reel"
7. Wait for processing (~10-15 seconds)
8. Video should play with music starting at 10s mark

### Test 4: Edge Cases

**Test 4a: Music shorter than video**
- Upload 10 images (30 seconds video)
- Upload 20 second music file
- Expected: Music plays for 20s, then silent for remaining 10s

**Test 4b: Music longer than video**
- Upload 2 images (6 seconds video)
- Upload 120 second music file
- Expected: Video ends at 6s, music cuts off (due to `-shortest` flag)

**Test 4c: Wrong file type**
- Upload .txt file as audio
- Expected: Multer rejects with "Invalid file type" error

---

## Reflections and Learnings

### What We Learned

1. **Multer File Type Validation**
    - Extended regex pattern to accept audio formats (`mp3|wav|m4a`)
    - File filter checks both extension and MIME type for security
    - Unique timestamp suffixes prevent filename collisions

2. **FFmpeg Audio Mixing**
    - `-ss 10` input option skips first 10 seconds of audio (intro removal)
    - `-map` selects specific streams (video from filter, audio from input)
    - `-shortest` synchronizes audio/video duration automatically
    - AAC codec is preferred over MP3 for MP4 containers (2024 standard)
    - `192kbps` bitrate balances quality and file size

3. **Optional Feature Pattern**
    - Audio is optional: `const audioPath = options.audio || null`
    - Conditional FFmpeg logic: `if (audioPath) { ... }`
    - Reels work with or without audio (no breaking changes)

4. **Stream Index Management**
    - Audio input must be AFTER all image/video inputs
    - Use `files.length` for dynamic index calculation
    - Stream mapping: `${files.length}:a` selects audio from last input

### Storage Considerations

- **Current:** `backend/uploads/` stores audio temporarily
- **POC Deployment:** Digital Ocean server filesystem
- **Production:** Move to cloud storage (AWS S3 or Digital Ocean Spaces)
    - Digital Ocean Spaces: €6/month flat rate (cheaper for small scale)
    - AWS S3: Pay-per-use (unpredictable costs)

### Limitations & Future Enhancements

1. **Single Audio Track**: Only one background music file supported
2. **No Volume Control**: Audio plays at original volume
3. **No Audio Effects**: Could add fade-in/out, normalization, compression
4. **No Audio Preview**: Users can't hear audio before generating
5. **File Cleanup**: Uploaded audio stays in uploads/ folder indefinitely
