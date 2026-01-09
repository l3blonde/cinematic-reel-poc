const express = require("express")
const router = express.Router()
const reelController = require("../controllers/reel.controller")

router.post("/", reelController.generateReel)

module.exports = router
