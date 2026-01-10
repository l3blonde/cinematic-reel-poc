# Bullet 1: Project Setup

**Goal:** Create Node.js backend with Express that responds "Hello World"

**Test:** Visit `http://localhost:3000` → see "Hello World! Cinematic Reels from Dive Logs"

---

## What You Built

1. Created `backend/` folder structure
2. Initialized npm project
3. Installed Express and dependencies
4. Created basic HTTP server on port 3000

---

## Files Created

### backend/server.js
```javascript
require("dotenv").config({ path: "./config/config.env" })
const config = require("./config/config")
const setupExpress = require("./config/express")
const express = require("express")

const app = setupExpress()
const PORT = config.port

app.get("/", (req, res) => {
  res.send("Hello World! Cinematic Reels from Dive Logs")
})

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

### backend/config/config.js
```javascript
const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  uploadDir: "./uploads",
  outputDir: "./output",
  maxFileSize: 524288000, // 500MB
  maxFileCount: 10,
}

module.exports = config
```

### package.json
```json
{
  "dependencies": {
    "express": "5.2.1",
    "cors": "2.8.5",
    "dotenv": "17.2.3"
  }
}
```

---

## What Did We Learn:

1. **Express App Initialization** - `setupExpress()` returns configured Express app
2. **Basic GET Route** - `app.get('/', callback)`
3. **Server Listening** - `app.listen(PORT, callback)`
4. **Environment Config** - `require("dotenv").config()` loads .env variables
5. **Centralized Config** - `config.js` exports all settings

---

## How to Test

```bash
cd backend
npm install
node server.js
```

**Open browser:** http://localhost:3000

**Expected:** "Hello World! Cinematic Reels from Dive Logs"
