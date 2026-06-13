import * as Comlink from "comlink";
import { compute_vdf } from "./wasm/solver_wasm";
import init from "./wasm/solver_wasm";
import type { VdfWorkerApi, VdfProgressCallback } from "./types";
import wasmUrl from './wasm/solver_wasm_bg.wasm?url';

const wasmReady = init({
	module_or_path: wasmUrl
});

const api: VdfWorkerApi = {
	async compute(
		gStr: string,
		NStr: string,
		T: number,
		onProgress: VdfProgressCallback
	): Promise<string> {
		await wasmReady;

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
