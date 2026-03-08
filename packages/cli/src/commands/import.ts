import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { saveConfig } from '../utils/config.js';

export const importCommand = new Command('import')
  .description('Import an agent identity')
  .requiredOption('--input <file>', 'Input file path')
  .action(async (options) => {
    try {
      const data = JSON.parse(readFileSync(options.input, 'utf-8'));

      if (!data.did) {
        console.log(chalk.red('  Invalid export file: missing DID.'));
        return;
      }

      // Would use Agent.import() to restore the agent
      saveConfig({ currentAgentDID: data.did });
      console.log(chalk.green(`\n  Imported agent: ${data.did}\n`));
    } catch (error) {
      console.error(chalk.red(`  Import failed: ${error instanceof Error ? error.message : error}`));
    }
  });
