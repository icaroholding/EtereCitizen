## Summary

<!-- One to three sentences on what this PR does and why. -->

## Type of change

<!-- Keep the ones that apply, delete the rest. -->

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (requires a minor or major spec version bump)
- [ ] Specification update (SPEC.md / spec/)
- [ ] Tooling / CI / docs only

## Specification impact

<!-- If this PR changes observable behavior, name the SPEC.md clauses it touches.
     If it adds behavior not yet specified, say so — we'll want a follow-up spec PR. -->

- SPEC.md clauses affected:
- New test vectors added: `spec/test-vectors/...`
- Existing vectors updated:

## Testing

<!-- Check everything you've confirmed. -->

- [ ] `pnpm test` passes locally
- [ ] `pnpm lint` passes locally
- [ ] `pnpm typecheck` passes locally
- [ ] `pnpm --filter @eterecitizen/contracts test` passes (if contracts changed)
- [ ] `pnpm --filter @eterecitizen/conformance test` passes
- [ ] New or changed public behavior has a conformance vector in `spec/test-vectors/`

## Checklist

- [ ] Follows existing code style
- [ ] Self-review completed
- [ ] Comments added for non-obvious decisions
- [ ] Documentation updated where user-facing
- [ ] No leaked secrets, private keys, or API tokens

## Related issues

<!-- Closes #123 -->
