import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const CONFIG_DIR = join(process.env.HOME || '.', '.eterecitizen');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export interface CLIConfig {
  network: 'base' | 'base-sepolia';
  currentAgentDID?: string;
  dbPath: string;
  pinataApiKey?: string;
  pinataSecretKey?: string;
  reputationContractAddress?: string;
}

const DEFAULT_CONFIG: CLIConfig = {
  network: 'base-sepolia',
  dbPath: join(CONFIG_DIR, 'data.sqlite'),
};

export function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): CLIConfig {
  ensureConfigDir();
  if (!existsSync(CONFIG_FILE)) {
    return DEFAULT_CONFIG;
  }
  try {
    const data = readFileSync(CONFIG_FILE, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: Partial<CLIConfig>): void {
  ensureConfigDir();
  const current = loadConfig();
  const merged = { ...current, ...config };
  writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2));
}

export function getConfigDir(): string {
  return CONFIG_DIR;
}
