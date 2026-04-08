import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const CONFIG_DIR = join(homedir(), ".mcpshield");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

interface Config {
  apiKey?: string;
}

export function getConfig(): Config {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function saveApiKey(apiKey: string): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  const config = getConfig();
  config.apiKey = apiKey;
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getApiKey(): string | undefined {
  return process.env.MCPSHIELD_API_KEY ?? getConfig().apiKey;
}
