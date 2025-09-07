#!/usr/bin/env node

/**
 * 🔧 Smart Import Fixer
 * 
 * Automatically finds and fixes broken imports by locating components
 * in the actual ai-first structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

class SmartImportFixer {
  constructor() {
    this.componentMap = new Map();
    this.fixedFiles = [];
  }

  async buildComponentMap() {
    console.log('🗺️  Building component location map...');
    
    await this.walkDirectory(path.join(rootDir, 'ai-first'), (filePath) => {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        const fileName = path.basename(filePath, path.extname(filePath));
        const relativePath = path.relative(rootDir, filePath);
        
        // Store both with and without extensions
        this.componentMap.set(fileName, relativePath);
        this.componentMap.set(fileName + '.tsx', relativePath);
        this.componentMap.set(fileName + '.ts', relativePath);
      }
    });

    console.log(`   📊 Found ${this.componentMap.size} components in ai-first structure`);
  }

  async walkDirectory(dir, callback) {
    const files = await fs.promises.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.promises.stat(filePath);
      
      if (stat.isDirectory()) {
        await this.walkDirectory(filePath, callback);
      } else {
        await callback(filePath);
      }
    }
  }

  async fixAllImports() {
    console.log('🔧 SMART IMPORT FIXER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await this.buildComponentMap();
    
    console.log('\n🔍 Scanning and fixing broken imports...');
    
    let totalFiles = 0;
    let fixedCount = 0;

    await this.walkDirectory(path.join(rootDir, 'src'), async (filePath) => {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        totalFiles++;
        const wasFixed = await this.fixImportsInFile(filePath);
        if (wasFixed) {
          fixedCount++;
          this.fixedFiles.push(path.relative(rootDir, filePath));
        }
      }
    });

    console.log(`\n📊 Smart import fixing results:`);
    console.log(`   📁 Files scanned: ${totalFiles}`);
    console.log(`   ✅ Files fixed: ${fixedCount}`);
    
    if (this.fixedFiles.length > 0) {
      console.log(`\n📝 Fixed files:`);
      this.fixedFiles.slice(0, 10).forEach(file => {
        console.log(`   • ${file}`);
      });
      if (this.fixedFiles.length > 10) {
        console.log(`   ... and ${this.fixedFiles.length - 10} more files`);
      }
    }

    console.log('\n✅ Smart import fixing complete!');
    return fixedCount;
  }

  async fixImportsInFile(filePath) {
    try {
      let content = await fs.promises.readFile(filePath, 'utf8');
      let hasChanges = false;
      const originalContent = content;

      // Find all ai-first imports
      const importRegex = /import\s+{[^}]+}\s+from\s+['"]@\/ai-first\/[^'"]+['"]/g;
      const imports = content.match(importRegex) || [];

      for (const importStatement of imports) {
        const pathMatch = importStatement.match(/['"](@\/ai-first\/[^'"]+)['"]/);
        if (!pathMatch) continue;

        const importPath = pathMatch[1];
        const componentName = this.extractComponentName(importStatement);
        
        if (componentName && !this.pathExists(importPath)) {
          const correctPath = this.findCorrectPath(componentName);
          if (correctPath) {
            const newImportPath = '@/' + correctPath.replace('.tsx', '').replace('.ts', '');
            const newImportStatement = importStatement.replace(importPath, newImportPath);
            content = content.replace(importStatement, newImportStatement);
            hasChanges = true;
            
            console.log(`   🔧 Fixed: ${componentName} → ${newImportPath}`);
          }
        }
      }

      if (hasChanges && content !== originalContent) {
        await fs.promises.writeFile(filePath, content);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  extractComponentName(importStatement) {
    const match = importStatement.match(/import\s+{\s*([^}]+)\s*}/);
    if (!match) return null;
    
    // Take first component name (in case of multiple imports)
    return match[1].split(',')[0].trim();
  }

  pathExists(importPath) {
    // Convert @/ai-first/... to actual file path
    const actualPath = importPath.replace('@/ai-first/', 'ai-first/');
    const fullPath = path.join(rootDir, actualPath);
    
    return fs.existsSync(fullPath + '.tsx') || 
           fs.existsSync(fullPath + '.ts') || 
           fs.existsSync(fullPath);
  }

  findCorrectPath(componentName) {
    // Try exact matches first
    if (this.componentMap.has(componentName)) {
      return this.componentMap.get(componentName);
    }
    
    if (this.componentMap.has(componentName + '.tsx')) {
      return this.componentMap.get(componentName + '.tsx');
    }

    if (this.componentMap.has(componentName + '.ts')) {
      return this.componentMap.get(componentName + '.ts');
    }

    // Try case-insensitive search
    for (const [key, value] of this.componentMap) {
      if (key.toLowerCase() === componentName.toLowerCase()) {
        return value;
      }
    }

    return null;
  }
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fixer = new SmartImportFixer();
  fixer.fixAllImports().then(fixedCount => {
    process.exit(fixedCount > 0 ? 0 : 1);
  });
}

export { SmartImportFixer };