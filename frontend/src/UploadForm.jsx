"use client"

import { useState } from "react"

export default function UploadForm() {
    const [files, setFiles] = useState([])
    const [audioFile, setAudioFile] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [reelUrl, setReelUrl] = useState("")
    const [error, setError] = useState(null)
    const [filter, setFilter] = useState("deepBlue")
    const [transition, setTransition] = useState("crossfade")

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files)
        setFiles(selectedFiles)
        setReelUrl("")
        setError(null)
    }

    const handleAudioChange = (e) => {
        const selectedAudio = e.target.files?.[0] || null
        setAudioFile(selectedAudio)
    }

    const handleCreateReel = async () => {
        if (files.length === 0) {
            setError("Please select files first")
            return
        }

        setIsProcessing(true)
        setError(null)

        try {
            const formData = new FormData()
            files.forEach((file) => formData.append("files", file))
            if (audioFile) {
                formData.append("files", audioFile)
            }

            const uploadResponse = await fetch("http://localhost:3000/api/v1/uploads", {
                method: "POST",
                body: formData,
            })

            const uploadData = await uploadResponse.json()

            if (!uploadData.files || !Array.isArray(uploadData.files)) {
                setError("Upload failed")
                setIsProcessing(false)
                return
            }

            const imageFiles = uploadData.files.filter((f) => !f.filename.match(/\.(mp3|wav|m4a)$/i))
            const audioFileUploaded = uploadData.files.find((f) => f.filename.match(/\.(mp3|wav|m4a)$/i))

            const generateResponse = await fetch("http://localhost:3000/api/v1/reels", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    files: imageFiles.map((f) => f.filename),
                    filter,
                    transition,
                    audio: audioFileUploaded?.filename || null,
                }),
            })

            const generateData = await generateResponse.json()

            if (generateData.reel && typeof generateData.reel.url === "string") {
                const fullUrl = `http://localhost:3000${generateData.reel.url}`
                setReelUrl(fullUrl)
            } else {
                setError("Generation failed")
            }
        } catch (err) {
            console.error("Error:", err)
            let errorMessage = "Unknown error occurred"
            if (err instanceof Error) {
                errorMessage = err.message
            } else if (typeof err === "string") {
                errorMessage = err
            }
            setError(`Failed to create reel: ${errorMessage}`)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCreateAnother = () => {
        setFiles([])
        setAudioFile(null)
        setReelUrl("")
        setError(null)
        setFilter("deepBlue")
        setTransition("crossfade")
    }

    return (
        <div
            style={{
                padding: "clamp(16px, 3vw, 24px)",
                maxWidth: "780px",
                margin: "0 auto",
                fontFamily: "system-ui, -apple-system, sans-serif",
                backgroundColor: "#000",
                minHeight: "100vh",
                color: "#fff",
                boxSizing: "border-box",
                width: "100%",
            }}
        >
            <h1
                style={{
                    fontSize: "clamp(24px, 4.5vw, 36px)",
                    fontWeight: "700",
                    marginBottom: "clamp(20px, 3vw, 28px)",
                    lineHeight: "1.2",
                    textAlign: "center",
                    letterSpacing: "-0.5px",
                }}
            >
                Ocean's 4 Cinematic Reel Generator
            </h1>

            <div
                style={{
                    border: "2px solid #3a3a3a",
                    borderRadius: "8px",
                    padding: "clamp(14px, 2.5vw, 18px)",
                    marginBottom: "clamp(12px, 2vw, 16px)",
                    backgroundColor: "#1a1a1a",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    id="file-input"
                    style={{ display: "none" }}
                />
                <label
                    htmlFor="file-input"
                    style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        backgroundColor: "#fff",
                        color: "#000",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "clamp(13px, 2.2vw, 15px)",
                        fontWeight: "600",
                        marginRight: "12px",
                        transition: "all 0.2s",
                    }}
                >
                    Choose files
                </label>
                <span style={{ fontSize: "clamp(13px, 2.2vw, 15px)", color: "#e0e0e0" }}>{files.length} files</span>
            </div>

            <div style={{ color: "#999", fontSize: "clamp(12px, 2vw, 14px)", marginBottom: "clamp(16px, 2.5vw, 20px)" }}>
                {files.length} file(s) selected
                {audioFile && <span style={{ marginLeft: "8px", color: "#fff", fontWeight: "600" }}>+ 1 audio file</span>}
            </div>

            <div style={{ marginBottom: "clamp(14px, 2vw, 18px)" }}>
                <label
                    style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "clamp(14px, 2.5vw, 16px)",
                        fontWeight: "700",
                        color: "#fff",
                    }}
                >
                    Cinematic Filter: <span style={{ color: "#888", fontWeight: "400", fontSize: "0.9em" }}>optional</span>
                </label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        padding: "clamp(10px, 2vw, 14px)",
                        width: "100%",
                        fontSize: "clamp(13px, 2.3vw, 15px)",
                        fontWeight: "600",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        border: "2px solid #444",
                        borderRadius: "8px",
                        cursor: "pointer",
                        boxSizing: "border-box",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        transition: "all 0.2s",
                    }}
                >
                    <option value="deepBlue">Deep Blue (Underwater)</option>
                    <option value="vintageExplorer">Vintage Explorer (Film)</option>
                    <option value="biolume">Biolume (Glowing)</option>
                    <option value="ultraVivid">Ultra Vivid (BBC Nature)</option>
                    <option value="none">None (Original)</option>
                </select>
            </div>

            <div style={{ marginBottom: "clamp(18px, 3vw, 24px)" }}>
                <label
                    style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "clamp(14px, 2.5vw, 16px)",
                        fontWeight: "700",
                        color: "#fff",
                    }}
                >
                    Transition Effect: <span style={{ color: "#888", fontWeight: "400", fontSize: "0.9em" }}>optional</span>
                </label>
                <select
                    value={transition}
                    onChange={(e) => setTransition(e.target.value)}
                    style={{
                        padding: "clamp(10px, 2vw, 14px)",
                        width: "100%",
                        fontSize: "clamp(13px, 2.3vw, 15px)",
                        fontWeight: "600",
                        backgroundColor: "#2a2a2a",
                        color: "#fff",
                        border: "2px solid #444",
                        borderRadius: "8px",
                        cursor: "pointer",
                        boxSizing: "border-box",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        transition: "all 0.2s",
                    }}
                >
                    <option value="crossfade">Fade (Cross Dissolve)</option>
                    <option value="fade">Fade (to Black)</option>
                    <option value="none">None (Hard Cuts)</option>
                </select>
            </div>

            <div style={{ marginBottom: "clamp(14px, 2vw, 18px)" }}>
                <label
                    style={{
                        display: "block",
                        marginBottom: "8px",
                        fontSize: "clamp(14px, 2.5vw, 16px)",
                        fontWeight: "700",
                        color: "#fff",
                    }}
                >
                    Background Music: <span style={{ color: "#888", fontWeight: "400", fontSize: "0.9em" }}>optional</span>
                </label>
                <input type="file" accept="audio/*" onChange={handleAudioChange} id="audio-input" style={{ display: "none" }} />
                <label
                    htmlFor="audio-input"
                    style={{
                        display: "inline-block",
                        padding: "8px 16px",
                        backgroundColor: audioFile ? "#fff" : "#2a2a2a",
                        color: audioFile ? "#000" : "#fff",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "clamp(12px, 2vw, 14px)",
                        fontWeight: "600",
                        border: "2px solid #444",
                        transition: "all 0.2s",
                    }}
                >
                    {audioFile ? `✓ ${audioFile.name}` : "Choose audio file (optional)"}
                </label>
            </div>

            <button
                onClick={handleCreateReel}
                disabled={isProcessing || files.length === 0}
                style={{
                    padding: "clamp(14px, 3vw, 18px) clamp(20px, 4vw, 28px)",
                    backgroundColor: isProcessing || files.length === 0 ? "#555" : "#e8e8e8",
                    color: "#000",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isProcessing || files.length === 0 ? "not-allowed" : "pointer",
                    fontSize: "clamp(15px, 3vw, 18px)",
                    width: "100%",
                    fontWeight: "700",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                    boxShadow: isProcessing || files.length === 0 ? "none" : "0 4px 12px rgba(255,255,255,0.15)",
                    letterSpacing: "0.3px",
                }}
            >
                {isProcessing ? "Creating Your Reel..." : "Create My Reel"}
            </button>

            {error && (
                <div
                    style={{
                        color: "#fff",
                        marginTop: "clamp(10px, 2vw, 12px)",
                        padding: "clamp(8px, 1.5vw, 10px)",
                        backgroundColor: "#2a1a1a",
                        borderRadius: "5px",
                        border: "1px solid #666",
                        fontSize: "clamp(11px, 2vw, 13px)",
                    }}
                >
                    {error}
                </div>
            )}

            {reelUrl && (
                <div style={{ marginTop: "clamp(20px, 4vw, 28px)" }}>
                    <h2
                        style={{
                            color: "#fff",
                            fontSize: "clamp(20px, 4vw, 28px)",
                            marginBottom: "clamp(14px, 2.5vw, 18px)",
                            fontWeight: "700",
                            letterSpacing: "-0.3px",
                        }}
                    >
                        Your Reel is Ready!
                    </h2>
                    <video
                        src={reelUrl}
                        controls
                        style={{
                            width: "100%",
                            borderRadius: "8px",
                            marginBottom: "clamp(14px, 2.5vw, 18px)",
                            maxHeight: "400px",
                            backgroundColor: "#000",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                        }}
                    />
                    <div style={{ display: "flex", gap: "clamp(10px, 2vw, 14px)", flexWrap: "wrap" }}>
                        <a
                            href={reelUrl}
                            download
                            style={{
                                flex: "1",
                                minWidth: "140px",
                                textAlign: "center",
                                padding: "clamp(12px, 2.5vw, 16px) clamp(16px, 3vw, 22px)",
                                backgroundColor: "#e8e8e8",
                                color: "#000",
                                textDecoration: "none",
                                borderRadius: "8px",
                                fontWeight: "700",
                                fontSize: "clamp(13px, 2.5vw, 15px)",
                                boxSizing: "border-box",
                                transition: "all 0.2s",
                                boxShadow: "0 2px 8px rgba(255,255,255,0.1)",
                                letterSpacing: "0.2px",
                            }}
                        >
                            Download MP4
                        </a>
                        <button
                            onClick={handleCreateAnother}
                            style={{
                                flex: "1",
                                minWidth: "140px",
                                padding: "clamp(12px, 2.5vw, 16px) clamp(16px, 3vw, 22px)",
                                backgroundColor: "transparent",
                                color: "#e8e8e8",
                                border: "2px solid #555",
                                borderRadius: "8px",
                                fontWeight: "700",
                                fontSize: "clamp(13px, 2.5vw, 15px)",
                                cursor: "pointer",
                                boxSizing: "border-box",
                                transition: "all 0.2s",
                                letterSpacing: "0.2px",
                            }}
                        >
                            Create Another Reel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
