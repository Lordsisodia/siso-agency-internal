#!/usr/bin/env node

/**
 * 🛡️ React Component Validation Script
 * Catches React dependency issues before runtime
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { glob } from 'glob';
import chalk from 'chalk';

const execAsync = promisify(exec);

console.log(chalk.blue('🔍 React Component Validation Starting...'));

async function validateReactComponents() {
  try {
    // 1. Find all React component files
    const componentFiles = await glob('src/**/*.{ts,tsx}', { 
      ignore: ['**/*.test.*', '**/*.spec.*', '**/__tests__/**']
    });
    
    console.log(chalk.cyan(`📋 Found ${componentFiles.length} React component files`));

    // 2. ESLint validation focusing on React hooks
    console.log(chalk.yellow('🔧 Running ESLint validation...'));
    
    try {
      const { stdout, stderr } = await execAsync(`npx eslint ${componentFiles.join(' ')} --format=compact`);
      
      if (stderr) {
        console.log(chalk.red('❌ ESLint Issues Found:'));
        console.log(stderr);
        return false;
      }
      
      console.log(chalk.green('✅ ESLint validation passed'));
      return true;
    } catch (error) {
      // ESLint returns exit code 1 when issues are found
      if (error.stdout) {
        console.log(chalk.red('❌ ESLint Issues Found:'));
        console.log(error.stdout);
      }
      return false;
    }

  } catch (error) {
    console.error(chalk.red('💥 Validation script failed:'), error.message);
    return false;
  }
}

// Run validation
validateReactComponents().then(success => {
  if (success) {
    console.log(chalk.green.bold('🎉 All React components validated successfully!'));
    process.exit(0);
  } else {
    console.log(chalk.red.bold('💥 React component validation failed!'));
    process.exit(1);
  }
});