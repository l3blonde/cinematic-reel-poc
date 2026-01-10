# Bullet 9: Frontend Integration

**Goal:** Build complete React form with file upload, 
filter/transition options, backend communication, and video download

**Test:** Full user flow -> upload files → select options → generate reel → download MP4

**What This Bullet Covers:** Connecting React frontend to Express backend, 
managing form state with hooks, handling file uploads via FormData, 
implementing two-step API flow, and displaying generated video

---

## Folder Structure

```
frontend/
-- src/
---- App.jsx                    
------ components/
--------- UploadForm.jsx        
----index.css                 
```

**File purposes:**
- `App.jsx`: Entry point, root component, renders UploadForm
- `UploadForm.jsx`: Main form component with frontend logic (state management, API calls, video preview)
- `index.css`: CSS reset and global black-white styling

---

## Background Research

### React Hooks History
**Creator:** React Team at Facebook  
**Release:** React 16.8 (February 2019)  
**Why:** Replaced class components with functional components + hooks  
**Key Innovation:** State management without classes (`useState`, `useEffect`)

**Timeline:**
- 2019: React 16.8 introduces hooks
- 2021: Hooks become standard in React docs
- 2022: "Timeline of a React Component With Hooks" visualization
- 2024: Hooks are industry standard for React development

**Why hooks matter:**
- Simpler code (no `this` keyword confusion)
- Reusable logic via custom hooks
- Better performance (less overhead than classes)

### FormData API History
**Release:** Part of XMLHttpRequest Level 2 (2011)  
**Browser Support:** Universal since 2012 (Chrome 5+, Firefox 4+, Safari 5+, IE 10+)  
**Purpose:** Send files and form data in `multipart/form-data` format

**Why FormData matters for our POC:**
- Native browser API (no library needed)
- Handles file uploads automatically
- Works with `fetch()` API
- Sets correct `Content-Type: multipart/form-data` header

---

## Pseudocode

```
FUNCTION UploadForm():
  // STATE INITIALIZATION
  CREATE state for files (array of File objects)
  CREATE state for audioFile (single File object or null)
  CREATE state for filter (string: "deepBlue", "vintageExplorer", etc.)
  CREATE state for transition (string: "crossfade", "fade", "none")
  CREATE state for isProcessing (boolean)
  CREATE state for reelUrl (string: generated video URL)
  CREATE state for error (string or null)
  
  // EVENT HANDLERS
  FUNCTION handleFileChange(event):
    GET files from event.target.files
    CONVERT FileList to Array
    UPDATE files state
    CLEAR error state
  
  FUNCTION handleAudioChange(event):
    GET first file from event.target.files
    UPDATE audioFile state
  
  FUNCTION handleCreateReel():
    SET isProcessing to true
    CLEAR error
    
    TRY:
      // STEP 1: Upload files
      CREATE FormData object
      FOR EACH file in files:
        APPEND file to FormData with key "files"
      IF audioFile exists:
        APPEND audioFile to FormData with key "files"
      
      SEND POST request to /api/v1/uploads with FormData
      PARSE response JSON to get uploaded filenames
      
      // STEP 2: Separate images from audio
      FILTER uploaded files to find images/videos (exclude .mp3, .wav, .m4a)
      FIND audio file in uploaded files (match .mp3, .wav, .m4a)
      
      // STEP 3: Generate reel
      CREATE request body with:
        - files: array of image filenames
        - filter: selected filter
        - transition: selected transition
        - audio: audio filename or null
      
      SEND POST request to /api/v1/reels with JSON body
      PARSE response JSON to get reel URL
      
      UPDATE reelUrl state
      
    CATCH error:
      UPDATE error state with error message
    
    FINALLY:
      SET isProcessing to false
  
  // RENDER
  RETURN JSX:
    Heading "Cinematic Reel Generator"
    File input (multiple, accept images/videos)
    Display file count
    Dropdown for filter selection
    Dropdown for transition selection
    File input for audio (single, accept audio)
    Button "Create Reel" (disabled while processing or no files)
    IF error exists: display error message
    IF reelUrl exists: display video player + download link
```

---

## Step-by-Step Implementation

### Step 1: Create UploadForm.jsx with State Management

