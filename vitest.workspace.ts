import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/common',
  // contracts uses Hardhat + chai — run via `npx hardhat test` instead
  'packages/sdk',
  'packages/cli',
  'packages/mcp-server',
  'packages/api',
  'packages/conformance',
]);
