import * as Comlink from "comlink";
import { compute_vdf } from "./wasm/solver_wasm";
import init from "./wasm/solver_wasm";
import type { VdfWorkerApi, VdfProgressCallback } from "./types";

let wasmReady: Promise<void> | null = null;

function ensureWasm(wasmUrl?: string): Promise<void> {
	if (!wasmReady) {
		const url =
			wasmUrl ?? new URL("./solver_wasm_bg.wasm", import.meta.url).href;
		wasmReady = init({ module_or_path: url }).then(() => {});
	}
	return wasmReady;
}

const api: VdfWorkerApi = {
	async initWasm(wasmUrl: string): Promise<void> {
		await ensureWasm(wasmUrl);
	},

	async compute(
		gStr: string,
		NStr: string,
		T: number,
		onProgress: VdfProgressCallback
	): Promise<string> {
		// If initWasm wasn't called, fall back to the default relative URL
		await ensureWasm();

		const chunkSize = 10000;
		let currentG = gStr;
		let iterationsDone = 0;

		while (iterationsDone < T) {
			const remainingIterations = T - iterationsDone;
			const currentChunkSize =
				remainingIterations > chunkSize ? chunkSize : remainingIterations;

			currentG = compute_vdf(currentG, NStr, BigInt(currentChunkSize));

			iterationsDone += currentChunkSize;

			const progress = iterationsDone / T;
			onProgress(progress);
		}

		if (iterationsDone === T) {
			onProgress(100);
		}

		return currentG;
	},
};

Comlink.expose(api);

