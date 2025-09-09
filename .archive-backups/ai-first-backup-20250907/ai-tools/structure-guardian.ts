/**
 * 🛡️ Structure Guardian - Prevents Future Chaos
 */

export class StructureGuardian {
  validateFileLocation(filePath: string): boolean {
    // Validate files are in correct locations
    const rules = {
      services: /\/core\/.*\.service\.ts$/,
      components: /\/features\/.*\.component\.tsx$/,
      types: /\/(shared|features)\/.*\.types\.ts$/,
      hooks: /\/(shared|features)\/.*\.hooks\.ts$/,
      utils: /\/shared\/utils\/.*\.utils\.ts$/
    };

    // Check if file follows naming conventions
    for (const [type, pattern] of Object.entries(rules)) {
      if (filePath.includes(type) && !pattern.test(filePath)) {
        return false;
      }
    }

    return true;
  }

  validateAIInterface(fileContent: string): boolean {
    // Ensure AI_INTERFACE is present
    return fileContent.includes('AI_INTERFACE');
  }

  validateImportPaths(fileContent: string): boolean {
    // Ensure absolute imports are used
    const relativeImports = /import.*from\s+['"]\.\./g;
    return !relativeImports.test(fileContent);
  }
}

export const structureGuardian = new StructureGuardian();

// Pre-commit hook integration
export function preCommitCheck(files: string[]): boolean {
  return files.every(file => {
    const content = require('fs').readFileSync(file, 'utf8');
    return (
      structureGuardian.validateFileLocation(file) &&
      structureGuardian.validateAIInterface(content) &&
      structureGuardian.validateImportPaths(content)
    );
  });
}
