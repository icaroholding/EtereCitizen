# CLI Reference

## Installation

```bash
pnpm add -g @eterecitizen/cli
```

## Commands

### `citizen init`

Initialize local configuration.

```bash
citizen init [--network <base|base-sepolia>]
```

Creates `~/.eterecitizen/config.json` with default settings.

### `citizen create`

Create a new agent identity.

```bash
citizen create --name "MyAgent" [--description "desc"] [--cap capability1,capability2] [--network base-sepolia]
```

### `citizen quickstart`

Create agent + connect wallet in one step.

```bash
citizen quickstart --name "MyAgent" --wallet standard --key 0x... [--network base-sepolia]
```

### `citizen verify <did>`

Verify an agent and display their Identity Card.

```bash
citizen verify did:ethr:0x14a34:0x1234... [--json]
```

### `citizen resolve <did>`

Show raw DID Document.

```bash
citizen resolve did:ethr:0x14a34:0x1234... [--json]
```

### `citizen wallet connect`

Connect a wallet to the current agent.

```bash
citizen wallet connect --provider <standard|coinbase-cdp|openfort|moonpay|conway> [--key 0x...]
```

### `citizen wallet list`

Show wallet connection for current agent.

```bash
citizen wallet list
```

### `citizen search`

Search for agents.

```bash
citizen search [--capability code-generation] [--min-rating 4.0] [--min-level 2] [--limit 10] [--json]
```

### `citizen review <did>`

Submit a review for an agent.

```bash
citizen review did:ethr:0x14a34:0x... --tx 0x... --category code-generation --rating 5 [--comment "Great work"]
```

### `citizen status`

Show current agent status.

```bash
citizen status [--json]
```

### `citizen export`

Export agent identity.

```bash
citizen export [--output agent-backup.json]
```

### `citizen import`

Import agent identity.

```bash
citizen import --input agent-backup.json
```

## Configuration

Config file: `~/.eterecitizen/config.json`

```json
{
  "network": "base-sepolia",
  "currentAgentDID": "did:ethr:0x14a34:0x...",
  "dbPath": "~/.eterecitizen/data.sqlite",
  "pinataApiKey": "...",
  "pinataSecretKey": "...",
  "eterecitizenContractAddress": "0x2BecDFe8406eA2895F16a9B8448b40166F4178f6"
}
```
