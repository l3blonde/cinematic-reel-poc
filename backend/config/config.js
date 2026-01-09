// Centralized configuration
const config = {
    // Server
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,

    // Directories
    uploadDir: process.env.UPLOAD_DIR || "./uploads",
    outputDir: process.env.OUTPUT_DIR || "./output",

    // File Upload Limits
    maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 524288000, // 500MB default
    maxFileCount: Number.parseInt(process.env.MAX_FILE_COUNT) || 10,

    // Allowed File Types
    allowedImageTypes: process.env.ALLOWED_IMAGE_TYPES?.split(",") || ["image/jpeg", "image/png", "image/jpg"],
    allowedVideoTypes: process.env.ALLOWED_VIDEO_TYPES?.split(",") || ["video/mp4", "video/quicktime"],

    // FFmpeg Settings
    videoDurationPerImage: Number.parseInt(process.env.VIDEO_DURATION_PER_IMAGE) || 3,
    videoFPS: Number.parseInt(process.env.VIDEO_FPS) || 30,
    videoCodec: process.env.VIDEO_CODEC || "libx264",
}

module.exports = config
