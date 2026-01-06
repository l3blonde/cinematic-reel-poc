const uploadFiles = (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'No files uploaded'
            });
        }

        const uploadedFiles = req.files.map(file => ({
            originalName: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        }));

        console.log(`Received ${uploadedFiles.length} files`);
        console.log(`Received ${uploadedFiles.length} files`);

        res.status(200).json({
            message: 'Files uploaded successfully',
            files: uploadedFiles,
            count: uploadedFiles.length
        });

    } catch (error) {
        console.error('[Upload Error]', error);
        res.status(500).json({
            error: 'Upload failed',
            details: error.message
        });
    }
};

module.exports = {
    uploadFiles
};