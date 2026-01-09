require("dotenv").config({ path: "./config/config.env" })
const config = require("./config/config")

const setupExpress = require("./config/express")
const apiRoutes = require("./routes")
const errorHandler = require("./middleware/errorHandler")
const path = require("path")
const express = require("express")
const fs = require("fs")

const app = setupExpress()
const PORT = config.port

const outputDir = path.join(__dirname, config.outputDir)
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
}

const uploadsDir = path.join(__dirname, config.uploadDir)
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use("/output", express.static(path.join(__dirname, "output")))

app.get("/", (req, res) => {
    res.send("Hello World! Cinematic Reels from Dive Logs")
})

app.use("/api/v1", apiRoutes)

app.use(errorHandler)

const server = app.listen(PORT, () => {
    console.log(`Server running in ${config.env} mode on http://localhost:${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/api/v1/health`)
    console.log(`Upload endpoint: http://localhost:${PORT}/api/v1/uploads`)
    console.log(`Generate reel: http://localhost:${PORT}/api/v1/reels`)
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
