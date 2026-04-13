import type { ScanResult } from "./types.js";

const API_BASE = process.env.MCPSHIELD_API_URL ?? "https://www.mcpshield.co/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function scanRemote(
  target: string,
  type: "http" | "github",
  apiKey: string,
): Promise<ScanResult> {
  const res = await fetch(`${API_BASE}/scan`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "mcpshield-cli/2.0.0",
    },
    body: JSON.stringify({ target, type }),
    signal: AbortSignal.timeout(120_000),
  });

  const data = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const errMsg = typeof data.error === "string" ? data.error : `Request failed with status ${res.status}`;
    throw new ApiError(errMsg, res.status);
  }

  return data as unknown as ScanResult;
}
