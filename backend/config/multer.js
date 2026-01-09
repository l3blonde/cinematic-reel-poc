const multer = require("multer")
const path = require("path")
const config = require("./config")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", config.uploadDir))
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`
        cb(null, uniqueName)
    },
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mp3|wav|m4a/
    const allowedMimetypes = /image\/(jpeg|jpg|png|gif)|video\/(mp4|quicktime|x-msvideo)|audio\/(mpeg|wav|mp4)/

    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedMimetypes.test(file.mimetype)

    if (extname && mimetype) {
        cb(null, true)
    } else {
        cb(new Error("Only images, videos, and audio files allowed"), false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.maxFileSize,
        files: config.maxFileCount,
    },
})

module.exports = upload
