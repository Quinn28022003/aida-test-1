export default function Page() {
    return (
        <>
            <span className="badge">Health</span>
            <h1>Vault service health</h1>
            <p className="status">Status: OK</p>
            <p>Service: Vault</p>
            <p className="hint">All good. The vault app is up and running.</p>
        </>
    );
}