```jsx
"use client"

import { useState } from "react"

export default function UploadForm() {
  const [files, setFiles] = useState([])
  const [audioFile, setAudioFile] = useState(null)
  const [filter, setFilter] = useState("deepBlue")
  const [transition, setTransition] = useState("crossfade")
  const [isProcessing, setIsProcessing] = useState(false)
  const [reelUrl, setReelUrl] = useState("")
  const [error, setError] = useState(null)
  
  // Event handlers and JSX coming next...
}
```

---

### Step 2: Add File Selection Handlers

```jsx
const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files)
  setFiles(selectedFiles)
  setReelUrl("")
  setError(null)
}

const handleAudioChange = (e) => {
  const selectedAudio = e.target.files?.[0] || null
  setAudioFile(selectedAudio)
}
```

---

### Step 3: Add Video Generation Handler

```jsx
const handleCreateReel = async () => {
  if (files.length === 0) {
    setError("Please select files first")
    return
  }

  setIsProcessing(true)
  setError(null)

  try {
    // Step 1: Upload files
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))
    if (audioFile) {
      formData.append("files", audioFile)
    }

    const uploadResponse = await fetch("/api/v1/uploads", {
      method: "POST",
      body: formData,
    })

    const uploadData = await uploadResponse.json()

    if (!uploadData.files || !Array.isArray(uploadData.files)) {
      setError("Upload failed")
      setIsProcessing(false)
      return
    }

    // Step 2: Separate images from audio
    const imageFiles = uploadData.files.filter((f) => !f.filename.match(/\.(mp3|wav|m4a)$/i))
    const audioFileUploaded = uploadData.files.find((f) => f.filename.match(/\.(mp3|wav|m4a)$/i))

    // Step 3: Generate reel
    const generateResponse = await fetch("/api/v1/reels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: imageFiles.map((f) => f.filename),
        filter,
        transition,
        audio: audioFileUploaded?.filename || null,
      }),
    })

    const generateData = await generateResponse.json()

    if (generateData.reel && typeof generateData.reel.url === "string") {
      setReelUrl(generateData.reel.url)
    } else {
      setError("Generation failed")
    }
  } catch (err) {
    console.error("Error:", err)
    setError(`Failed to create reel: ${err.message || "Unknown error"}`)
  } finally {
    setIsProcessing(false)
  }
}
```

---

### Step 4: Add JSX Render

```jsx
return (
  <div style={{ padding: "clamp(16px, 3vw, 24px)", maxWidth: "780px", margin: "0 auto" }}>
    <h1>Ocean's 4 Cinematic Reel Generator</h1>

    <div>
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        id="file-input"
        style={{ display: "none" }}
      />
      <label htmlFor="file-input">Choose files</label>
      <span>{files.length} files</span>
    </div>

    <div>
      <label>Cinematic Filter:</label>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="deepBlue">Deep Blue (Underwater)</option>
        <option value="vintageExplorer">Vintage Explorer (Film)</option>
        <option value="biolume">Biolume (Glowing)</option>
        <option value="ultraVivid">Ultra Vivid (BBC Nature)</option>
        <option value="none">None (Original)</option>
      </select>
    </div>

    <div>
      <label>Transition Effect:</label>
      <select value={transition} onChange={(e) => setTransition(e.target.value)}>
        <option value="crossfade">Fade (Cross Dissolve)</option>
        <option value="fade">Fade (to Black)</option>
        <option value="none">None (Hard Cuts)</option>
      </select>
    </div>

    <div>
      <label>Background Music:</label>
      <input type="file" accept="audio/*" onChange={handleAudioChange} id="audio-input" />
    </div>

    <button onClick={handleCreateReel} disabled={isProcessing || files.length === 0}>
      {isProcessing ? "Creating Your Reel..." : "Create My Reel"}
    </button>

    {error && <div style={{ color: "#fff" }}>{error}</div>}

    {reelUrl && (
      <div>
        <h2>Your Reel is Ready!</h2>
        <video src={reelUrl} controls style={{ width: "100%" }} />
        <a href={reelUrl} download>Download MP4</a>
      </div>
    )}
  </div>
)
```
---

## Code Patterns Used

