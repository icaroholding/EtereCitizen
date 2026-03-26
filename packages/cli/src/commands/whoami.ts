import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig } from '../utils/config.js';
import { EtereCitizen } from '@eterecitizen/sdk';

export const whoamiCommand = new Command('whoami')
  .description('Show current agent identity card')
  .action(async () => {
    try {
      const config = loadConfig();

      if (!config.currentAgentDID) {
        console.log(chalk.yellow('No agent configured. Run `citizen create` or `citizen quickstart` first.'));
        return;
      }

      const did = config.currentAgentDID;

      console.log();
      console.log(chalk.bold.cyan('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557'));
      console.log(chalk.bold.cyan('\u2551') + chalk.bold.white('        ETERECITIZEN IDENTITY CARD                  ') + chalk.bold.cyan('\u2551'));
      console.log(chalk.bold.cyan('\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563'));
      console.log(chalk.bold.cyan('\u2551') + ` DID: ${chalk.white(did.length > 46 ? did.slice(0, 22) + '...' + did.slice(-22) : did)}`.padEnd(62) + chalk.bold.cyan('\u2551'));
      console.log(chalk.bold.cyan('\u2551') + ` Network: ${chalk.green(config.network || 'base-sepolia')}`.padEnd(62) + chalk.bold.cyan('\u2551'));

      // Try to get more info from SDK
      try {
        const agent = await EtereCitizen.createAgent({
          name: 'whoami',
          capabilities: [],
          network: config.network as any || 'base-sepolia',
          dbPath: config.dbPath,
        });

        const profile = agent.profile;
        if (profile.name && profile.name !== 'whoami') {
          console.log(chalk.bold.cyan('\u2551') + ` Name: ${chalk.white(profile.name)}`.padEnd(62) + chalk.bold.cyan('\u2551'));
        }
        if (profile.capabilities && profile.capabilities.length > 0) {
          const caps = profile.capabilities.map(c => typeof c === 'string' ? c : c.name).join(', ');
          console.log(chalk.bold.cyan('\u2551') + ` Capabilities: ${chalk.yellow(caps)}`.padEnd(62) + chalk.bold.cyan('\u2551'));
        }
      } catch {
        // SDK info optional — show what we have from config
      }

      console.log(chalk.bold.cyan('\u2551') + ` DB: ${chalk.gray(config.dbPath || '~/.eterecitizen/data')}`.padEnd(62) + chalk.bold.cyan('\u2551'));
      console.log(chalk.bold.cyan('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d'));
      console.log();
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`));
    }
  });
