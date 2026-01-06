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

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    return app
}

module.exports = setupExpress
