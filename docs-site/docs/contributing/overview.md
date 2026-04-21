---
id: overview
title: Contributing
sidebar_label: Overview
---

# Contributing to EtereCitizen

Thanks for being here. EtereCitizen is open source under Apache 2.0 and improves every time someone reads the spec carefully enough to find something wrong with it.

## Quick orientation

- **Protocol semantics**: [`SPEC.md`](https://github.com/icaroholding/EtereCitizen/blob/main/SPEC.md) is authoritative.
- **Code**: lives in `packages/*` (TypeScript workspaces) and `sdks/*` (other languages).
- **Tests that prove conformance**: `spec/test-vectors/` — changes here require version coordination.
- **Security issues**: follow [SECURITY.md](https://github.com/icaroholding/EtereCitizen/blob/main/SECURITY.md) — **do not** open a public issue.

## Kinds of contribution

### Spec issues

You read SPEC.md and something was ambiguous, contradictory, or missing. Open a "Specification issue" on GitHub using the template. Quote the exact clause. Propose a resolution.

### Bug reports

The implementation does the wrong thing. Open a "Bug report" on GitHub. Include a minimal reproduction and reference the SPEC clause it violates.

### Feature proposals

You want the protocol to do something it doesn't. Open a "Feature request" explaining the motivation, the proposed design, and what alternatives you considered.

### Code PRs

Follow the process in [CONTRIBUTING.md](https://github.com/icaroholding/EtereCitizen/blob/main/CONTRIBUTING.md). Key rules:

- If your change affects observable wire format or contract interface, SPEC.md MUST be updated in the same PR.
- If your change introduces a new deterministic computation, add a test vector under `spec/test-vectors/`.
- Run the conformance suite before you push: `pnpm --filter @eterecitizen/conformance test`.
- Run the Python conformance runner: `python3 sdks/python/scripts/run_conformance.py`.

### Alternative-language SDKs

We welcome Python-next (beyond 0.1.0 deterministic-only), Go, Rust, Swift, Kotlin. Read [CONFORMANCE.md](/specification/conformance). Implement the spec. Reach 23/23 on the vectors. Open a PR. Done.

## Architecture Decision Records

When you make a non-obvious design choice, write it down in [docs/adr/](/adr). Future you, future contributors, and anyone auditing the project will thank you. ADRs are append-only — they are never rewritten, only superseded.

## Community

- **GitHub Discussions** for anything that isn't a bug or feature request.
- **GitHub Issues** for bugs, spec ambiguity, and features.
- **security@eterecitizen.io** for security disclosure.
