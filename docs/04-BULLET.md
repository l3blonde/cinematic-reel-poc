# Bullet 4: File Upload System

**Goal:** Build file upload system that accepts images, 
videos, and audio files from frontend, validates them, 
saves to `backend/uploads/` folder, and returns metadata.

**Test:**
1. Start backend: `cd backend && npm run dev`
2. Use Postman: POST `http://localhost:3000/api/v1/uploads` with form-data files
3. Check `backend/uploads/` folder for saved files with timestamp names
4. Verify response JSON contains file metadata

---

## Folder Structure

```
backend/
-- config/
---- multer.js        -- multer configuration (storage, validation, limits)
---- config.js        -- upload directory and size limits
-- routes/
---- upload.routes.js  -- upload endpoint routes
---- index.js          -- mounts routes ('/', '/uploads', '/reels')
-- controllers/
---- upload.controller.js -- upload business logic
-- uploads/                
---- (uploaded files)
```

---

## Pseudocode

```
SETUP MULTER CONFIGURATION:
  1. Define storage strategy:
     - Set destination folder to "uploads/"
     - Generate unique filename using timestamp + original name
  
  2. Create file filter:
     - Check file extension (jpg, png, mp4, mp3, etc.)
     - Check mimetype (image/*, video/*, audio/*)
     - Reject if neither matches
  
  3. Set upload limits:
     - Max file size: 500MB
     - Max file count: 10 files

CREATE UPLOAD ROUTE:
  1. Define POST /api/v1/uploads endpoint
  2. Apply multer middleware with array upload (max 10 files)
  3. Wrap multer in error handler (catch size/count errors)
  4. Pass validated files to controller

CREATE UPLOAD CONTROLLER:
  1. Check if files exist in request
  2. If no files, return 400 error
  3. Extract file metadata (name, size, mimetype, path)
  4. Return success response with file details

MOUNT ROUTES:
  1. Import upload routes in routes/index.js
  2. Mount at /api/v1/uploads
  3. All requests to /uploads go through multer → controller
```

---

## Step-by-Step Implementation

### Step 1: Install Multer

```bash
cd backend
npm install multer
```

---

### Step 2: Create Multer Configuration (backend/config/multer.js)

```javascript
const multer = require("multer")
const path = require("path")
const config = require("./config")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", config.uploadDir))
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mp3|wav|m4a/
  const allowedMimetypes = /image\/(jpeg|jpg|png|gif)|video\/(mp4|quicktime|x-msvideo)|audio\/(mpeg|wav|mp4)/

  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedMimetypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error("Only images, videos, and audio files allowed"), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.maxFileSize,
    files: config.maxFileCount,
  },
})

module.exports = upload
```
---

### Step 3: Create Upload Routes (backend/routes/upload.routes.js)

```javascript
const express = require("express")
const router = express.Router()
const upload = require("../config/multer")
const uploadController = require("../controllers/upload.controller")

router.post(
  "/",
  (req, res, next) => {
    upload.array("files", 10)(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err.message, err.code)
        return res.status(500).json({
          error: err.message,
          code: err.code,
        })
      }
      next()
    })
  },
  uploadController.uploadFiles,
)

module.exports = router
```
---

### Step 4: Create Upload Controller (backend/controllers/upload.controller.js)

```javascript
function uploadFiles(req, res) {
  // Guard clause: no files uploaded
  if (!req.files || req.files.length === 0) {
    console.error("Upload error: No files in request")
    return res.status(400).json({
      error: "No files uploaded",
    })
  }

  console.log(`Files received: ${req.files.length}`)
  req.files.forEach((file, i) => {
    console.log(`File ${i + 1}: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`)
  })

  // Get uploaded file info
  const uploadedFiles = req.files.map((file) => ({
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    path: file.path,
  }))

  res.json({
    message: "Files uploaded successfully",
    files: uploadedFiles,
    count: uploadedFiles.length,
  })
}

module.exports = {
  uploadFiles,
}
```
---

### Step 5: Mount Upload Routes (backend/routes/index.js)

```javascript
const express = require("express")
const router = express.Router()
const healthRoutes = require("./health.routes")
const uploadRoutes = require("./upload.routes")

router.use("/health", healthRoutes)
router.use("/uploads", uploadRoutes)

module.exports = router
```

---

## Request Flow Diagram

```
Frontend sends FormData ->
       
POST /api/v1/uploads ->
       
Express receives multipart/form-data ->
       
[routes/index.js] Routes to /uploads ->
       ↓
[upload.routes.js] POST "/" handler ->
       
[Multer Middleware]
  -- fileFilter checks extension & mimetype
  -- storage saves to uploads/ folder
  -- Attaches file info to req.files ->
       
[Error Check] If multer error, return 500 ->
       
[upload.controller.js] uploadFiles()
  -- Guard: Check req.files exists
  -- Map files to clean metadata objects
  --Return JSON response ->
       
Frontend receives { files: [...], count: 3 }
```

---

## How to Test

### Option 1: Postman
1. Open Postman
2. Create new request: POST `http://localhost:3000/api/v1/uploads`
3. Go to Body tab → select `form-data`
4. Add key `files` (type: File), click "Select Files" → choose 2-3 images/videos
5. Send request
6. Expected: Status 200, JSON with files array
7. Check `backend/uploads/` folder for saved files

### Option 2: Frontend Integration
Add to `UploadForm.jsx`:
```javascript
const handleUpload = async () => {
  const formData = new FormData()
  files.forEach(file => formData.append("files", file))
  
  const response = await fetch("/api/v1/uploads", {
    method: "POST",
    body: formData,
  })
  
  const data = await response.json()
  console.log(data)
}
```

### Expected Response
```json
{
  "message": "Files uploaded successfully",
  "files": [
    {
      "originalName": "dive-photo.jpg",
      "filename": "1704890123456-dive-photo.jpg",
      "size": 2048576,
      "mimetype": "image/jpeg",
      "path": "/path/to/backend/uploads/1704890123456-crab-photo.jpg"
    }
  ],
  "count": 1
}
```

### Verify
- Check `backend/uploads/` contains file with timestamp name
- File is playable/viewable
- Response contains correct metadata

---

## Reflections and Learnings

**What is Multer?**  
Middleware that parses `multipart/form-data` (file uploads),
validates file types, saves to disk, and attaches metadata to `req.files`.

**Current Storage:**  
Files saved to `backend/uploads/` folder on local filesystem.
Works for POC but not scalable.

**File Size Limits Must Align:**
- Multer: `fileSize: 500MB` ✓
- Express body-parser: `limit: "500mb"` ✓
- Nginx: `client_max_body_size 500M` ✓
- Server disk space: Ensure enough capacity

**Deployment Storage:**
- **POC (current):** local disk (`backend/uploads/`)
- **Production:** Cloud storage AWS S3 or Digital Ocean
