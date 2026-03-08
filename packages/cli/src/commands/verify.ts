import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { EtereCitizen } from '@eterecitizen/sdk';
import { loadConfig } from '../utils/config.js';
import { printTrustResult } from '../utils/output.js';

export const verifyCommand = new Command('verify')
  .description('Verify an agent by DID')
  .argument('<did>', 'DID to verify')
  .option('--json', 'Output as JSON')
  .action(async (did, options) => {
    const config = loadConfig();
    const spinner = ora('Verifying agent...').start();

    try {
      const result = await EtereCitizen.verify(did, {
        network: config.network,
        reputationContractAddress: config.reputationContractAddress as `0x${string}` | undefined,
      });

      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        printTrustResult(result);
      }
    } catch (error) {
      spinner.fail('Verification failed');
      console.error(chalk.red(`  ${error instanceof Error ? error.message : error}`));
    }
  });
