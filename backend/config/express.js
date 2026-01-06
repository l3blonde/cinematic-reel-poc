const express = require('express');

function configureExpress() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });

    return app;
}

module.exports = configureExpress;