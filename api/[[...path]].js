// Root-level catch-all Vercel serverless function.
//
// Vercel auto-detects any .js file inside the root `api/` directory and turns
// it into a serverless endpoint — the [[...path]] filename is Vercel's catch-all
// convention, so this one file handles every request to /api/*.
//
// We deliberately keep the Express app in server/ (so the codebase stays
// organized as a backend) and just re-export it from here for Vercel.
export { default } from '../server/api/api.js';
