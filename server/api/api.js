// Vercel serverless entry point for the Express API.
// Re-exports the app defined in ../src/server.js so the same Express instance
// serves local dev (via `npm run dev`) and Vercel production.
//
// Vercel discovers this file via the `functions` block in the root vercel.json,
// and the `rewrites` block routes every /api/* request here.
export { default } from '../src/server.js';
