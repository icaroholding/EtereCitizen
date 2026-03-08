import { randomBytes } from 'crypto';
import type { ChallengeMessage } from '@eterecitizen/common';

const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function generateChallenge(address: string, chainId: number): ChallengeMessage {
  const nonce = randomBytes(16).toString('hex');
  const now = new Date();

  return {
    domain: 'eterecitizen.ai',
    address,
    statement: 'Sign this message to prove ownership of this wallet for EtereCitizen protocol.',
    nonce,
    issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CHALLENGE_EXPIRY_MS).toISOString(),
    chainId,
  };
}

export function challengeToMessage(challenge: ChallengeMessage): string {
  return [
    `${challenge.domain} wants you to sign in with your Ethereum account:`,
    challenge.address,
    '',
    challenge.statement,
    '',
    `Chain ID: ${challenge.chainId}`,
    `Nonce: ${challenge.nonce}`,
    `Issued At: ${challenge.issuedAt}`,
    `Expiration Time: ${challenge.expiresAt}`,
  ].join('\n');
}

export function isChallengeExpired(challenge: ChallengeMessage): boolean {
  return new Date(challenge.expiresAt).getTime() < Date.now();
}
