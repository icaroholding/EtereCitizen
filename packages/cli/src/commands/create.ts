import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { EtereCitizen } from '@eterecitizen/sdk';
import { loadConfig, saveConfig } from '../utils/config.js';
import { printIdentityCard } from '../utils/output.js';

export const createCommand = new Command('create')
  .description('Create a new EtereCitizen agent')
  .requiredOption('--name <name>', 'Agent name')
  .option('--description <desc>', 'Agent description')
  .option('--cap <capabilities>', 'Comma-separated capabilities', '')
  .option('--network <network>', 'Network (base, base-sepolia)')
  .action(async (options) => {
    const config = loadConfig();
    const spinner = ora('Creating agent...').start();

    try {
      const capabilities = options.cap ? options.cap.split(',').map((c: string) => c.trim()) : [];

      const agent = await EtereCitizen.createAgent({
        name: options.name,
        description: options.description,
        capabilities,
        network: options.network || config.network,
        dbPath: config.dbPath,
      });

      saveConfig({ currentAgentDID: agent.did });
      spinner.succeed('Agent created successfully');

      const card = await agent.getIdentityCard();
      printIdentityCard(card);

      console.log(chalk.dim(`  DID: ${agent.did}\n`));
    } catch (error) {
      spinner.fail('Failed to create agent');
      console.error(chalk.red(`  ${error instanceof Error ? error.message : error}`));
    }
  });
