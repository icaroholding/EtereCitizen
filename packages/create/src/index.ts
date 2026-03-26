#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import { createInterface } from 'readline';
import { EtereCitizen } from '@eterecitizen/sdk';

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(chalk.cyan(question), (answer) => resolve(answer.trim()));
  });
}

async function main() {
  console.log();
  console.log(chalk.bold.cyan('  ╔══════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('  ║') + chalk.bold.white('   EtereCitizen Agent Creator        ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('  ╚══════════════════════════════════════╝'));
  console.log();

  const name = await ask('  Agent name: ');
  if (!name) {
    console.log(chalk.red('  Name is required.'));
    rl.close();
    process.exit(1);
  }

  const capsInput = await ask('  Capabilities (comma-separated, e.g. code-generation,research): ');
  const capabilities = capsInput ? capsInput.split(',').map(c => c.trim()).filter(Boolean) : [];

  const networkInput = await ask('  Network (base / base-sepolia) [base-sepolia]: ');
  const network = (networkInput === 'base' ? 'base' : 'base-sepolia') as 'base' | 'base-sepolia';

  const connectWallet = await ask('  Connect a wallet? (y/N): ');
  let walletKey: string | undefined;
  if (connectWallet.toLowerCase() === 'y') {
    walletKey = await ask('  Private key (0x...): ');
  }

  rl.close();
  console.log();

  const spinner = ora('Creating agent identity...').start();

  try {
    const config: any = {
      name,
      capabilities,
      network,
    };

    if (walletKey) {
      config.wallet = {
        provider: 'standard',
        privateKey: walletKey,
      };
    }

    const agent = walletKey
      ? await EtereCitizen.quickStart(config)
      : await EtereCitizen.createAgent(config);

    spinner.succeed(chalk.green('Agent created successfully!'));
    console.log();
    console.log(chalk.bold('  Agent Details:'));
    console.log(`  ${chalk.gray('DID:')}      ${chalk.white(agent.did)}`);
    console.log(`  ${chalk.gray('Name:')}     ${chalk.white(name)}`);
    console.log(`  ${chalk.gray('Network:')}  ${chalk.white(network)}`);
    if (capabilities.length > 0) {
      console.log(`  ${chalk.gray('Caps:')}     ${chalk.yellow(capabilities.join(', '))}`);
    }
    if (walletKey) {
      console.log(`  ${chalk.gray('Wallet:')}   ${chalk.green('Connected')}`);
    }
    console.log();
    console.log(chalk.gray('  Your agent identity is stored locally at ~/.eterecitizen/'));
    console.log(chalk.gray('  Use `npx citizen verify ' + agent.did + '` to verify.'));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red('Failed to create agent'));
    console.error(chalk.red(`  ${error instanceof Error ? error.message : error}`));
    process.exit(1);
  }
}

main().catch(console.error);
