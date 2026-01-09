function uploadFiles(req, res) {
    // Guard clause - no files uploaded
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            error: "No files uploaded",
        })
    }

    // Get uploaded file info
    const uploadedFiles = req.files.map((file) => ({
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path,
    }))

    console.log("[v0] Files uploaded:", uploadedFiles)

    res.json({
        message: "Files uploaded successfully",
        files: uploadedFiles,
        count: uploadedFiles.length,
    })
}

module.exports = {
    uploadFiles,
}
