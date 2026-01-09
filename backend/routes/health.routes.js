const express = require("express")
const router = express.Router()
const upload = require("../config/multer")
const uploadController = require("../controllers/upload.controller")

router.post(
    "/",
    (req, res, next) => {
        upload.array("files", 10)(req, res, (err) => {
            if (err) {
                console.error("Multer error:", err.message, err.code)
                return res.status(500).json({
                    error: err.message,
                    code: err.code,
                })
            }
            next()
        })
    },
    uploadController.uploadFiles,
)

module.exports = router
