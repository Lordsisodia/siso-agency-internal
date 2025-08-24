/**
 * ESLint Configuration for Tab Safety
 * 
 * Add these rules to your main .eslintrc.js to catch tab routing issues
 */

module.exports = {
  rules: {
    // Catch switch statements without default cases
    'default-case': 'error',
    
    // Ensure switch statements handle all enum values
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    
    // Prevent unused variables (catches typos in case labels)
    '@typescript-eslint/no-unused-vars': 'error',
    
    // Prevent direct string literals for tab IDs (enforce using TabId type)
    'no-restricted-syntax': [
      'error',
      {
        'selector': "CallExpression[callee.name='setSearchParams'] Literal[value=/^(morning|light-work|work|wellness|timebox|checkout|ai-chat)$/]",
        'message': 'Use TabId type instead of string literals for tab routing'
      }
    ],
    
    // Custom rule to prevent common tab mistakes
    'no-restricted-globals': [
      'error',
      {
        'name': 'console.error',
        'message': 'Fix the tab routing error instead of suppressing it'
      }
    ]
  },
  
  // Override for tab-related files to be extra strict
  overrides: [
    {
      files: [
        '**/AdminLifeLock.tsx',
        '**/TabLayoutWrapper.tsx', 
        '**/tab-config.ts'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'error'
      }
    }
  ]
};