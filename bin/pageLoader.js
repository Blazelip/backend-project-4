#!/usr/bin/env node

import { Command } from 'commander';
import pageLoader from '../src/index.js';

const program = new Command();

program
  .name('page-loader')
  .version('1.0.0')
  .description('Page loader utility')
  .argument('<url>', 'site url')
  .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir")')
  .action((url, options) => {
    const result = pageLoader(url, options.output);
    result.then((path) => console.log(`Page has been successfully downloaded. Path - ${path}`));
  });

program.parse();
