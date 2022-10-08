#!/usr/bin/env node

import testFunc from '../src/index.js'
import { Command } from 'commander';

const program = new Command();

program
  .name('page-loader')
  .version('1.0.0')
  .description('Page loader utility')

program.parse();
