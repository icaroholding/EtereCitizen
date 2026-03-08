import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';

export class SQLiteStore {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const path = dbPath || join(process.env.HOME || '.', '.eterecitizen', 'data.sqlite');
    mkdirSync(join(path, '..'), { recursive: true });
    this.db = new Database(path);
    this.initialize();
  }

  private initialize(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        did TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        network TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS credentials (
        id TEXT PRIMARY KEY,
        agent_did TEXT NOT NULL,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        issued_at TEXT NOT NULL,
        FOREIGN KEY (agent_did) REFERENCES agents(did)
      );

      CREATE TABLE IF NOT EXISTS wallet_connections (
        agent_did TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        connected_at TEXT NOT NULL,
        FOREIGN KEY (agent_did) REFERENCES agents(did)
      );

      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expires_at TEXT
      );
    `);
  }

  saveAgent(did: string, name: string, description: string | undefined, network: string): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO agents (did, name, description, network, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(did, name, description || null, network, new Date().toISOString(), new Date().toISOString());
  }

  getAgent(did: string): { did: string; name: string; description?: string; network: string } | null {
    return this.db.prepare('SELECT * FROM agents WHERE did = ?').get(did) as any;
  }

  saveCredential(id: string, agentDID: string, type: string, data: unknown): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO credentials (id, agent_did, type, data, issued_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(id, agentDID, type, JSON.stringify(data), new Date().toISOString());
  }

  getCredentials(agentDID: string): Array<{ id: string; type: string; data: unknown }> {
    const rows = this.db
      .prepare('SELECT id, type, data FROM credentials WHERE agent_did = ?')
      .all(agentDID) as Array<{ id: string; type: string; data: string }>;
    return rows.map((r) => ({ ...r, data: JSON.parse(r.data) }));
  }

  saveWalletConnection(agentDID: string, provider: string): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO wallet_connections (agent_did, provider, connected_at)
         VALUES (?, ?, ?)`,
      )
      .run(agentDID, provider, new Date().toISOString());
  }

  getWalletConnection(agentDID: string): { provider: string; connectedAt: string } | null {
    const row = this.db
      .prepare('SELECT provider, connected_at as connectedAt FROM wallet_connections WHERE agent_did = ?')
      .get(agentDID) as any;
    return row || null;
  }

  setCache(key: string, value: unknown, ttlMs?: number): void {
    const expiresAt = ttlMs ? new Date(Date.now() + ttlMs).toISOString() : null;
    this.db
      .prepare('INSERT OR REPLACE INTO cache (key, value, expires_at) VALUES (?, ?, ?)')
      .run(key, JSON.stringify(value), expiresAt);
  }

  getCache<T>(key: string): T | null {
    const row = this.db.prepare('SELECT value, expires_at FROM cache WHERE key = ?').get(key) as any;
    if (!row) return null;
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      this.db.prepare('DELETE FROM cache WHERE key = ?').run(key);
      return null;
    }
    return JSON.parse(row.value) as T;
  }

  close(): void {
    this.db.close();
  }
}
