import * as Comlink from "comlink";
import type { VdfWorkerApi, VdfProgressCallback } from "./types";

type WorkerMode = "bigint" | "wasm";

export interface VdfSolverOptions {
	/**
	 * Absolute URL to the WASM binary.
	 * When provided, this URL is passed directly to the worker — no resolution is
	 * attempted inside the WorkerGlobalScope.  This is the preferred path because
	 * import.meta.url-based resolution is fragile across bundlers (webpack /
	 * Turbopack / Vite …) when running inside a Web Worker.
	 *
	 * When omitted the worker falls back to resolving `./solver_wasm_bg.wasm`
	 * relative to its own `import.meta.url`, which may not work in all setups.
	 */
	wasmUrl?: string;
}

export class VdfSolver {
	private worker: Worker;
	private workerApi: Comlink.Remote<VdfWorkerApi>;
	private mode: WorkerMode;

	/**
	 * Creates a VdfSolver instance.
	 * The constructor automatically detects the current browser environment and loads the optimal Web Worker.
	 */
	constructor(options?: VdfSolverOptions) {
		this.mode = this.getWorkerMode();

		if (this.mode === "bigint") {
			console.log("VDF Solver: Using BigInt native worker.");
			this.worker = new Worker(new URL("./worker.native.js", import.meta.url), {
				type: "module",
			});
		} else {
			console.log("VDF Solver: Using WASM worker.");
			this.worker = new Worker(new URL("./worker.wasm.js", import.meta.url), {
				type: "module",
			});
		}

		this.workerApi = Comlink.wrap<VdfWorkerApi>(this.worker);

		if (this.mode === "wasm" && options?.wasmUrl) {
			const absoluteWasmUrl = new URL(options.wasmUrl, self.location.href).href;
			this.workerApi.initWasm(absoluteWasmUrl);
		}
	}

	/**
	 * Decides which Worker to use based on the browser's User Agent and feature support.
	 * - Default: Use the native BigInt implementation.
	 * - No BigInt support: Use WASM as a fallback.
	 * @returns 'bigint' or 'wasm'
	 */
	private getWorkerMode(): WorkerMode {
		if (typeof BigInt === "undefined") {
			return "wasm";
		}
		else {
			return "bigint";
		}
	}

	/**
	 * Asynchronously computes the VDF in a Web Worker.
	 * @param g - VDF parameter g, a large number represented as a string.
	 * @param N - VDF parameter N (modulus), a large number represented as a string.
	 * @param T - VDF parameter T (number of iterations).
	 * @param onProgress - An optional callback function to receive calculation progress (0-100).
	 * @returns A Promise that resolves to the result of the calculation as a string.
	 */
	public async compute(
		g: string,
		N: string,
		T: number,
		onProgress?: VdfProgressCallback
	): Promise<string> {
		// Create a default empty callback to avoid null checks in the worker
		const progressCallback = onProgress || (() => { });

		// Use Comlink.proxy to pass the callback function to the worker
		return this.workerApi.compute(g, N, T, Comlink.proxy(progressCallback));
	}

	/**
	 * Terminates the Web Worker to free up resources.
	 * Call this method when the solver instance is no longer needed.
	 */
	public destroy(): void {
		this.workerApi[Comlink.releaseProxy]();
		this.worker.terminate();
		console.log("VDF Worker terminated.");
	}
}
