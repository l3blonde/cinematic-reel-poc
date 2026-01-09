const ffmpeg = require("fluent-ffmpeg")
const path = require("path")
const fs = require("fs")
const { FILTERS } = require("../config/filters")

const OUTPUT_DIR = path.join(__dirname, "../output")

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const getFileDurationAndType = (files) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"]

    const fileInfos = files.map((file) => {
        const filePath = typeof file === "string" ? file : file.path
        const ext = path.extname(filePath).toLowerCase()
        const isImage = imageExtensions.includes(ext)
        const isVideo = videoExtensions.includes(ext)

        return { path: filePath, isImage, isVideo }
    })

    const imageCount = fileInfos.filter((f) => f.isImage).length

    let imageDuration
    if (imageCount <= 3) {
        imageDuration = 3
    } else if (imageCount <= 5) {
        imageDuration = 2.5
    } else {
        imageDuration = 2
    }

    return { fileInfos, imageDuration }
}

const generateReel = async (files, options = {}) => {
    const timestamp = Date.now()
    const outputFilename = `reel-${timestamp}.mp4`
    const outputPath = path.join(OUTPUT_DIR, outputFilename)

    const filterType = options.filter || "none"
    const transitionType = options.transition || "none"
    const audioPath = options.audio || null

    const filterString = FILTERS[filterType]?.ffmpegFilter || ""

    const { fileInfos, imageDuration } = getFileDurationAndType(files)

    const hasVideos = fileInfos.some((f) => f.isVideo)

    const effectiveTransition = hasVideos && transitionType === "crossfade" ? "none" : transitionType

    return new Promise((resolve, reject) => {
        const command = ffmpeg()

        fileInfos.forEach((fileInfo) => {
            if (fileInfo.isImage) {
                command.input(fileInfo.path).inputOptions(["-loop", "1", "-t", imageDuration.toString()])
            } else if (fileInfo.isVideo) {
                command.input(fileInfo.path)
            } else {
                command.input(fileInfo.path).inputOptions(["-loop", "1", "-t", imageDuration.toString()])
            }
        })

        if (audioPath) {
            command.input(audioPath).inputOptions(["-ss", "10"])
        }

        const filterComplex = []

        fileInfos.forEach((_, i) => {
            let scaleFilter = `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1`

            if (filterString) {
                scaleFilter += `,${filterString}`
            }

            scaleFilter += `,fps=30[v${i}]`
            filterComplex.push(scaleFilter)
        })

        if (effectiveTransition === "crossfade" && files.length > 1) {
            let current = "[v0]"
            for (let i = 1; i < files.length; i++) {
                const nextLabel = i === files.length - 1 ? "[outv]" : `[vx${i}]`
                filterComplex.push(
                    `${current}[v${i}]xfade=transition=fade:duration=0.5:offset=${imageDuration * i - 0.25}${nextLabel}`,
                )
                current = nextLabel
            }
        } else {
            filterComplex.push(`${fileInfos.map((_, i) => `[v${i}]`).join("")}concat=n=${files.length}:v=1:a=0[outv]`)
        }

        command.complexFilter(filterComplex).outputOptions(["-map", "[outv]", "-pix_fmt", "yuv420p", "-c:v", "libx264"])

        if (audioPath) {
            command.outputOptions([`-map`, `${files.length}:a`, `-shortest`, `-c:a`, `aac`, `-b:a`, `192k`])
        }

        command
            .output(outputPath)
            .on("end", () => {
                resolve({ filename: outputFilename, url: `/output/${outputFilename}` })
            })
            .on("error", (err) => {
                reject(err)
            })
            .run()
    })
}

module.exports = { generateReel }
