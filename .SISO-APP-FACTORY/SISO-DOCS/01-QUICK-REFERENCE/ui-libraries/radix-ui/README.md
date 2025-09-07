# Radix UI Primitives Documentation

This documentation contains comprehensive information about Radix UI Primitives - low-level UI components focused on accessibility, customization, and developer experience.

## Key Features

### 🎯 **Accessibility-First**
- Full WAI-ARIA compliance and design patterns
- Comprehensive keyboard navigation support
- Screen reader tested and optimized
- Focus management handled automatically

### 🎨 **Unstyled/Headless**
- Ships without styles - complete design control
- Compatible with any styling solution
- Build custom design systems on top
- Incremental adoption friendly

### 🔧 **Developer Experience**
- Granular component architecture
- TypeScript support out of the box
- Tree-shakeable individual components
- Consistent API across all primitives

## Installation

### Full Package (Tree-shakeable)
```bash
npm install @radix-ui/react-primitives
# or
npm install radix-ui
```

### Individual Primitives (Recommended)
```bash
# Install only what you need
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-accordion
npm install @radix-ui/react-tabs
```

## Core Concepts

### Component Architecture
Radix provides granular access to each component part for maximum flexibility:

```jsx
import * as Dialog from '@radix-ui/react-dialog';

const DialogDemo = () => (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      <button>Open Dialog</button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-overlay" />
      <Dialog.Content className="dialog-content">
        <Dialog.Title>Dialog Title</Dialog.Title>
        <Dialog.Description>
          Dialog description text
        </Dialog.Description>
        <Dialog.Close asChild>
          <button>Close</button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

### Controlled vs Uncontrolled
Components are uncontrolled by default but support controlled usage:

```jsx
// Uncontrolled (default)
<Dialog.Root>
  {/* Dialog manages its own state */}
</Dialog.Root>

// Controlled
const [open, setOpen] = useState(false);

<Dialog.Root open={open} onOpenChange={setOpen}>
  {/* You control the dialog state */}
</Dialog.Root>
```

## Popular Components

### 🗃️ **Dialog/Modal**
```jsx
import * as Dialog from '@radix-ui/react-dialog';

