const express = require("express")
const router = express.Router()

// Import route modules
const healthRoutes = require("./health.routes")
const uploadRoutes = require("./upload.routes")
const reelRoutes = require("./reel.routes")

// Mount routes
router.use("/", healthRoutes) // /api/v1/health
router.use("/uploads", uploadRoutes) // /api/v1/uploads
router.use("/reels", reelRoutes) // /api/v1/reels

module.exports = router
