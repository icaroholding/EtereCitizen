import { Command } from 'commander';
import chalk from 'chalk';
import { writeFileSync } from 'fs';
import { loadConfig } from '../utils/config.js';

export const exportCommand = new Command('export')
  .description('Export current agent identity')
  .option('--output <file>', 'Output file path', 'agent-export.json')
  .action(async (options) => {
    const config = loadConfig();
    if (!config.currentAgentDID) {
      console.log(chalk.yellow('  No active agent. Run `citizen create` first.'));
      return;
    }

    try {
      // Would load agent from store and call agent.export()
      const exportData = {
        version: '0.3',
        did: config.currentAgentDID,
        exportedAt: new Date().toISOString(),
      };

      writeFileSync(options.output, JSON.stringify(exportData, null, 2));
      console.log(chalk.green(`\n  Exported to ${options.output}\n`));
    } catch (error) {
      console.error(chalk.red(`  Export failed: ${error instanceof Error ? error.message : error}`));
    }
  });
