import { EtereCitizen, type EtereCitizenConfig } from '@eterecitizen/sdk';
import type { Agent } from '@eterecitizen/sdk';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

let currentAgent: Agent | null = null;

function loadConfig(): EtereCitizenConfig & { currentAgentDID?: string } {
  const configPath = join(
    process.env.HOME || '.',
    '.eterecitizen',
    'config.json',
  );
  if (existsSync(configPath)) {
    try {
      return JSON.parse(readFileSync(configPath, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Get the current agent. Creates one if it doesn't exist yet.
 * Reads from ~/.eterecitizen/config.json for the current agent DID.
 */
export async function getCurrentAgent(): Promise<Agent> {
  if (currentAgent) return currentAgent;

  const config = loadConfig();

  // Create a new agent for this MCP session
  currentAgent = await EtereCitizen.createAgent({
    name: process.env.ETERECITIZEN_AGENT_NAME || 'MCP Agent',
    capabilities: [],
    network: config.network as any || 'base-sepolia',
    dbPath: config.dbPath,
    pinataApiKey: config.pinataApiKey,
    pinataSecretKey: config.pinataSecretKey,
  });

  return currentAgent;
}

export function setCurrentAgent(agent: Agent): void {
  currentAgent = agent;
}

export function getConfig(): EtereCitizenConfig {
  return loadConfig();
}
