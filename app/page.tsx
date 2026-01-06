export default function Page() {
    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", fontFamily: "system-ui" }}>
            <h1 style={{ marginBottom: "20px" }}>Cinematic Reel POC</h1>

            <div style={{ backgroundColor: "#f5f5f5", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
                <h2 style={{ marginTop: 0 }}>Project Structure</h2>
                <p>This POC uses separate frontend and backend:</p>
                <ul>
                    <li>
                        <strong>Backend:</strong> Express server on port 3000 (run: <code>npm run dev</code>)
                    </li>
                    <li>
                        <strong>Frontend:</strong> Vite React app on port 5173 (run: <code>cd frontend && npm run dev</code>)
                    </li>
                </ul>
            </div>

            <div style={{ backgroundColor: "#e8f4f8", padding: "20px", borderRadius: "8px" }}>
                <h2 style={{ marginTop: 0 }}>Getting Started</h2>
                <ol>
                    <li>
                        Start backend: <code>npm run dev</code> (from root)
                    </li>
                    <li>
                        Start frontend: <code>cd frontend && npm run dev</code>
                    </li>
                    <li>
                        Open{" "}
                        <a href="http://localhost:5173" target="_blank" rel="noreferrer">
                            http://localhost:5173
                        </a>
                    </li>
                    <li>Upload dive photos/videos and generate cinematic reels!</li>
                </ol>
            </div>

            <div style={{ marginTop: "30px", color: "#666" }}>
                <p>
                    <strong>Tech Stack:</strong> Node.js, Express, React, FFmpeg, Multer
                </p>
                <p>
                    <strong>Documentation:</strong> See <code>/docs</code> folder for bullet-by-bullet guides
                </p>
            </div>
        </div>
    )
}
