const express = require("express")
const router = express.Router()
const reelController = require("../controllers/reel.controller")
const upload = require("../config/multer")

router.post("/generate", upload.array("files", 10), reelController.generateReel)

module.exports = router
