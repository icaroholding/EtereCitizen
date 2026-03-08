import { Command } from 'commander';
import chalk from 'chalk';
import { ensureConfigDir, saveConfig, getConfigDir } from '../utils/config.js';

export const initCommand = new Command('init')
  .description('Initialize EtereCitizen local environment')
  .option('--network <network>', 'Network to use (base, base-sepolia)', 'base-sepolia')
  .action(async (options) => {
    console.log(chalk.cyan('\n  Initializing EtereCitizen...\n'));

    ensureConfigDir();
    saveConfig({ network: options.network });

    console.log(`  Config directory: ${getConfigDir()}`);
    console.log(`  Network: ${options.network}`);
    console.log(chalk.green('\n  Initialization complete.\n'));
  });
