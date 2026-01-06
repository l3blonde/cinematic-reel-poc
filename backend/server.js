const setupExpress = require("./config/express")
const healthRoutes = require("./routes/health.routes")
const uploadRoutes = require("./routes/upload.routes")
const reelRoutes = require("./routes/reel.routes")
const errorHandler = require("./middleware/errorHandler")
const path = require("path")
const express = require("express")
const fs = require("fs")

const app = setupExpress()
const PORT = process.env.PORT || 3000

const outputDir = path.join(__dirname, "output")
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
}

const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use("/output", express.static(path.join(__dirname, "output")))

app.get("/", (req, res) => {
    res.send("Hello World! Cinematic Reels from Dive Logs")
})

app.use("/api", healthRoutes)
app.use("/api/upload", uploadRoutes)
/** @type {import('express').Router} */
app.use("/api/reel", reelRoutes)

app.use(errorHandler)

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/api/health`)
    console.log(`Upload endpoint: http://localhost:${PORT}/api/upload`)
    console.log(`Generate reel: http://localhost:${PORT}/api/reel/generate`)
})

// Prevent server from exiting
server.on("error", (error) => {
    console.error("Server error:", error)
    process.exit(1)
})

process.on("SIGTERM", () => {
    console.log("SIGTERM received, closing server")
    server.close(() => {
        console.log("Server closed")
        process.exit(0)
    })
})
