import { defineConfig } from 'tsdown';
import { wasm } from 'rolldown-plugin-wasm'

export default defineConfig({
    entry: ['./src/index.ts', './src/worker.native.ts', './src/worker.wasm.ts'],
    deps: {
        alwaysBundle: ['@ucaptcha/solver-wasm'],
    },
    dts: {
        tsconfig: "./tsconfig.json",
        sourcemap: true,
    },
    outputOptions: {
        format: 'esm',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js'
    },
    sourcemap: true,
    minify: true,
    treeshake: true,
    plugins: [wasm({ targetEnv: "browser", fileName: "[name][extname]" })],
})