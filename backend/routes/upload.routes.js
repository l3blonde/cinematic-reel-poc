const express = require("express")
const router = express.Router()
const upload = require("../config/multer")
const uploadController = require("../controllers/upload.controller")

router.post("/", upload.array("files", 10), uploadController.uploadFiles)

module.exports = router
