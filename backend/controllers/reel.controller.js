const videoService = require("../services/videoService")
const path = require("path")
const config = require("../config/config")

const generateReel = async (req, res, next) => {
    try {
        const { files, filter = "none", transition = "none", audio = null } = req.body

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ error: "No files provided" })
        }

        const imagePaths = files.map((filename) => path.join(config.uploadDir, filename))

        const audioPath = audio ? path.join(config.uploadDir, audio) : null

        const result = await videoService.generateReel(imagePaths, {
            filter,
            transition,
            audio: audioPath,
        })

        res.json({
            message: "Reel generated successfully",
            reel: {
                filename: result.filename,
                url: result.url,
                appliedFilter: filter,
                appliedTransition: transition,
                hasAudio: !!audioPath,
            },
        })
    } catch (error) {
        console.error("Error generating reel:", error.message)
        next(error)
    }
}

module.exports = { generateReel }
