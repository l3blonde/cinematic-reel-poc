const ffmpeg = require("fluent-ffmpeg")
const path = require("path")
const fs = require("fs")

const OUTPUT_DIR = path.join(__dirname, "../output")

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const generateReel = async (files) => {
    const timestamp = Date.now()
    const outputFilename = `reel-${timestamp}.mp4`
    const outputPath = path.join(OUTPUT_DIR, outputFilename)

    console.log("Generating reel with", files.length, "files")
    console.log("Output:", outputPath)

    return new Promise((resolve, reject) => {
        const command = ffmpeg()

        files.forEach((file, index) => {
            command.input(file.path).inputOptions(["-loop", "1", "-t", "3"]) // Each image shows for 3 seconds
        })

        command
            .complexFilter([
                ...files.map(
                    (_, i) =>
                        `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${i}]`,
                ),
                `${files.map((_, i) => `[v${i}]`).join("")}concat=n=${files.length}:v=1:a=0[outv]`,
            ])
            .outputOptions(["-map", "[outv]", "-pix_fmt", "yuv420p", "-c:v", "libx264"])
            .output(outputPath)
            .on("start", (cmd) => console.log("FFmpeg started:", cmd))
            .on("progress", (p) => console.log("Progress:", p.percent, "%"))
            .on("end", () => {
                console.log("Reel generated successfully:", outputFilename)
                resolve({ filename: outputFilename, url: `/output/${outputFilename}` })
            })
            .on("error", (err) => {
                console.error("FFmpeg error:", err.message)
                reject(err)
            })
            .run()
    })
}

module.exports = { generateReel }
