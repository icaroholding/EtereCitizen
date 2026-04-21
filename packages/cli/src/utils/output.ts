import chalk from 'chalk';
import type { IdentityCardData, TrustResult } from '@eterecitizen/sdk';
import { VerificationLevel, VERIFICATION_LEVEL_LABELS } from '@eterecitizen/sdk';

export function printIdentityCard(card: IdentityCardData): void {
  const levelLabel = VERIFICATION_LEVEL_LABELS[card.verificationLevel] || 'Unknown';
  const levelColor = getLevelColor(card.verificationLevel);

  const width = 56;
  const line = '─'.repeat(width);

  console.log(chalk.cyan(`┌${line}┐`));
  console.log(chalk.cyan(`│`) + centerText('ETERECITIZEN IDENTITY CARD', width) + chalk.cyan(`│`));
  console.log(chalk.cyan(`├${line}┤`));
  console.log(chalk.cyan(`│`) + padRight(` Name: ${chalk.bold(card.name)}`, width) + chalk.cyan(`│`));
  console.log(chalk.cyan(`│`) + padRight(` DID:  ${card.did.slice(0, 48)}...`, width) + chalk.cyan(`│`));
  console.log(chalk.cyan(`│`) + padRight(` Level: ${levelColor(levelLabel)} (${card.verificationLevel})`, width) + chalk.cyan(`│`));
  console.log(chalk.cyan(`│`) + padRight(` Score: ${formatScore(card.overallScore)} | Reviews: ${card.totalReviews} | Tasks: ${card.totalTasksCompleted}`, width) + chalk.cyan(`│`));
  console.log(chalk.cyan(`│`) + padRight(` Wallet: ${card.walletConnected ? chalk.green('Connected') : chalk.gray('Not connected')}`, width) + chalk.cyan(`│`));
  console.log(chalk.cyan(`│`) + padRight(` Status: ${card.status}`, width) + chalk.cyan(`│`));

  if (card.capabilities.length > 0) {
    console.log(chalk.cyan(`├${line}┤`));
    console.log(chalk.cyan(`│`) + padRight(` Capabilities:`, width) + chalk.cyan(`│`));
    for (const cap of card.capabilities) {
      console.log(chalk.cyan(`│`) + padRight(`   • ${cap.name}`, width) + chalk.cyan(`│`));
    }
  }

  console.log(chalk.cyan(`│`) + padRight(` Created: ${card.createdAt}`, width) + chalk.cyan(`│`));
  console.log(chalk.cyan(`└${line}┘`));
}

export function printTrustResult(result: TrustResult): void {
  const verified = result.verified ? chalk.green('VERIFIED') : chalk.red('NOT VERIFIED');
  console.log(`\n  Trust Verification: ${verified}`);
  console.log(`  DID: ${result.did}`);
  console.log(`  Level: ${VERIFICATION_LEVEL_LABELS[result.verificationLevel]} (${result.verificationLevel})`);
  console.log(`  Score: ${formatScore(result.reputationScore)}`);
  console.log(`  Reviews: ${result.reviewCount}`);
  console.log(`  Wallet: ${result.walletConnected ? 'Connected' : 'No'}`);
  console.log(`  Age: ${result.agentAge} days`);
  if (result.flags.length > 0) {
    console.log(`  Flags: ${result.flags.join(', ')}`);
  }
  console.log();
}

function formatScore(score: number): string {
  const stars = '★'.repeat(Math.round(score)) + '☆'.repeat(5 - Math.round(score));
  return `${stars} (${score.toFixed(1)})`;
}

function getLevelColor(level: VerificationLevel) {
  switch (level) {
    case VerificationLevel.KYC: return chalk.yellow;
    case VerificationLevel.Business: return chalk.green;
    case VerificationLevel.Domain: return chalk.blue;
    default: return chalk.gray;
  }
}

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE_REGEX = /\u001b\[[0-9;]*m/g;

function centerText(text: string, width: number): string {
  const stripped = text.replace(ANSI_ESCAPE_REGEX, '');
  const padding = Math.max(0, width - stripped.length);
  const left = Math.floor(padding / 2);
  const right = padding - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

function padRight(text: string, width: number): string {
  const stripped = text.replace(ANSI_ESCAPE_REGEX, '');
  const padding = Math.max(0, width - stripped.length);
  return text + ' '.repeat(padding);
}