1. **React useState Hook:** state management in functional components
2. **Arrow Function:** concise function syntax
3. **Async/Await:** handle asynchronous operations
4. **FormData API:** multipart form data for file upload
5. **Fetch POST:** HTTP POST requests
6. **Array.from()** convert FileList to Array
7. **Array.forEach()** Iterate over files
8. **Array.filter()** Separate images from audio
9. **Array.find()** Find audio file
10. **Array.map()** Extract filenames
11. **RegEx .match()**  Pattern matching for file extensions
12. **Optional Chaining ?.** Safe property access
13. **Logical OR ||** Fallback values
14. **JSON.stringify()**Serialize object to JSON
15. **Try/Catch/Finally** Error handling
16. **Conditional Rendering {condition && JSX}** Show/hide UI elements
17. **Ternary Operator ? :** Conditional expression
18. **Controlled Inputs** React state drives input values

---

## User Flow

**User opens browser**
- Navigates to http://localhost:5173

**Step 1: Select files**
- Clicks “Choose files”
- Selects three dive photos
- Interface shows “3 files selected”

**Step 2: Select filter**
- Opens cinematic filter dropdown
- Selects “Deep Blue (Underwater)”
- Filter state set to `deepBlue`

**Step 3: Select transition**
- Opens transition dropdown
- Selects “Fade (Cross Dissolve)”
- Transition state set to `crossfade`

**Step 4: Optional audio upload**
- Clicks “Choose audio file”
- Selects ocean-sounds.mp3
- Audio file stored as File object

**Step 5: Create reel**
- Clicks “Create My Reel”
- `handleCreateReel()` is called
- Processing state set to true
- Button text changes to “Creating Your Reel…”
- Button becomes disabled

**Step 6: Upload files to backend**
- Frontend sends POST request to `/api/v1/uploads`
- Request body contains FormData
- Includes three images and one audio file
- Backend responds with stored filenames

**Step 7: Separate uploaded files**
- Frontend filters uploaded files
- Image files stored in an array
- Audio file stored separately

**Step 8: Request reel generation**
- Frontend sends POST request to `/api/v1/reels`
- Request body includes:
    - image filenames
    - selected filter
    - selected transition
    - audio filename
- Backend processes media using FFmpeg
- Images resized and filtered
- Transitions applied
- Audio mixed with offset
- MP4 reel generated
- Backend responds with reel URL

**Step 9: Display result**
- Frontend sets reel URL state
- Processing state set to false
- Video player is rendered
- Download link is shown
- User can play and download the video


---

## How to Test

### Local Development Testing

