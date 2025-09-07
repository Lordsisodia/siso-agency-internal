#!/usr/bin/env node

/**
 * 🧪 AI-First Transformation Validator
 * 
 * Automated testing script to validate the entire AI-first transformation
 * Tests imports, file structure, TypeScript compilation, and more
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

class TransformationValidator {
  constructor() {
    this.results = {
      structureTests: [],
      importTests: [],
      compilationTests: [],
      functionalTests: [],
      errors: [],
      warnings: []
    };
  }

  async runAllTests() {
    console.log('🧪 AI-FIRST TRANSFORMATION VALIDATOR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      await this.testFileStructure();
      await this.testImportPaths();
      await this.testTypeScriptCompilation();
      await this.testViteConfiguration();
      await this.testCriticalComponents();
      
      this.generateReport();
      
      if (this.results.errors.length === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Transformation is working correctly.');
        return true;
      } else {
        console.log(`\n❌ ${this.results.errors.length} CRITICAL ERRORS FOUND`);
        return false;
      }
    } catch (error) {
      console.error('💥 Test runner failed:', error.message);
      return false;
    }
  }

  async testFileStructure() {
    console.log('\n📁 Testing AI-First File Structure...');
    
    const requiredPaths = [
      'ai-first/core/task.service.ts',
      'ai-first/core/ai.service.ts', 
      'ai-first/core/auth.service.ts',
      'ai-first/core/data.service.ts',
      'ai-first/features/auth/components',
      'ai-first/features/tasks/components',
      'ai-first/features/dashboard/components',
      'ai-first/features/claudia/components',
      'ai-first/features/partnerships/components',
      'ai-first/shared/types'
    ];

    for (const reqPath of requiredPaths) {
      const fullPath = path.join(rootDir, reqPath);
      if (fs.existsSync(fullPath)) {
        this.results.structureTests.push(`✅ ${reqPath}`);
      } else {
        this.results.errors.push(`❌ Missing: ${reqPath}`);
      }
    }

    console.log(`   📊 Structure validation: ${this.results.structureTests.length}/${requiredPaths.length} paths found`);
  }

  async testImportPaths() {
    console.log('\n🔗 Testing Import Path Resolution...');
    
    const criticalFiles = [
      'src/App.tsx',
      'src/pages/AdminLifeLock.tsx',
      'src/pages/AdminTasks.tsx',
      'src/components/admin/dashboard/QuickActions.tsx'
    ];

    for (const file of criticalFiles) {
      await this.checkFileImports(file);
    }

    console.log(`   📊 Import validation: ${this.results.importTests.length} files checked`);
  }

  async checkFileImports(filePath) {
    const fullPath = path.join(rootDir, filePath);
    if (!fs.existsSync(fullPath)) {
      this.results.warnings.push(`⚠️  File not found: ${filePath}`);
      return;
    }

    try {
      const content = await fs.promises.readFile(fullPath, 'utf8');
      const aiFirstImports = content.match(/@\/ai-first\/[^'"\s;]+/g) || [];
      
      for (const importPath of aiFirstImports) {
        const resolvedPath = importPath.replace('@/ai-first/', 'ai-first/');
        const fullResolvedPath = path.join(rootDir, resolvedPath);
        
        // Check if it's a directory (component folder) or file
        let exists = false;
        if (fs.existsSync(fullResolvedPath + '.ts')) {
          exists = true;
        } else if (fs.existsSync(fullResolvedPath + '.tsx')) {
          exists = true;
        } else if (fs.existsSync(fullResolvedPath)) {
          exists = true;
        }

        if (exists) {
          this.results.importTests.push(`✅ ${filePath}: ${importPath}`);
        } else {
          this.results.errors.push(`❌ Broken import in ${filePath}: ${importPath}`);
        }
      }
    } catch (error) {
      this.results.errors.push(`❌ Error reading ${filePath}: ${error.message}`);
    }
  }

  async testTypeScriptCompilation() {
    console.log('\n⚡ Testing TypeScript Compilation...');
    
    return new Promise((resolve) => {
      const tsc = spawn('npx', ['tsc', '--noEmit', '--skipLibCheck'], {
        cwd: rootDir,
        stdio: 'pipe'
      });

      let output = '';
      tsc.stdout.on('data', (data) => output += data.toString());
      tsc.stderr.on('data', (data) => output += data.toString());

      tsc.on('close', (code) => {
        if (code === 0) {
          this.results.compilationTests.push('✅ TypeScript compilation successful');
          console.log('   📊 TypeScript: ✅ PASSED');
        } else {
          this.results.errors.push('❌ TypeScript compilation failed');
          this.results.errors.push(`Compilation output: ${output}`);
          console.log('   📊 TypeScript: ❌ FAILED');
        }
        resolve();
      });
    });
  }

  async testViteConfiguration() {
    console.log('\n⚙️  Testing Vite Configuration...');
    
    const viteConfigPath = path.join(rootDir, 'vite.config.ts');
    if (!fs.existsSync(viteConfigPath)) {
      this.results.errors.push('❌ vite.config.ts not found');
      return;
    }

    try {
      const viteConfig = await fs.promises.readFile(viteConfigPath, 'utf8');
      
      if (viteConfig.includes('@/ai-first')) {
        this.results.structureTests.push('✅ Vite config has ai-first alias');
        console.log('   📊 Vite aliases: ✅ CONFIGURED');
      } else {
        this.results.errors.push('❌ Vite config missing ai-first alias');
        console.log('   📊 Vite aliases: ❌ MISSING');
      }
    } catch (error) {
      this.results.errors.push(`❌ Error reading vite.config.ts: ${error.message}`);
    }
  }

  async testCriticalComponents() {
    console.log('\n🔧 Testing Critical Component Accessibility...');
    
    const criticalComponents = [
      'ai-first/features/auth/components/ClerkAuthGuard.tsx',
      'ai-first/features/auth/components/AuthGuard.tsx',
      'ai-first/features/tasks/ui/MobileTodayCard.tsx',
      'ai-first/features/dashboard/ui/QuickActions.tsx'
    ];

    for (const component of criticalComponents) {
      const fullPath = path.join(rootDir, component);
      if (fs.existsSync(fullPath)) {
        try {
          const content = await fs.promises.readFile(fullPath, 'utf8');
          if (content.includes('export')) {
            this.results.functionalTests.push(`✅ ${component} exports correctly`);
          } else {
            this.results.warnings.push(`⚠️  ${component} may not export correctly`);
          }
        } catch (error) {
          this.results.errors.push(`❌ Error reading ${component}: ${error.message}`);
        }
      } else {
        this.results.errors.push(`❌ Critical component missing: ${component}`);
      }
    }

    console.log(`   📊 Component validation: ${this.results.functionalTests.length} components tested`);
  }

  generateReport() {
    console.log('\n📊 TRANSFORMATION VALIDATION REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log(`\n✅ PASSED TESTS: ${this.results.structureTests.length + this.results.importTests.length + this.results.compilationTests.length + this.results.functionalTests.length}`);
    
    if (this.results.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS: ${this.results.warnings.length}`);
      this.results.warnings.slice(0, 5).forEach(warning => console.log(`   ${warning}`));
      if (this.results.warnings.length > 5) {
        console.log(`   ... and ${this.results.warnings.length - 5} more warnings`);
      }
    }

    if (this.results.errors.length > 0) {
      console.log(`\n❌ ERRORS: ${this.results.errors.length}`);
      this.results.errors.slice(0, 10).forEach(error => console.log(`   ${error}`));
      if (this.results.errors.length > 10) {
        console.log(`   ... and ${this.results.errors.length - 10} more errors`);
      }
    }

    console.log('\n🔧 RECOMMENDED ACTIONS:');
    if (this.results.errors.length === 0) {
      console.log('   🎉 No actions needed - transformation is working!');
      console.log('   💡 Try running: npm run dev');
    } else {
      console.log('   🛠️  Fix the critical errors above');
      console.log('   🔄 Run this validator again after fixes');
    }
  }
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new TransformationValidator();
  validator.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { TransformationValidator };