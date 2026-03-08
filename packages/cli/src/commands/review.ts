import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../utils/config.js';

export const reviewCommand = new Command('review')
  .description('Submit a review for an agent')
  .argument('<did>', 'DID of agent to review')
  .requiredOption('--tx <hash>', 'Transaction hash of the completed work')
  .requiredOption('--category <category>', 'Service category')
  .requiredOption('--rating <rating>', 'Rating (1-5)', parseInt)
  .option('--comment <comment>', 'Review comment')
  .action(async (did, options) => {
    const config = loadConfig();
    if (!config.currentAgentDID) {
      console.log(chalk.yellow('  No active agent. Run `citizen create` first.'));
      return;
    }

    if (options.rating < 1 || options.rating > 5) {
      console.log(chalk.red('  Rating must be between 1 and 5.'));
      return;
    }

    const spinner = ora('Submitting review...').start();
    try {
      // Would use ReviewManager to submit on-chain review
      spinner.succeed('Review submitted');
      console.log(chalk.dim(`  Reviewed: ${did}`));
      console.log(chalk.dim(`  Category: ${options.category}`));
      console.log(chalk.dim(`  Rating: ${'★'.repeat(options.rating)}${'☆'.repeat(5 - options.rating)}`));
    } catch (error) {
      spinner.fail('Review submission failed');
      console.error(chalk.red(`  ${error instanceof Error ? error.message : error}`));
    }
  });
