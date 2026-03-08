# Contributing to EtereCitizen

Thank you for your interest in contributing to EtereCitizen. This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Issues

- Use [GitHub Issues](https://github.com/icaroholding/EtereCitizen/issues) to report bugs or request features
- Search existing issues before creating a new one
- Include reproduction steps, expected behavior, and actual behavior for bug reports

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Ensure all tests pass: `pnpm test`
5. Ensure the build succeeds: `pnpm build`
6. Ensure type checking passes: `pnpm typecheck`
7. Submit a pull request

### Development Setup

```bash
git clone https://github.com/icaroholding/EtereCitizen.git
cd EtereCitizen
pnpm install
pnpm build
pnpm test
```

### Project Structure

```
packages/
  common/       — Shared types, schemas, constants
  contracts/    — Solidity smart contracts (Hardhat)
  sdk/          — Core TypeScript SDK
  cli/          — Command-line interface
  mcp-server/   — MCP Server for agent-to-agent tools
  api/          — Hono REST API
  web/          — Next.js web verifier
```

### Build Order

Packages must be built in dependency order:

```
common -> contracts -> sdk -> (cli, mcp-server, api) -> web
```

Running `pnpm build` from the root handles this automatically.

### Testing

- **Vitest** for TypeScript packages: `pnpm test`
- **Hardhat** for smart contracts: `cd packages/contracts && npx hardhat test`
- Write tests for new features and bug fixes
- Maintain or improve test coverage

### Code Style

- TypeScript strict mode
- ESLint + Prettier for formatting
- Run `pnpm lint` before submitting

### Commit Messages

Use clear, descriptive commit messages:

- `add: new feature description`
- `fix: bug description`
- `update: enhancement description`
- `refactor: what was refactored`
- `test: what was tested`
- `docs: what was documented`

## Smart Contract Changes

Changes to Solidity contracts require extra care:

- All changes must include Hardhat tests
- Verify on BaseScan after deployment
- Consider gas optimization
- Review security implications

## Questions?

Open a [GitHub Discussion](https://github.com/icaroholding/EtereCitizen/discussions) or an issue for questions about contributing.

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