const MyDialog = () => (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      <button>Edit Profile</button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg">
        <Dialog.Title className="text-lg font-semibold">
          Edit Profile
        </Dialog.Title>
        <Dialog.Description className="mt-2 text-gray-600">
          Make changes to your profile here.
        </Dialog.Description>
        
        {/* Form content */}
        
        <div className="flex justify-end gap-2 mt-4">
          <Dialog.Close asChild>
            <button className="px-4 py-2 bg-gray-200 rounded">
              Cancel
            </button>
          </Dialog.Close>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Save
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

### 📋 **Dropdown Menu**
```jsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const MyDropdown = () => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button>Options</button>
    </DropdownMenu.Trigger>
    
    <DropdownMenu.Portal>
      <DropdownMenu.Content className="bg-white border rounded-lg shadow-lg p-2">
        <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100 rounded">
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item className="px-2 py-1 hover:bg-gray-100 rounded">
          Duplicate
        </DropdownMenu.Item>
        <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
        <DropdownMenu.Item className="px-2 py-1 hover:bg-red-100 text-red-600 rounded">
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);
```

### 📁 **Accordion**
```jsx
import * as Accordion from '@radix-ui/react-accordion';

const MyAccordion = () => (
  <Accordion.Root type="single" collapsible className="w-full">
    <Accordion.Item value="item-1" className="border-b">
      <Accordion.Header>
        <Accordion.Trigger className="flex w-full items-center justify-between py-4 font-medium">
          Is it accessible?
          <ChevronDownIcon className="h-4 w-4 transition-transform" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="pb-4 text-gray-600">
        Yes. It adheres to the WAI-ARIA design pattern.
      </Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>
);
```

### 📑 **Tabs**
```jsx
import * as Tabs from '@radix-ui/react-tabs';

const MyTabs = () => (
  <Tabs.Root defaultValue="account" className="w-full">
    <Tabs.List className="flex border-b">
      <Tabs.Trigger 
        value="account" 
        className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
      >
        Account
      </Tabs.Trigger>
      <Tabs.Trigger 
        value="settings" 
        className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-500"
      >
        Settings
      </Tabs.Trigger>
    </Tabs.List>
    
    <Tabs.Content value="account" className="p-4">
      Account content
    </Tabs.Content>
    <Tabs.Content value="settings" className="p-4">
      Settings content
    </Tabs.Content>
  </Tabs.Root>
);
```

## Advanced Features

### 🎨 **Styling with CSS-in-JS**
```jsx
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog';

const StyledOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const StyledContent = styled(Dialog.Content)`
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;
```

### 🎯 **Form Integration**
```jsx
import * as Form from '@radix-ui/react-form';

const ContactForm = () => (
  <Form.Root>
    <Form.Field name="email">
      <Form.Label>Email</Form.Label>
      <Form.Control type="email" required />
      <Form.Message match="valueMissing">
        Please enter your email
      </Form.Message>
      <Form.Message match="typeMismatch">
        Please provide a valid email
      </Form.Message>
    </Form.Field>
    
    <Form.Submit>Submit</Form.Submit>
  </Form.Root>
);
```

### 🎚️ **Slider Component**
```jsx
import * as Slider from '@radix-ui/react-slider';

const VolumeSlider = () => (
  <Slider.Root
    className="relative flex items-center select-none touch-none w-full h-5"
    defaultValue={[50]}
    max={100}
    step={1}
  >
    <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
      <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
    </Slider.Track>
    <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-blue-500 rounded-full" />
  </Slider.Root>
);
```

## Accessibility Features

### 🔍 **Built-in Accessibility**
- **Keyboard Navigation**: Full keyboard support with logical tab order
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Smart focus trapping and restoration
- **High Contrast**: Works with Windows High Contrast mode

### 🎯 **Accessibility Props**
```jsx
<Dialog.Content
  aria-describedby="dialog-description"
  aria-labelledby="dialog-title"
>
  <Dialog.Title id="dialog-title">
    Confirmation
  </Dialog.Title>
  <Dialog.Description id="dialog-description">
    This action cannot be undone.
  </Dialog.Description>
</Dialog.Content>
```

## Styling Integration

### 🎨 **Tailwind CSS**
```jsx
const StyledDialog = () => (
  <Dialog.Root>
    <Dialog.Trigger className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      Open Dialog
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg max-w-md w-full mx-4">
        {/* Content */}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

### 🎭 **CSS Modules**
```jsx
import styles from './Dialog.module.css';

<Dialog.Content className={styles.content}>
  <Dialog.Title className={styles.title}>
    Title
  </Dialog.Title>
</Dialog.Content>
```

```css
/* Dialog.module.css */
.content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 10px 38px -10px rgba(22, 23, 24, 0.35);
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
```

## Complete Component List

### 📋 **Navigation & Layout**
- Accordion
- Tabs  
- Navigation Menu
- Menubar
- Toolbar

### 🔘 **Inputs & Controls**
- Checkbox
- Radio Group
- Switch
- Slider
- Select
- Form

### 💭 **Overlays & Feedback**
- Dialog
- AlertDialog  
- Popover
- Tooltip
- Toast
- Progress

### 📝 **Data Display**
- Avatar
- Badge
- Separator
- AspectRatio
- ScrollArea

### 🎯 **Utility**
- Portal
- Slot
- Visually Hidden
- Direction Provider

## Best Practices

### 🏗️ **Component Composition**
```jsx
// Create reusable compound components
const MyCard = {
  Root: ({ children, ...props }) => (
    <div className="card" {...props}>
      {children}
    </div>
  ),
  Header: ({ children }) => (
    <div className="card-header">
      {children}
    </div>
  ),
  Content: ({ children }) => (
    <div className="card-content">
      {children}
    </div>
  )
};

// Usage
<MyCard.Root>
  <MyCard.Header>
    <h3>Card Title</h3>
  </MyCard.Header>
  <MyCard.Content>
    Card content here
  </MyCard.Content>
</MyCard.Root>
```

### ⚡ **Performance**
- Use individual component imports for better tree-shaking
- Leverage the `asChild` prop to avoid extra DOM nodes
- Consider using `Portal` for better performance with overlays

### 🎨 **Theming**
```jsx
// Create a theme context
const ThemeContext = createContext();

const StyledButton = ({ variant = 'primary', ...props }) => (
  <button 
    className={`btn btn-${variant}`}
    {...props}
  />
);

// Usage with Radix
<Dialog.Trigger asChild>
  <StyledButton variant="primary">
    Open Dialog
  </StyledButton>
</Dialog.Trigger>
```

## Migration & Integration

### 🔄 **From Other Libraries**
Radix primitives can be gradually adopted alongside existing UI libraries:

```jsx
// Mix with existing components
import { Button } from 'antd';
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Trigger asChild>
  <Button type="primary">Open Dialog</Button>
</Dialog.Trigger>
```

### 📦 **With Design Systems**
Build your design system on top of Radix primitives:

```jsx
// Your design system components
export const Dialog = {
  Root: Dialog.Root,
  Trigger: styled(Dialog.Trigger)`
    /* Your design system styles */
  `,
  Content: styled(Dialog.Content)`
    /* Your design system styles */
  `
};
```

## Community & Resources

- **Official Website**: https://www.radix-ui.com/primitives
- **GitHub Repository**: https://github.com/radix-ui/primitives  
- **Discord Community**: Join for questions and discussions
- **Documentation**: https://www.radix-ui.com/primitives/docs
- **Examples**: Comprehensive examples for every component

Last Updated: August 2025
Source: Official Radix UI Documentation + Web Research

## Industry Recognition

Radix UI is recognized as one of the top 3 headless UI libraries in 2025, praised for its comprehensive accessibility implementation, flexible architecture, and strong TypeScript support. It's widely adopted by leading companies for building robust, accessible design systems.