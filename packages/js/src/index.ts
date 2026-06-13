import { VdfSolver } from "./solver";
import type { VdfSolverOptions } from "./solver";
import { createCaptchaSolver, CaptchaSolverError } from "./api";
import type { CaptchaSolverOptions, CaptchaSolver } from "./types";

export { default as wasmUrl } from "./wasm/solver_wasm_bg.wasm?url";

export { createCaptchaSolver, CaptchaSolverError, VdfSolver };
export type { CaptchaSolverOptions, CaptchaSolver, VdfSolverOptions };
