import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig } from '../utils/config.js';

export const statusCommand = new Command('status')
  .description('Show current agent status')
  .action(async () => {
    const config = loadConfig();

    console.log(chalk.cyan('\n  EtereCitizen Status\n'));
    console.log(`  Network:  ${config.network}`);
    console.log(`  Agent:    ${config.currentAgentDID || chalk.gray('(none)')}`);
    console.log(`  DB Path:  ${config.dbPath}`);
    console.log();
  });
