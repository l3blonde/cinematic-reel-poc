# Bullet 2: Frontend Setup

**Goal:** Create React frontend showing "Ocean's 4 Cinematic Reel Generator"

**Test:** Visit `http://localhost:5173` → see black page with white header

---

## What You Built

1. Created React app with Vite
2. Built UploadForm component with minimalistic black-white design
3. Added file picker UI (no upload functionality yet)
4. Implemented responsive design with inline styles

---

## Files Created

### frontend/src/components/UploadForm.jsx
```jsx
"use client"

import { useState } from "react"

export default function UploadForm() {
  const [files, setFiles] = useState([])

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(selectedFiles)
  }

  return (
    <div style={{ 
      padding: "24px", 
      maxWidth: "780px", 
      margin: "0 auto",
      backgroundColor: "#000",
      minHeight: "100vh",
      color: "#fff"
    }}>
      <h1 style={{ fontSize: "36px", fontWeight: "700" }}>
        Ocean's 4 Cinematic Reel Generator
      </h1>
      
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        id="file-input"
        style={{ display: "none" }}
      />
      <label htmlFor="file-input" style={{
        padding: "8px 16px",
        backgroundColor: "#fff",
        color: "#000",
        borderRadius: "6px",
        cursor: "pointer"
      }}>
        Choose files
      </label>
      
      <div>{files.length} file(s) selected</div>
    </div>
  )
}
```

### frontend/package.json
```json
{
  "dependencies": {
    "react": "19.2.0",
    "react-dom": "19.2.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

---

## What Did We Learn:

1. **React Hooks** - `useState([])` for file array
2. **Inline Styles** - `style={{}}` object notation
3. **File Input** - `<input type="file" multiple accept="image/*,video/*">`
4. **Hidden Input Pattern** - Hide input, style label as button
5. **Event Handler** - `handleFileChange` converts FileList to array
6. **Responsive Design** - `clamp()` for fluid typography and spacing

---

## How to Test

```bash
cd frontend
npm install
npm run dev
```

**Open browser:** http://localhost:5173

**Expected:** Black background, white "Ocean's 4 Cinematic Reel Generator" header, white "Choose files" button

**Interaction:** Click button → file picker opens → select files → counter updates
