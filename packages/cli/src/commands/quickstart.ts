import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { EtereCitizen } from '@eterecitizen/sdk';
import { loadConfig, saveConfig } from '../utils/config.js';
import { printIdentityCard } from '../utils/output.js';

export const quickstartCommand = new Command('quickstart')
  .description('Create agent and connect wallet in one step')
  .requiredOption('--name <name>', 'Agent name')
  .option('--description <desc>', 'Agent description')
  .option('--cap <capabilities>', 'Comma-separated capabilities', '')
  .option('--wallet <provider>', 'Wallet provider (standard, coinbase-cdp, openfort, moonpay, conway)', 'standard')
  .option('--key <privateKey>', 'Private key for standard wallet')
  .option('--network <network>', 'Network (base, base-sepolia)')
  .action(async (options) => {
    const config = loadConfig();
    const spinner = ora('Setting up agent with wallet...').start();

    try {
      const capabilities = options.cap ? options.cap.split(',').map((c: string) => c.trim()) : [];
      const network = options.network || config.network;

      const walletConfig = options.key
        ? { provider: options.wallet, privateKey: options.key, network }
        : undefined;

      const agent = await EtereCitizen.quickStart({
        name: options.name,
        description: options.description,
        capabilities,
        network,
        wallet: walletConfig,
        dbPath: config.dbPath,
      });

      saveConfig({ currentAgentDID: agent.did });
      spinner.succeed('Agent created and wallet connected');

      const card = await agent.getIdentityCard();
      printIdentityCard(card);
    } catch (error) {
      spinner.fail('Quickstart failed');
      console.error(chalk.red(`  ${error instanceof Error ? error.message : error}`));
    }
  });