```bash
# Terminal 1: Start backend
cd backend
npm run dev
# Backend runs on http://localhost:3000

# Terminal 2: Start frontend
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

**Browser Testing (http://localhost:5173):**

**Test Case 1: Basic Image Reel**
1. Click "Choose files" → select 3 dive photos
2. Verify "3 files selected" displays
3. Keep filter as "Deep Blue"
4. Keep transition as "Fade (Cross Dissolve)"
5. Click "Create My Reel"
6. Button changes to "Creating Your Reel..." (disabled)
7. Wait ~5 seconds
8. Video player appears
9. Click play button → video plays with blue filter and crossfade transitions
10. Click "Download MP4" → file downloads

**Test Case 2: Image + Audio Reel**
1. Click "Choose files" → select 2 images
2. Click "Choose audio file" → select ocean-sounds.mp3
3. Verify "2 files selected" and audio filename displays
4. Select "Biolume" filter
5. Select "None (Hard Cuts)" transition
6. Click "Create My Reel"
7. Wait ~5 seconds
8. Video plays with glowing effect, hard cuts, audio starts at 10s mark

**Test Case 3: Error Handling**
1. Don't select any files
2. Click "Create My Reel"
3. Error message displays: "Please select files first"
4. Button remains enabled

**Test Case 4: Video Input**
1. Select 1 video file + 1 image
2. Generate reel
3. Video plays with both clips stitched together

---

## Reflections and Learnings

### Recapped Previous Development Classes

**React State Management:**
- useState creates isolated state variables -> each one tracks independent data (files, filter, etc.)
- Calling setState triggers re-render -> React calls component function again with new value
- State persists between renders -> unlike regular variables that reset every function call
- Why 8 useState instead of 1 object: React compares state by reference, 
separate useState calls allow React to optimize
re-renders (only re-render when specific state changes)

**FormData API for File Uploads:**
- FormData is built-in browser API -> no library installation needed
- Automatically sets `Content-Type: multipart/form-data` boundary header -> manually setting this would break the request
- Append same key multiple times for array (`formData.append('files', file1); formData.append('files', file2)`) -> backend receives array
- Works with fetch() -> just pass FormData as body, don't stringify or set headers
- Alternative (worse): Convert files to Base64 strings, send as JSON -> increases payload size by ~33%, slower

**Two-Step API Flow (Upload → Generate):**
- Why not one endpoint: Separation of concerns -> upload service handles storage, video service handles FFmpeg
- Benefit: If generation fails, files already saved - can retry without re-upload
- Backend returns filenames not File objects - File objects can't be sent over network (they're references to disk locations)
- Frontend filters filenames by extension - backend expects images in files array, audio in audio string

**Async/Await for Sequential Operations:**
- Our flow MUST be sequential: upload → parse response → generate → parse response
- Async/await reads like sync code -> easier to understand than Promise.then() chains
- Errors in any step jump to catch block -> single error handler for entire flow
- Finally block runs regardless of success/failure -> perfect for turning off loading state

**Controlled vs Uncontrolled Inputs:**
- Controlled: `value={filter} onChange={(e) => setFilter(e.target.value)}` -> React state is source of truth
- Uncontrolled: `<input defaultValue="deepBlue" />` -> DOM is source of truth, access with refs
- We use controlled for filter/transition dropdowns -> need values for API call
- File inputs MUST be uncontrolled -> browsers don't allow setting value programmatically for security

**CORS in Development vs Production:**
- Development: frontend localhost:5173 → backend localhost:3000 = cross-origin, need CORS headers
- Production: nginx proxies /api/* to backend -> frontend and API on same origin, CORS not needed
- Dynamic origin function `(origin, callback) => {...}` -> allows multiple origins (dev + prod IPs)
- Without CORS: browser shows "blocked by CORS policy" in console, fetch fails with network error

### Current Limitations

**No Upload Progress:**
- User sees "Creating..." text but no percentage, feels slow for large files
- Solution: Replace fetch with XMLHttpRequest, listen to upload.onprogress events

**No File Validation:**
- User can select .txt or .pdf files upload succeeds but generation fails
- Solution: Check file.type before upload, show error "Only images/videos/audio allowed"

**No Error Specificity:**
- All errors show generic "Failed to create reel" user doesn't know why
- Solution: Parse backend error messages, show specific guidance (file too large, unsupported format, server error)

**No Loading Steps:**
- User sees "Creating..." for entire process but doesn't know if uploading or processing
- Solution: Add indicator: "Generating video"

**No Request Cancellation:**
- If user navigates away mid-upload, request continues, wastes server resources
- Solution: Use AbortController to cancel fetch when component unmounts

### Production Considerations for Dive Apps

**File Size Limits:**
- POC: 500MB per request
- Production: Dive videos are 100MB-2GB, need chunked uploads or direct S3 upload with presigned URLs
- Consider: Compress videos client-side before upload (reduce quality from 4K to 1080p)

**Storage Strategy:**
- POC: Local filesystem `backend/uploads/`
- Production: Cloud storage (AWS S3 or Digital Ocean Spaces)
- Why: Server disk fills up quickly, need CDN for fast video delivery worldwide
- Cost: S3 storage €0.023/GB/month, DO Spaces €6/month flat for 250GB

**Processing Time:**
- POC: 5-10 seconds for 3 images
- Production: 60-120 seconds for 10 dive videos with 4K resolution
- Need: WebSocket connection to send progress updates, background job queue (Bull.js) for async processing
- UX: Email notification when reel is ready, don't make user wait on page

**Multi-Dive Story Mode (Polarsteps-style):**
- Current: Single upload session
- Enhancement: Let user create "dive trip" with multiple dive sessions, combine into one long reel
- Need: Database to store dive metadata (date, location, depth), user can organize chronologically
- UI: Timeline view showing all dives, drag-and-drop to reorder

**Mobile Experience:**
- Current: Works on mobile but UI not optimized
- Need: Touch-friendly file picker, camera access for instant upload, responsive video player
- Need: Progressive Web App (PWA) for offline editing
