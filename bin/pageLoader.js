#!/usr/bin/env node

import testFunc from '../src/index.js'
import { Command } from 'commander';

const program = new Command();

program
  .name('page-loader')
  .version('1.0.0')
  .description('Page loader utility')
  .argument('<url>', 'site url')
  .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir")')
  .action((url, options) => {
    const content = testFunc(url, options.output);
    console.log(content);
  });

program.parse();
