import { defineConfig } from 'tsdown';
import { wasm } from 'rolldown-plugin-wasm'

export default defineConfig({
    entry: ['./src/index.ts', './src/worker.native.ts', './src/worker.wasm.ts'],
    deps: {
        alwaysBundle: ['@ucaptcha/solver-wasm'],
        neverBundle: ['comlink'],
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
    minify: false,
    treeshake: false,
    plugins: [wasm({ targetEnv: "browser", fileName: "[name][extname]" })],
})