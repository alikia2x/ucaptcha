# μCATPCHA

A CAPTCHA system based on **Verifiable Delay Functions (VDFs)**. Instead of image recognition or checkbox puzzles, μCATPCHA requires the client to perform a configurable amount of sequential computational work (repeated squaring modulo an RSA modulus) that the server can verify near-instantly using the RSA trapdoor.

## How It Works

1. A site requests a new challenge via the API, optionally specifying a difficulty (number of squaring iterations **T**)
2. The server generates an RSA modulus **N** (product of two primes), a base **g**, and creates a challenge: compute **y = g^(2^T) mod N**
3. The client performs **T** sequential squarings (in WebAssembly) — this takes real wall-clock time and cannot be parallelized
4. The client submits the answer **y**; the server verifies in O(log T) time using the factorization of N
5. On success, the server returns a signed pass token


## Deployment (Docker)

```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, the backend on `http://localhost:8732`, and the frontend dashboard on `http://localhost:7922`. An admin user is auto-created on first run using the `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_EMAIL` environment variables.

## Usage

### 1. Create a Site & Resources

Log into the dashboard (`http://localhost:7922`) and create a **site** — this gives you a `siteKey`. Under that site, create **resources** (e.g. `"registration"`, `"post"`, `"upload-files"`) — each represents a protected action.

### 2. Configure Difficulty

Without any configuration, challenges default to **200,000** iterations (**T** = 200,000), which takes roughly **1 second** on low-end mobile devices and **~300 ms** on a typical desktop computer.

The iteration count **T** and solution time have a **linear relationship** — doubling T doubles the wall-clock time the client must spend computing. This makes it straightforward to tune the user experience vs. bot deterrence tradeoff.

To customize this, navigate to the **/difficulty** page in the dashboard. You can set:

- A **default difficulty** for an entire site (applies to all resources under that site)
- A **per-resource difficulty** override (e.g. give `"post"` a lower T than `"registration"`)
- **Dynamic thresholds** that automatically increase T when traffic spikes (rate-based scaling)

### 3. Client-Side: Solve a Challenge

Use the `@ucaptcha/js` package in the browser to fetch a challenge, solve the VDF in a Web Worker, and submit the answer.

```ts
import { VdfSolver, ChallengeResponse } from "@ucaptcha/js";

async function getToken(resource: string): Promise<string> {
  // 1. Request a challenge
  const res = await fetch(
    `https://your-ucaptcha.com/challenge/new?siteKey=YOUR_SITE_KEY&resource=${resource}`
  );
  const challenge: ChallengeResponse = await res.json();

  // 2. Solve the VDF (runs in WebWorker)
  const solver = new VdfSolver();
  const answer = await solver.compute(
    challenge.g,
    challenge.N,
    parseInt(challenge.T, 10)
  );

  // 3. Submit answer, get a JWT token
  const resp = await fetch(
    `https://your-ucaptcha.com/challenge/${challenge.id}/answer`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    }
  );
  const data = await resp.json();
  return data.token;
}
```

Send the returned `token` to your backend alongside the protected request.

### 4. Server-Side: Verify the Token

Your backend verifies the JWT using the secret obtained from the dashboard (`/account` -> Manage uCaptcha JWT Secret), and marks the token as used to prevent replay attacks.

```ts
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.UCAPTCHA_JWT_SECRET;

function getKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

interface TokenPayload {
  siteKey: string;
  resource: string;
  jti: string;
  iat: number;
  exp: number;
}

