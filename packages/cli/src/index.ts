#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { createCommand } from './commands/create.js';
import { quickstartCommand } from './commands/quickstart.js';
import { verifyCommand } from './commands/verify.js';
import { resolveCommand } from './commands/resolve.js';
import { walletCommand } from './commands/wallet.js';
import { searchCommand } from './commands/search.js';
import { reviewCommand } from './commands/review.js';
import { statusCommand } from './commands/status.js';
import { exportCommand } from './commands/export.js';
import { importCommand } from './commands/import.js';

const program = new Command();

program
  .name('citizen')
  .description('EtereCitizen — AI Agent Identity, Trust & Commerce Protocol')
  .version('0.1.0');

program.addCommand(initCommand);
program.addCommand(createCommand);
program.addCommand(quickstartCommand);
program.addCommand(verifyCommand);
program.addCommand(resolveCommand);
program.addCommand(walletCommand);
program.addCommand(searchCommand);
program.addCommand(reviewCommand);
program.addCommand(statusCommand);
program.addCommand(exportCommand);
program.addCommand(importCommand);

program.parse();
