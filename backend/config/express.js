const express = require("express")
const cors = require("cors")

function setupExpress() {
    const app = express()

    const allowedOrigins = ["http://localhost:5173", "http://165.232.82.22"]

    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true)
                } else {
                    callback(null, true)
                }
            },
            credentials: true,
        }),
    )

    app.use(express.json({ limit: "100mb" }))
    app.use(express.urlencoded({ extended: true, limit: "100mb" }))

    return app
}

module.exports = setupExpress
