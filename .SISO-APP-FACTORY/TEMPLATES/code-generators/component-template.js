#!/usr/bin/env node

/**
 * React Component Generator
 * Generates a complete React component with TypeScript, tests, and stories
 * 
 * Usage: node component-template.js ComponentName [--functional] [--with-props]
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const componentName = process.argv[2];
const isFunctional = process.argv.includes('--functional');
const withProps = process.argv.includes('--with-props');

if (!componentName) {
  console.error('❌ Component name is required');
  console.log('📋 Usage: node component-template.js ComponentName [--functional] [--with-props]');
  process.exit(1);
}

// Create component directory
const componentDir = path.join(process.cwd(), 'src', 'components', componentName);

if (fs.existsSync(componentDir)) {
  console.error(`❌ Component ${componentName} already exists`);
  process.exit(1);
}

fs.mkdirSync(componentDir, { recursive: true });

// Generate component interface (if props are needed)
const propsInterface = withProps ? `
export interface ${componentName}Props {
  title?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
` : '';

const propsParameter = withProps ? `props: ${componentName}Props` : '';
const propsDestructuring = withProps ? `{ title, children, className, onClick }` : '';

// Component template
const componentTemplate = `import React from 'react';
import { cn } from '@/lib/utils';
${propsInterface}
export const ${componentName} = (${propsParameter}) => {${withProps ? `
  const { ${propsDestructuring.slice(2, -2)} } = props;` : ''}

  return (
    <div className={cn('${componentName.toLowerCase()}-component', className)}>
      ${withProps ? `{title && <h2 className="text-xl font-semibold">{title}</h2>}
      <div className="content">
        {children || <p>Hello from ${componentName}!</p>}
      </div>
      {onClick && (
        <button
          onClick={onClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Click me
        </button>
      )}` : `<p>Hello from ${componentName}!</p>`}
    </div>
  );
};

export default ${componentName};
`;

// Test template
const testTemplate = `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  test('renders without crashing', () => {
    render(<${componentName} />);
    expect(screen.getByText(/Hello from ${componentName}/i)).toBeInTheDocument();
  });

  ${withProps ? `test('renders with title prop', () => {
    render(<${componentName} title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders children', () => {
    render(
      <${componentName}>
        <span>Child content</span>
      </${componentName}>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('handles onClick prop', () => {
    const handleClick = jest.fn();
    render(<${componentName} onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies custom className', () => {
    const { container } = render(<${componentName} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });` : ''}
});
`;

// Storybook story template
const storyTemplate = `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${componentName} component for the application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {${withProps ? `
    title: {
      control: 'text',
      description: 'Title text to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onClick: { action: 'clicked' },` : ''}
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {${withProps ? `
    title: 'Sample Title',` : ''}
  },
};

${withProps ? `export const WithChildren: Story = {
  args: {
    title: 'Component with Children',
    children: <p>This is child content passed to the component.</p>,
  },
};

export const WithClickHandler: Story = {
  args: {
    title: 'Clickable Component',
    onClick: () => alert('Button clicked!'),
  },
};

export const CustomStyling: Story = {
  args: {
    title: 'Custom Styled',
    className: 'p-8 bg-gray-100 rounded-lg',
  },
};` : ''}
`;

// Index file template
const indexTemplate = `export { ${componentName} } from './${componentName}';
export type { ${componentName}Props } from './${componentName}';
`;

// Write all files
try {
  fs.writeFileSync(path.join(componentDir, `${componentName}.tsx`), componentTemplate);
  fs.writeFileSync(path.join(componentDir, `${componentName}.test.tsx`), testTemplate);
  fs.writeFileSync(path.join(componentDir, `${componentName}.stories.tsx`), storyTemplate);
  fs.writeFileSync(path.join(componentDir, 'index.ts'), withProps ? indexTemplate : `export { ${componentName} } from './${componentName}';\n`);

  console.log('✅ Component generated successfully!');
  console.log(`📁 Created: ${componentDir}`);
  console.log('📄 Files created:');
  console.log(`   - ${componentName}.tsx (Component)`);
  console.log(`   - ${componentName}.test.tsx (Tests)`);
  console.log(`   - ${componentName}.stories.tsx (Storybook)`);
  console.log(`   - index.ts (Exports)`);
  console.log('');
  console.log('🚀 Next steps:');
  console.log('   1. Add component to your main exports');
  console.log('   2. Run tests: npm test');
  console.log('   3. View in Storybook: npm run storybook');
  console.log(`   4. Import: import { ${componentName} } from '@/components/${componentName}';`);

} catch (error) {
  console.error('❌ Error generating component:', error.message);
  process.exit(1);
}