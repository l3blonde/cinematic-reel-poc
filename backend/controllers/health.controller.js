function getHealth(req, res) {
    res.json({
        status: "ok",
        message: "Cinematic Reel POC is running",
        timestamp: new Date().toISOString(),
    })
}

module.exports = {
    getHealth,
}
