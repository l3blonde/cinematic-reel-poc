function getHome(req, res) {
    res.json({
        status: "success",
        message: "Cinematic Reel POC API",
        version: "1.0.0",
        endpoints: {
            health: "/api/v1/health",
            uploads: "/api/v1/uploads",
            reels: "/api/v1/reels",
        },
    })
}

function getHealth(req, res) {
    res.json({
        status: "ok",
        message: "Cinematic Reel POC is running",
        timestamp: new Date().toISOString(),
    })
}

module.exports = {
    getHome,
    getHealth,
}
