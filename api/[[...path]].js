// Vercel serverless entry point.
// Vercel detects files under /api and turns them into functions. The [[...path]]
// catch-all forwards every request under /api/* to the Express app so we don't
// have to split routes into separate files.
export { default } from '../server/src/index.js';