async function verifyRequest(request: Request): Promise<Response | null> {
  const token = request.headers.get("x-captcha-token");
  if (!token) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Verify JWT signature and expiry
  let payload: TokenPayload;
  try {
    const { payload: p } = await jwtVerify(token, getKey());
    payload = p as unknown as TokenPayload;
  } catch {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Check siteKey and resource match expectations (optional but recommended)
  if (payload.siteKey !== "YOUR_SITE_KEY") {
    return new Response(JSON.stringify({ error: "invalid site" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (payload.resource !== "expected-action") {
    return new Response(JSON.stringify({ error: "invalid resource" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Prevent replay attacks — mark token as used (e.g. store jti in Redis)
  const isNew = await markTokenAsUsed(payload.jti);
  if (!isNew) {
    return new Response(JSON.stringify({ error: "token already used" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null; // valid
}

async function markTokenAsUsed(jti: string): Promise<boolean> {
  // Store jti in Redis with a TTL equal to the token's expiry window.
  // Returns true if the key was newly set, false if it already existed.
  // Example: redis.set(jti, "1", "NX", "EX", 300)
}
```

The JWT payload includes:

| Claim | Description |
|---|---|
| `siteKey` | The site the challenge belongs to |
| `resource` | The resource name (e.g. `"registration"`) |
| `jti` | Unique token ID |
| `iat` | Issued-at timestamp |
| `exp` | Expiration timestamp |

### Flow Summary

```
Browser                          uCATPCHA Server                  Your Backend
  │                                    │                               │
  ├─ GET /challenge/new ──────────────>│                               │
  │<──── { id, g, T, N } ──────────────┤                               │
  │                                    │                               │
  |- VdfSolver.compute(g, N, T)        |                               |
  │                                    │                               │
  ├─ POST /challenge/:id/answer ──────>│                               │
  │<──── { token } ────────────────────┤                               │
  │                                    │                               │
  ├── POST /protected ────────────────────────────────────────────────>│
  │   X-Captcha-Token: <token>         │                               │
  │                                    │               ┌─ jwtVerify()  │
  │                                    │               ├─ check claims │
  │                                    │               └─ check jti    │
  │<── 200 OK ─────────────────────────────────────────────────────────┤
```

## Project Structure

```
ucaptcha/
├── apps/
│   ├── backend/          # Hono API server (challenge generation, verification, site/resource management)
│   └── frontend/         # Next.js dashboard (user account, sites, analytics, difficulty configuration)
├── packages/
│   ├── core/             # VDF primitives: RSA key generation, computeVDF, verifyVDF
│   ├── shared/           # Drizzle ORM models, Redis client, auth, settings, quotas
│   ├── js/               # Browser client library (Comlink web worker + WASM solver)
│   └── wasm/             # Rust WebAssembly VDF solver (wasm-bindgen, num-bigint)
├── docker-compose.yml    # Local dev/prod stack (PostgreSQL, Redis, backend, frontend)
├── Dockerfile.backend    # Backend production build (compiles to standalone binary)
├── Dockerfile.frontend   # Frontend production build (Next.js standalone)
└── turbo.json            # Turborepo task pipeline
```

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.10
- [PostgreSQL](https://www.postgresql.org/) (Docker provides one)
- [Redis](https://redis.io/) (Docker provides one)
- [Docker](https://docker.com) & Docker Compose (optional, for containerized deployment)

```bash
# Install all workspace dependencies
bun install

# Start all dev servers (backend + frontend)
bun run dev

# Or run individually:
cd apps/backend && bun run dev   # Hot-reload backend on port 8732
cd apps/frontend && bun run dev  # Next.js dev on port 7922
```

### Environment Variables

**Backend** (`apps/backend/.env`):

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `PORT` | Server port | `8732` |
| `HOST` | Bind address | `0.0.0.0` |
| `ADMIN_USERNAME` | Initial admin username | `admin` |
| `ADMIN_PASSWORD` | Initial admin password | — |
| `ADMIN_EMAIL` | Initial admin email | — |
| `JWT_SECRET` | JWT signing secret | auto-generated |
| `JWT_REFRESH_SECRET` | JWT refresh secret | auto-generated |

**Frontend** (`apps/frontend/.env`):

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `PORT` | Server port | `7922` |
| `BACKEND_URL` | Backend API URL (for Docker proxying) | — |

### Database Setup

```bash
# Push schema to PostgreSQL
cd packages/shared && bun run push

# Open Drizzle Studio GUI
cd packages/shared && bun run studio
```

## API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| `GET` | `/challenge/new` | Generate a new CAPTCHA challenge |
| `GET` | `/challenge/:id` | Get challenge details |
| `POST` | `/challenge/:id/answer` | Submit a VDF solution |
| `POST` | `/challenge/:id/check` | Verify a solution (marks as "used") |

### Authenticated (Bearer JWT)

| Method | Path | Description |
|---|---|---|
| `GET` | `/sites` | List user's sites |
| `POST` | `/sites` | Create a new site |
| `PUT` | `/sites/:id` | Update a site |
| `DELETE` | `/sites/:id` | Delete a site |
| `GET` | `/resources` | List resources (filter by `?siteID=`) |
| `POST` | `/resources` | Create a resource |
| `PUT` | `/resources/:id` | Update a resource |
| `DELETE` | `/resources/:id` | Delete a resource |

## License

Apache 2.0
