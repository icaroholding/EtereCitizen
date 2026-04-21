import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const pillars = [
  {
    title: 'Cryptographic identity',
    body: 'Every agent is a did:ethr — a verifiable identifier backed by a secp256k1 key. No vendor lock-in, no central registry.',
  },
  {
    title: 'Verifiable capabilities',
    body: 'W3C Verifiable Credentials attest to what an agent can do. Self-claimed or third-party issued.',
  },
  {
    title: 'On-chain reputation',
    body: 'Reviews anchored on-chain with a SHA-256 hash. Anti-spam cooldowns. Anti-fraud detection. Temporal decay.',
  },
  {
    title: 'Private payment negotiation',
    body: 'Wallet ownership proven via an EIP-4361-style challenge. Payment addresses shared only after trust is established.',
  },
];

export default function Home() {
  return (
    <Layout
      title="EtereCitizen Protocol"
      description="Open protocol for AI-agent identity, trust, and commerce."
    >
      <header className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>EtereCitizen Protocol</h1>
          <p className={styles.heroSubtitle}>
            An open protocol for AI-agent identity, trust, and commerce.
          </p>
          <p className={styles.heroBody}>
            Built on W3C Verifiable Credentials, ERC-1056, and EIP-4361.
            Two reference implementations. 23 / 23 canonical test vectors passing.
            Apache 2.0.
          </p>
          <div className={styles.heroButtons}>
            <Link
              className={clsx('button button--primary button--lg', styles.heroButton)}
              to="/intro"
            >
              Read the intro
            </Link>
            <Link
              className={clsx('button button--secondary button--lg', styles.heroButton)}
              to="/specification/spec"
            >
              Specification
            </Link>
            <Link
              className={clsx('button button--outline button--lg', styles.heroButton)}
              to="https://github.com/icaroholding/EtereCitizen"
            >
              GitHub
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={clsx('container', styles.pillars)}>
          {pillars.map((p) => (
            <article key={p.title} className={styles.pillar}>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </section>

        <section className={clsx('container', styles.callouts)}>
          <div className={styles.callout}>
            <h3>For protocol implementers</h3>
            <p>
              SPEC.md defines every wire format, algorithm, and on-chain interface
              in normative RFC-2119 language. Canonical JSON schemas and deterministic
              test vectors let you write an implementation in any language and prove
              it matches.
            </p>
            <Link to="/specification/spec" className="button button--primary">
              Start with the specification →
            </Link>
          </div>
          <div className={styles.callout}>
            <h3>For agent builders</h3>
            <p>
              Install the TypeScript SDK, scaffold your first agent with{' '}
              <code>npx @eterecitizen/create</code>, and have a verifiable identity in
              a minute. Python SDK available for data-science workflows.
            </p>
            <Link to="/guides/getting-started" className="button button--primary">
              Get started →
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
