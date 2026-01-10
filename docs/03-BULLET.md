# Bullet 3: Backend Architecture

**Goal:** Organize backend into routes/controllers/config/middleware folders

**Test:** Visit `http://localhost:3000/api/v1/health` → see `{"status":"ok"}`

---

## What You Built

Refactored monolithic server into MVC-style architecture:
- **config/** - Express setup, CORS, multer
- **routes/** - API endpoint definitions
- **controllers/** - Business logic handlers
- **middleware/** - Error handling

---

## Files Created

### backend/config/express.js
```javascript
const express = require("express")
const cors = require("cors")

function setupExpress() {
  const app = express()

  const allowedOrigins = [
    "http://localhost:5173",     // Local dev
    "http://165.232.82.22"       // Production
  ]

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, true)  // Allow all for POC
      }
    },
    credentials: true,
  }))

  app.use(express.json({ limit: "100mb" }))
  app.use(express.urlencoded({ extended: true, limit: "100mb" }))

  return app
}

module.exports = setupExpress
```

### backend/routes/index.js
```javascript
const express = require("express")
const router = express.Router()

const healthRoutes = require("./health.routes")
const uploadRoutes = require("./upload.routes")
const reelRoutes = require("./reel.routes")

router.use("/", healthRoutes)          // /api/v1/health
router.use("/uploads", uploadRoutes)   // /api/v1/uploads
router.use("/reels", reelRoutes)       // /api/v1/reels

module.exports = router
```

### backend/routes/health.routes.js
```javascript
const express = require("express")
const router = express.Router()

router.get("/health", (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString()
  })
})

module.exports = router
```

### backend/middleware/errorHandler.js
```javascript
function errorHandler(err, req, res, next) {
  console.error("Error:", err.message)
  console.error(err.stack)
  
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  })
}

module.exports = errorHandler
```

### backend/server.js (refactored)
```javascript
require("dotenv").config({ path: "./config/config.env" })
const config = require("./config/config")
const setupExpress = require("./config/express")
const apiRoutes = require("./routes")
const errorHandler = require("./middleware/errorHandler")

const app = setupExpress()
const PORT = config.port

app.get("/", (req, res) => {
  res.send("Hello World! Cinematic Reels from Dive Logs")
})

app.use("/api/v1", apiRoutes)
app.use(errorHandler)

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`)
})
```

---

## What Did We Learn:

1. **MVC Pattern** - Separation: Routes (routing), Controllers (logic), Config (setup)
2. **Express Router** - `express.Router()` for modular routes
3. **Middleware Chain** - `app.use()` registers middleware in order
4. **CORS Configuration** - Dynamic origin validation with callback
5. **Error Handler Middleware** - 4-param function `(err, req, res, next)`
6. **Module Exports** - `module.exports` for code reuse
7. **Route Mounting** - `app.use("/api/v1", apiRoutes)` prefixes all routes

---

## Request Flow Diagram

```
Client Request: GET /api/v1/health ->
       
Express App (server.js) ->
       
CORS Middleware (express.js) ->
       
Route Index (routes/index.js) ->
       
Health Routes (health.routes.js) ->
       
Response: {"status":"ok"}
```

---

## How to Test

```bash
node backend/server.js

# Test health endpoint
curl http://localhost:3000/api/v1/health
```

**Expected:** `{"status":"ok","timestamp":"2026-01-09T..."}`
