import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { EtereCitizen } from '@eterecitizen/sdk';

export const searchCommand = new Command('search')
  .description('Search for agents in the registry')
  .option('--capability <cap>', 'Filter by capability')
  .option('--min-rating <rating>', 'Minimum rating', parseFloat)
  .option('--min-level <level>', 'Minimum verification level', parseInt)
  .option('--name <name>', 'Search by name')
  .option('--limit <limit>', 'Max results', parseInt)
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const spinner = ora('Searching agents...').start();

    try {
      const result = await EtereCitizen.search({
        capability: options.capability,
        minRating: options.minRating,
        minLevel: options.minLevel,
        name: options.name,
        limit: options.limit || 20,
      });

      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      if (result.agents.length === 0) {
        console.log(chalk.yellow('\n  No agents found.\n'));
        return;
      }

      console.log(chalk.cyan(`\n  Found ${result.total} agents:\n`));
      for (const agent of result.agents) {
        const level = `L${agent.verificationLevel}`;
        const score = agent.overallScore.toFixed(1);
        console.log(`  ${chalk.bold(agent.name)} (${level}) - Score: ${score} - ${agent.did}`);
        if (agent.capabilities.length > 0) {
          console.log(chalk.dim(`    Capabilities: ${agent.capabilities.join(', ')}`));
        }
      }
      console.log();
    } catch (error) {
      spinner.fail('Search failed');
      console.error(chalk.red(`  ${error instanceof Error ? error.message : error}`));
    }
  });
