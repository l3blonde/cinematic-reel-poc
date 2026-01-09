const express = require("express")
const cors = require("cors")

function setupExpress() {
    const app = express()

    app.use(
        cors({
            origin: "http://localhost:5173",
            credentials: true,
        }),
    )

    app.use(express.json({ limit: "100mb" }))
    app.use(express.urlencoded({ extended: true, limit: "100mb" }))

    return app
}

module.exports = setupExpress
