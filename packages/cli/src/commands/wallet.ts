import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../utils/config.js';
import { SQLiteStore } from '@eterecitizen/sdk';

export const walletCommand = new Command('wallet')
  .description('Manage wallet connections');

walletCommand
  .command('connect')
  .description('Connect a wallet to current agent')
  .requiredOption('--provider <provider>', 'Wallet provider (standard, coinbase-cdp, openfort, moonpay, conway)')
  .option('--key <privateKey>', 'Private key (for standard provider)')
  .action(async (options) => {
    const config = loadConfig();
    if (!config.currentAgentDID) {
      console.log(chalk.yellow('  No active agent. Run `citizen create` first.'));
      return;
    }

    const spinner = ora('Connecting wallet...').start();
    try {
      const store = new SQLiteStore(config.dbPath);
      store.saveWalletConnection(config.currentAgentDID, options.provider);
      store.close();

      spinner.succeed(`Wallet connected via ${chalk.cyan(options.provider)}`);
      console.log(chalk.dim(`  Agent: ${config.currentAgentDID}`));
    } catch (error) {
      spinner.fail('Connection failed');
      console.error(chalk.red(`  ${error instanceof Error ? error.message : error}`));
    }
  });

walletCommand
  .command('list')
  .description('List wallet connections')
  .action(async () => {
    const config = loadConfig();
    if (!config.currentAgentDID) {
      console.log(chalk.yellow('  No active agent.'));
      return;
    }

    try {
      const store = new SQLiteStore(config.dbPath);
      const conn = store.getWalletConnection(config.currentAgentDID);
      store.close();

      if (conn) {
        console.log(chalk.bold('  Wallet Connection:'));
        console.log(`  Provider:     ${chalk.cyan(conn.provider)}`);
        console.log(`  Connected at: ${chalk.dim(conn.connectedAt)}`);
      } else {
        console.log(chalk.dim('  No wallet connected. Run `citizen wallet connect` first.'));
      }
    } catch (error) {
      console.error(chalk.red(`  ${error instanceof Error ? error.message : error}`));
    }
  });
