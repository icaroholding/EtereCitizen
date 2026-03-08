import { DataSource } from 'typeorm';
import {
  Entities,
  migrations,
  KeyStore,
  DIDStore,
  PrivateKeyStore,
} from '@veramo/data-store';
import { randomBytes } from 'crypto';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { createVeramoAgent, type VeramoAgent } from './veramo-config.js';
import type { NetworkName } from '@eterecitizen/common';

export interface VeramoInitOptions {
  network?: NetworkName;
  dbPath?: string;
  secretKey?: string;
}

let cachedAgent: VeramoAgent | null = null;
let cachedDbPath: string | null = null;

export async function initVeramoAgent(options: VeramoInitOptions = {}): Promise<VeramoAgent> {
  const dbPath = options.dbPath || join(process.env.HOME || '.', '.eterecitizen', 'veramo.sqlite');

  // Return cached if same db path
  if (cachedAgent && cachedDbPath === dbPath) {
    return cachedAgent;
  }

  mkdirSync(join(dbPath, '..'), { recursive: true });

  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    synchronize: false,
    migrations,
    migrationsRun: true,
    logging: false,
    entities: Entities,
  });

  await dataSource.initialize();

  // 32 bytes hex = 64 chars for SecretBox
  const secretKey =
    options.secretKey || process.env.VERAMO_SECRET_KEY || randomBytes(32).toString('hex');

  const agent = createVeramoAgent({
    network: options.network,
    dbConnection: dataSource,
    secretKey,
  });

  cachedAgent = agent;
  cachedDbPath = dbPath;

  return agent;
}

export function resetVeramoCache(): void {
  cachedAgent = null;
  cachedDbPath = null;
}
