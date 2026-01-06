"use client"

import { useState } from "react"

export default function UploadForm() {
    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState(false)
    const [reelUrl, setReelUrl] = useState(null)
    const [error, setError] = useState(null)

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files)
        setFiles(selectedFiles)
        setError(null)
    }

    const handleUpload = async () => {
        if (files.length === 0) {
            alert("Please select files first")
            return
        }

        setUploading(true)
        setError(null)
        setReelUrl(null)

        const formData = new FormData()
        files.forEach((file) => formData.append("files", file))

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

            console.log("Sending request to backend...")
            const response = await fetch("http://localhost:3000/api/reel/generate", {
                method: "POST",
                body: formData,
                signal: controller.signal,
            })

            clearTimeout(timeoutId)
            console.log("Response received:", response.status)

            const data = await response.json()
            console.log("Response data:", data)

            if (data.reel && data.reel.url) {
                setReelUrl(`http://localhost:3000${data.reel.url}`)
            } else if (data.error) {
                setError(data.error.message || "Failed to generate reel")
            }
        } catch (error) {
            console.error("Upload failed:", error)
            if (error.name === "AbortError") {
                setError("Request timed out after 60 seconds. Check backend logs.")
            } else {
                setError("Failed to generate reel. Check if backend is running on port 3000.")
            }
        } finally {
            setUploading(false)
        }
    }

    return (
        <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
            <h1 style={{ color: "#333", marginBottom: "20px" }}>Cinematic Reel Creator</h1>

            <div style={{ marginBottom: "20px" }}>
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    style={{ padding: "10px", width: "100%" }}
                />
            </div>

            {files.length > 0 && (
                <div style={{ marginBottom: "20px", color: "#666" }}>
                    <strong>Selected files:</strong>
                    <ul>
                        {files.map((file, i) => (
                            <li key={i}>{file.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                style={{
                    padding: "12px 24px",
                    backgroundColor: "#333",
                    color: "#fff",
                    border: "none",
                    cursor: uploading ? "not-allowed" : "pointer",
                    fontSize: "16px",
                }}
            >
                {uploading ? "Generating..." : "Generate Reel"}
            </button>

            {error && (
                <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#ffebee", color: "#c62828" }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {reelUrl && (
                <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f0f0f0" }}>
                    <strong>Reel generated!</strong>
                    <br />
                    <a href={reelUrl} download style={{ color: "#000" }}>
                        Download Reel
                    </a>
                </div>
            )}
        </div>
    )
}
