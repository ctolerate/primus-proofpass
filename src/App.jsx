import { useState } from "react";
import { PrimusZKTLS } from "@primuslabs/zktls-js-sdk";
import "./App.css";

const APP_ID = "0x397b68d4074e9a5fcb0aaffb3e2d636da994e403";
const TEMPLATE_ID = "be6b4aaa-cc05-431e-b304-75e99a4868fc";

function App() {
  const [status, setStatus] = useState("Ready");
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(false);

  async function startProof() {
    try {
      setLoading(true);
      setProof(null);
      setStatus("Initializing Primus...");

      const primusZKTLS = new PrimusZKTLS();

      await primusZKTLS.init(APP_ID);

      setStatus("Creating attestation request...");

      const userAddress =
        "0x0000000000000000000000000000000000000000";

      const request = primusZKTLS.generateRequestParams(
        TEMPLATE_ID,
        userAddress
      );

      const requestJson = request.toJsonString();

      console.log("Attestation request:", requestJson);

      setStatus("Sending request to ProofPass server...");

      const response = await fetch(
        "http://localhost:3001/api/sign",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request: requestJson,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Backend signing failed"
        );
      }

      console.log("Signed request:", data.signedRequest);

      setStatus("Waiting for Spotify verification...");

      const attestation =
        await primusZKTLS.startAttestation(
          data.signedRequest
        );

      console.log("Attestation:", attestation);

      setProof(attestation);
      setStatus("Proof generated successfully!");
    } catch (error) {
      console.error("Primus error:", error);

      setStatus(
        `Error: ${error?.message || String(error)}`
      );
    } finally {
      setLoading(false);
    }
  }

  function getProofValue(key) {
    if (!proof) return "—";

    if (proof.data) {
      try {
        const parsedData =
          typeof proof.data === "string"
            ? JSON.parse(proof.data)
            : proof.data;

        return parsedData[key] || "—";
      } catch {
        return "—";
      }
    }

    return "—";
  }

  return (
    <div className="app">
      <div className="container">

        <div className="logo">◈ primus</div>

        <h1>ProofPass</h1>

        <p className="subtitle">
          Verify Web2 account ownership with
          privacy-preserving Primus zkTLS proofs.
        </p>

        <div className="card">

          <div className="card-title">
            <span className="spotify-dot">●</span>
            Spotify Account
          </div>

          <p>
            Prove that you control a Spotify account
            without exposing unnecessary account information.
          </p>

          <button
            onClick={startProof}
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : "Verify Spotify Account"}
          </button>

          <div className="status">
            <span>Status</span>
            <strong>{status}</strong>
          </div>

        </div>

        {proof && (
          <div className="proof-card">

            <div className="verified">
              ✓ VERIFIED
            </div>

            <h2>Spotify Account Ownership</h2>

            <p className="verification-text">
              Primus successfully generated a
              zkTLS attestation for this Spotify account.
            </p>

            <div className="proof-grid">

              <div className="proof-item">
                <span>Name</span>
                <strong>
                  {getProofValue("name")}
                </strong>
              </div>

              <div className="proof-item">
                <span>Username</span>
                <strong>
                  {getProofValue("username")}
                </strong>
              </div>

              <div className="proof-item">
                <span>Source</span>
                <strong>Spotify</strong>
              </div>

              <div className="proof-item">
                <span>Method</span>
                <strong>Primus zkTLS</strong>
              </div>

              <div className="proof-item">
                <span>Attestor</span>
                <strong>
                  {proof.attestors?.[0]?.url || "Primus Labs"}
                </strong>
              </div>

              <div className="proof-item">
                <span>Verified Fields</span>
                <strong>2</strong>
              </div>

            </div>

            <details>
              <summary>
                View raw attestation
              </summary>

              <pre>
                {JSON.stringify(proof, null, 2)}
              </pre>
            </details>

          </div>
        )}

      </div>
    </div>
  );
}

export default App;