function App() {
    return (
        <div style={{
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <header style={{
                borderBottom: '1px solid var(--border)',
                paddingBottom: '1rem',
                marginBottom: '2rem'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '300',
                    letterSpacing: '0.05em'
                }}>
                    CINEMATIC REEL CREATOR
                </h1>
                <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                    marginTop: '0.5rem'
                }}>
                    Transform dive logs into cinematic reels
                </p>
            </header>

            <main>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Frontend ready. Upload functionality coming next.
                </p>
            </main>
        </div>
    );
}

export default App;