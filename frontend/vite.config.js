import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Load env from the repo root so VITE_* vars in the shared .env reach the
// browser. Without this, Vite defaults to the frontend/ workspace, which has
// no .env of its own.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, repoRoot, '');
    const apiTarget = env.VITE_API_BASE_URL || 'http://localhost:5174';
    return {
        plugins: [react()],
        envDir: repoRoot,
        server: {
            port: 5173,
            proxy: {
                '/api': { target: apiTarget, changeOrigin: true, secure: false },
            },
        },
        build: { outDir: 'dist', sourcemap: true },
    };
});
