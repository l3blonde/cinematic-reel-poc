function getHealth(req, res) {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
}

function getHome(req, res) {
    res.send('Hello World! Cinematic Reels from Dive Logs');
}

module.exports = {
    getHealth,
    getHome
};





