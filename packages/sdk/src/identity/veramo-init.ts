import { DataSource } from 'typeorm';
import { Entities, migrations } from '@veramo/data-store';
import { randomBytes } from 'crypto';
import { join } from 'path';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
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

  // 32 bytes hex = 64 chars for SecretBox.
  // The secret key MUST be the same across restarts, otherwise Veramo's KMS
  // can't decrypt the DID's private key and signing fails with "got 0 bytes".
  // Priority: explicit config > env var > persisted file > generate new (first run only).
  const secretKeyFile = join(dbPath, '..', '.veramo-secret');
  let secretKey = options.secretKey || process.env.VERAMO_SECRET_KEY || '';

  if (!secretKey) {
    // Try to load from persisted file
    if (existsSync(secretKeyFile)) {
      secretKey = readFileSync(secretKeyFile, 'utf-8').trim();
    } else {
      // First run: generate and persist
      secretKey = randomBytes(32).toString('hex');
      writeFileSync(secretKeyFile, secretKey, { mode: 0o600 }); // owner-read-write only
    }
  }

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
