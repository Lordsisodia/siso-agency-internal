#!/usr/bin/env node

/**
 * Runtime Validator for AI-First Transformation
 * Identifies missing method implementations that cause runtime errors
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Runtime Validator - Checking for missing method implementations\n');

// List of consolidated service files to check
const serviceFiles = [
  '/Users/shaansisodia/DEV/SISO-INTERNAL/ai-first/core/auth.service.ts',
  '/Users/shaansisodia/DEV/SISO-INTERNAL/ai-first/core/data.service.ts',
  '/Users/shaansisodia/DEV/SISO-INTERNAL/ai-first/core/task.service.ts',
  '/Users/shaansisodia/DEV/SISO-INTERNAL/ai-first/core/ai.service.ts'
];

// Common patterns of method calls that might be missing
const methodPatterns = [
  /(\w+)\.(\w+)\(/g,
  /await\s+(\w+)\.(\w+)\(/g,
  /return\s+(\w+)\.(\w+)\(/g
];

// Track potential missing methods
const potentialMissing = new Map();

// Check source files that import from consolidated services
function checkSourceFiles() {
  const srcDir = '/Users/shaansisodia/DEV/SISO-INTERNAL/src';
  const files = getAllTsFiles(srcDir);
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check if file imports from ai-first services
      if (content.includes('@/ai-first/core/')) {
        methodPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const serviceName = match[1];
            const methodName = match[2];
            
            // Skip common JS methods and React hooks
            if (!['console', 'JSON', 'Object', 'Array', 'Date', 'use', 'set', 'get'].some(skip => serviceName.startsWith(skip))) {
              const key = `${serviceName}.${methodName}`;
              if (!potentialMissing.has(key)) {
                potentialMissing.set(key, []);
              }
              potentialMissing.get(key).push(file);
            }
          }
        });
      }
    } catch (error) {
      // Skip files we can't read
    }
  });
}

function getAllTsFiles(dir) {
  const files = [];
  
  function traverse(currentPath) {
    try {
      const entries = fs.readdirSync(currentPath);
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          traverse(fullPath);
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  traverse(dir);
  return files;
}

// Check service files for implemented methods
function getImplementedMethods() {
  const implemented = new Set();
  
  serviceFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Find method implementations
      const methodMatches = content.matchAll(/(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?{/g);
      for (const match of methodMatches) {
        implemented.add(match[1]);
      }
      
      // Find static method implementations
      const staticMatches = content.matchAll(/static\s+(?:async\s+)?(\w+)\s*\([^)]*\)/g);
      for (const match of staticMatches) {
        implemented.add(match[1]);
      }
    } catch (error) {
      console.warn(`⚠️  Could not read service file: ${file}`);
    }
  });
  
  return implemented;
}

// Main validation
checkSourceFiles();
const implementedMethods = getImplementedMethods();

console.log('📊 Analysis Results:\n');

// Filter and report likely missing methods
const likelyMissing = [];
potentialMissing.forEach((files, methodCall) => {
  const [serviceName, methodName] = methodCall.split('.');
  
  // Focus on service instances that are likely from our consolidated services
  const servicePatterns = ['personalTaskService', 'hybridTaskService', 'aiTaskAgent', 'ClerkUserSync', 'checkIsAdmin', 'safeSupabase'];
  
  if (servicePatterns.some(pattern => serviceName.includes(pattern))) {
    if (!implementedMethods.has(methodName)) {
      likelyMissing.push({
        call: methodCall,
        method: methodName,
        service: serviceName,
        files: files.slice(0, 3) // Show first 3 files
      });
    }
  }
});

if (likelyMissing.length > 0) {
  console.log('🔴 Likely Missing Method Implementations:');
  likelyMissing.forEach(item => {
    console.log(`   ${item.call}`);
    console.log(`   └─ Called in: ${item.files[0].replace('/Users/shaansisodia/DEV/SISO-INTERNAL/', '')}`);
  });
} else {
  console.log('✅ No obviously missing method implementations detected');
}

console.log(`\n📈 Summary:`);
console.log(`   • Checked ${Array.from(potentialMissing.keys()).length} method calls`);
console.log(`   • Found ${implementedMethods.size} implemented methods`);
console.log(`   • Identified ${likelyMissing.length} potentially missing methods`);

console.log('\n💡 Recommendation: Test the application and implement methods as runtime errors occur.');