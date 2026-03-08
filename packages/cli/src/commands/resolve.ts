import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { EtereCitizen } from '@eterecitizen/sdk';
import { loadConfig } from '../utils/config.js';

export const resolveCommand = new Command('resolve')
  .description('Resolve a DID and display its DID Document')
  .argument('<did>', 'DID to resolve')
  .action(async (did) => {
    const config = loadConfig();
    const spinner = ora('Resolving DID...').start();

    try {
      const document = await EtereCitizen.resolve(did, { network: config.network });
      spinner.stop();

      if (document) {
        console.log(JSON.stringify(document, null, 2));
      } else {
        console.log(chalk.yellow('  DID document not found.'));
      }
    } catch (error) {
      spinner.fail('Resolution failed');
      console.error(chalk.red(`  ${error instanceof Error ? error.message : error}`));
    }
  });
