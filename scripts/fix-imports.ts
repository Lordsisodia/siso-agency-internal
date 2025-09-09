#!/usr/bin/env node

/**
 * SISO Import Standardization Script
 * 
 * Fixes the import chaos identified in code review:
 * - Standardizes @/ai-first/* to @/ecosystem/* or @/shared/*
 * - Consolidates inconsistent import patterns
 * - Maintains backwards compatibility during transition
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface ImportMapping {
  from: RegExp;
  to: string;
  description: string;
}

// Priority mapping rules - order matters!
const IMPORT_MAPPINGS: ImportMapping[] = [
  // Core services and data
  {
    from: /from '@\/ai-first\/core\/(.*?)'/g,
    to: "from '@/shared/lib/$1'",
    description: 'Core services to shared lib'
  },
  
  // Task-related components
  {
    from: /from '@\/ai-first\/features\/tasks\/(.*?)'/g,
    to: "from '@/ecosystem/internal/tasks/$1'",
    description: 'Task features to ecosystem'
  },
  
  // Dashboard components
  {
    from: /from '@\/ai-first\/features\/dashboard\/(.*?)'/g,
    to: "from '@/ecosystem/internal/dashboard/$1'",
    description: 'Dashboard features to ecosystem'
  },
  
  // Auth components
  {
    from: /from '@\/ai-first\/features\/auth\/(.*?)'/g,
    to: "from '@/shared/auth/$1'",
    description: 'Auth features to shared'
  },
  
  // Partnership components
  {
    from: /from '@\/ai-first\/features\/partnerships\/(.*?)'/g,
    to: "from '@/ecosystem/partnership/$1'",
    description: 'Partnership features to ecosystem'
  },
  
  // General features to shared
  {
    from: /from '@\/ai-first\/features\/(.*?)'/g,
    to: "from '@/shared/features/$1'",
    description: 'General features to shared'
  },
  
  // Services
  {
    from: /from '@\/ai-first\/services\/(.*?)'/g,
    to: "from '@/services/$1'",
    description: 'Services to root services'
  },
  
  // Shared types and utilities
  {
    from: /from '@\/ai-first\/shared\/(.*?)'/g,
    to: "from '@/shared/$1'",
    description: 'Shared items to shared'
  },
  
  // Internal shorthand fix
  {
    from: /from '@\/internal\/(.*?)'/g,
    to: "from '@/ecosystem/internal/$1'",
    description: 'Internal shorthand to full path'
  }
];

// Files that need import fixes based on our analysis
const TARGET_PATTERNS = [
  'src/**/*.tsx',
  'src/**/*.ts',
  '!src/**/*.d.ts',
  '!src/**/*.test.ts',
  '!src/**/*.test.tsx'
];

class ImportStandardizer {
  private filesProcessed = 0;
  private importsFixed = 0;
  private errors: string[] = [];

  async run() {
    console.log('🚀 SISO Import Standardization Started');
    console.log('=====================================');
    
    try {
      const files = await glob(TARGET_PATTERNS);
      console.log(`📁 Found ${files.length} files to process`);
      
      for (const file of files) {
        await this.processFile(file);
      }
      
      this.printSummary();
    } catch (error) {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    }
  }

  private async processFile(filePath: string) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let updatedContent = content;
      let fileChanges = 0;

      // Apply each mapping rule
      for (const mapping of IMPORT_MAPPINGS) {
        const matches = content.match(mapping.from);
        if (matches) {
          updatedContent = updatedContent.replace(mapping.from, mapping.to);
          fileChanges += matches.length;
        }
      }

      // Only write if changes were made
      if (fileChanges > 0) {
        fs.writeFileSync(filePath, updatedContent);
        console.log(`✅ ${filePath}: ${fileChanges} imports fixed`);
        this.importsFixed += fileChanges;
      }

      this.filesProcessed++;

    } catch (error) {
      const errorMsg = `❌ Error processing ${filePath}: ${error}`;
      console.error(errorMsg);
      this.errors.push(errorMsg);
    }
  }

  private printSummary() {
    console.log('\n📊 Import Standardization Complete');
    console.log('==================================');
    console.log(`Files processed: ${this.filesProcessed}`);
    console.log(`Imports fixed: ${this.importsFixed}`);
    console.log(`Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }
    
    if (this.importsFixed > 0) {
      console.log('\n✅ Next Steps:');
      console.log('1. Run: npm run typecheck');
      console.log('2. Fix any remaining compilation errors');
      console.log('3. Test critical functionality');
      console.log('4. Remove @/ai-first/* mappings from tsconfig.json when ready');
    }
  }
}

// Run the standardizer
if (require.main === module) {
  new ImportStandardizer().run().catch(console.error);
}

export { ImportStandardizer };