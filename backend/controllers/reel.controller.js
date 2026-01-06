const videoService = require("../services/videoService")

const generateReel = async (req, res, next) => {
    try {
        console.log("=== GENERATE REEL REQUEST RECEIVED ===")
        const files = req.files
        console.log("Files received:", files ? files.length : 0)

        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files provided" })
        }

        files.forEach((file, i) => {
            console.log(`File ${i + 1}: ${file.originalname} (${file.mimetype})`)
        })

        console.log("Starting video generation...")
        const result = await videoService.generateReel(files)
        console.log("Video generation completed!")

        res.json({
            message: "Reel generated successfully",
            reel: {
                filename: result.filename,
                url: `/output/${result.filename}`,
            },
        })
    } catch (error) {
        console.error("=== ERROR GENERATING REEL ===")
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
        next(error)
    }
}

module.exports = { generateReel }
