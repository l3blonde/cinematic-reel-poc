const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());  // Only once

app.get('/', (req, res) => {
    res.send('Hello World! Cinematic Reels from Dive Logs');
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});