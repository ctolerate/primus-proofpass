# ProofPass

ProofPass is a privacy-preserving Web2 account verification application built with Primus zkTLS.

It allows a user to prove ownership of a Spotify account without exposing unnecessary account information.

## How It Works

1. User clicks "Verify Spotify Account".
2. The frontend creates a Primus zkTLS attestation request.
3. The request is sent to the ProofPass backend.
4. The backend signs the request securely.
5. Primus performs the attestation.
6. The resulting proof is displayed in ProofPass.

## Tech Stack

- React
- Vite
- Node.js
- Express
- Primus zkTLS
- Vercel
- Render

## Architecture

```text
User
  ↓
React / Vite Frontend
  ↓
Primus zkTLS Request
  ↓
ProofPass Backend
  ↓
Primus Attestation
  ↓
Spotify Verification
  ↓
Verified Proof