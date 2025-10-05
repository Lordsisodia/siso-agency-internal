# SISO UI System Implementation Guide

This guide demonstrates how to leverage the comprehensive UI documentation cache for building the SISO Internal application.

## 🎯 **UI Stack Overview**

Our documented UI libraries work together to create a powerful, accessible, and performant user interface:

```
┌─────────────────────────────────────────────────────────┐
│                    SISO UI STACK                        │
├─────────────────────────────────────────────────────────┤
│ 🎭 Framer Motion    → Animations & Interactions        │
│ 🎯 Lucide React     → Consistent Icon System           │
│ 🧩 Radix UI         → Accessible UI Primitives         │
│ 📝 React Hook Form  → High-Performance Forms           │
│ 🎨 shadcn/ui        → Styled Component System          │
│ 🎭 Tailwind CSS     → Utility-First Styling            │
└─────────────────────────────────────────────────────────┘
```

## 🚀 **Quick Implementation Examples**

### 1. **Animated Form with Validation**
```tsx
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    // Handle login
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-md mx-auto"
    >
      {/* Email Field */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          type="email"
          placeholder="Email"
          className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-red-500 text-sm mt-1 block"
          >
            {errors.email.message}
          </motion.span>
        )}
      </motion.div>

      {/* Password Field */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          {...register('password', { required: 'Password is required' })}
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3"
        >
          {showPassword ? 
            <EyeOff className="h-5 w-5 text-gray-400" /> : 
            <Eye className="h-5 w-5 text-gray-400" />
          }
        </button>
        {errors.password && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-red-500 text-sm mt-1 block"
          >
            {errors.password.message}
          </motion.span>
        )}
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </motion.button>
    </motion.form>
  )
}
```

### 2. **Accessible Dropdown Menu with Animation**
```tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { motion } from 'framer-motion'
import { MoreVertical, Edit, Copy, Trash, Share } from 'lucide-react'

const ActionsDropdown = ({ onEdit, onCopy, onDelete, onShare }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <MoreVertical size={16} />
        </motion.button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.1 }}
            className="bg-white rounded-lg shadow-lg border p-1 min-w-[160px]"
          >
            <DropdownMenu.Item asChild>
              <motion.button
                whileHover={{ backgroundColor: '#f3f4f6' }}
                onClick={onEdit}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded"
              >
                <Edit size={14} />
                Edit
              </motion.button>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <motion.button
                whileHover={{ backgroundColor: '#f3f4f6' }}
                onClick={onCopy}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded"
              >
                <Copy size={14} />
                Copy
              </motion.button>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <motion.button
                whileHover={{ backgroundColor: '#f3f4f6' }}
                onClick={onShare}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded"
              >
                <Share size={14} />
                Share
              </motion.button>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

            <DropdownMenu.Item asChild>
              <motion.button
                whileHover={{ backgroundColor: '#fef2f2' }}
                onClick={onDelete}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded"
              >
                <Trash size={14} />
                Delete
              </motion.button>
            </DropdownMenu.Item>
          </motion.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

### 3. **Dynamic Task Form with Field Arrays**
```tsx
import { useForm, useFieldArray } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Calendar, User, Tag } from 'lucide-react'

const TaskCreationForm = ({ onSubmit }) => {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      subtasks: [{ title: '', completed: false }],
      assignees: [],
      tags: [],
      dueDate: ''
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subtasks'
  })

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-2xl mx-auto p-6"
    >
      {/* Main Task Fields */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <input
          {...register('title', { required: 'Task title is required' })}
          placeholder="Task title"
          className="w-full text-xl font-semibold border-0 border-b-2 border-gray-200 focus:border-blue-500 pb-2 bg-transparent"
        />
        {errors.title && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm"
          >
            {errors.title.message}
          </motion.span>
        )}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <textarea
          {...register('description')}
          placeholder="Description"
          rows={3}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Dynamic Subtasks */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-medium">Subtasks</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => append({ title: '', completed: false })}
            className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
          >
            <Plus size={16} />
          </motion.button>
        </div>

        <AnimatePresence>
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mb-2"
            >
              <input
                {...register(`subtasks.${index}.title`, {
                  required: 'Subtask title is required'
                })}
                placeholder={`Subtask ${index + 1}`}
                className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                <X size={16} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Due Date */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2"
      >
        <Calendar size={20} className="text-gray-500" />
        <input
          {...register('dueDate')}
          type="date"
          className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
      >
        Create Task
      </motion.button>
    </motion.form>
  )
}
```

## 🎨 **SISO Component Library Architecture**

### 4. **Component Organization Structure**
```bash
/Users/shaansisodia/DEV/SISO-INTERNAL/src/
├── components/
│   ├── ui/                    # Basic UI primitives
│   │   ├── Button.tsx         # Radix + Framer Motion
│   │   ├── Input.tsx          # Hook Form compatible
│   │   ├── Dialog.tsx         # Radix Dialog + Motion
│   │   └── Dropdown.tsx       # Radix + Motion + Lucide
│   ├── forms/                 # Form components
│   │   ├── TaskForm.tsx       # Hook Form + Field Arrays
│   │   ├── SearchForm.tsx     # Real-time search
│   │   └── ProfileForm.tsx    # Multi-step wizard
│   ├── animations/            # Motion presets
│   │   ├── PageTransition.tsx
│   │   ├── ListAnimation.tsx
│   │   └── FormAnimation.tsx
│   └── compound/              # Complex components
│       ├── TaskBoard.tsx      # Drag & drop + animations
│       ├── DataTable.tsx      # Sortable + filterable
│       └── Dashboard.tsx      # Layout + widgets
```

### 5. **Theming System Integration**
```tsx
// theme/siso-theme.ts
export const sisoTheme = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a'
    },
    // ... more colors
  },
  animations: {
    fast: '150ms cubic-bezier(0.16, 1, 0.3, 1)',
    normal: '300ms cubic-bezier(0.16, 1, 0.3, 1)',
    slow: '500ms cubic-bezier(0.16, 1, 0.3, 1)'
  },
  components: {
    Button: {
      variants: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200'
      }
    }
  }
}

// Apply theme to components
const SISOButton = motion(styled.button<{ variant: keyof typeof sisoTheme.components.Button.variants }>`
  ${props => sisoTheme.components.Button.variants[props.variant]}
  transition: ${sisoTheme.animations.fast};
`)
```

## 🤖 **AI-Assisted Development Workflows**

### 6. **Context-Aware Component Generation**
```typescript
// Example Claude prompt using our UI docs:
/*
"Using our SISO UI documentation cache, create a task management interface that includes:
1. A searchable task list with Radix UI components
2. Smooth animations with Framer Motion
3. A form for creating/editing tasks using React Hook Form
4. Consistent icons from Lucide React
5. Proper accessibility and TypeScript support

The interface should follow our established patterns from:
- /ai-docs-cache/ui/radix-ui/README.md
- /ai-docs-cache/ui/framer-motion/README.md
- /ai-docs-cache/ui/react-hook-form/README.md
- /ai-docs-cache/ui/lucide-react/README.md"
*/
```

### 7. **Development Assistant Integration**
```bash
# Claude can now provide contextual help:
"How do I create a modal with form validation in our SISO stack?"
# → References Radix Dialog + React Hook Form docs

"Show me the best animation patterns for page transitions"
# → References Framer Motion documentation with SISO-specific examples

"What's the accessible way to build a dropdown menu?"
# → Combines Radix UI accessibility + Lucide icons + Motion animations
```

## 📚 **Documentation Integration Patterns**

### 8. **Component Documentation Generation**
```tsx
// Auto-generate component docs using our cached knowledge
/**
 * SISO Task Card Component
 * 
 * Combines:
 * - Radix UI primitives for accessibility
 * - Framer Motion for smooth interactions
 * - Lucide React icons for consistency
 * - React Hook Form for inline editing
 * 
 * @see /ai-docs-cache/ui/radix-ui/README.md#accessibility
 * @see /ai-docs-cache/ui/framer-motion/README.md#gestures
 */
const TaskCard = ({ task, onEdit, onComplete }) => {
  // Implementation using documented patterns
}
```

### 9. **Best Practices Integration**
```typescript
// Development guidelines derived from UI docs
export const SISOBestPractices = {
  // From Radix UI docs
  accessibility: {
    alwaysProvideLabels: true,
    useSemanticHTML: true,
    supportKeyboardNavigation: true
  },
  
  // From Framer Motion docs  
  animations: {
    preferTransformAndOpacity: true,
    useSpringPhysics: true,
    respectReducedMotion: true
  },
  
  // From React Hook Form docs
  forms: {
    useDefaultValues: true,
    preferRegisterOverController: true,
    implementSchemaValidation: true
  }
}
```

## 🔧 **Development Workflow Integration**

### 10. **VS Code Integration**
```json
// .vscode/snippets/siso-ui.json
{
  "SISO Animated Form": {
    "prefix": "siso-form",
    "body": [
      "const ${1:FormName} = () => {",
      "  const { register, handleSubmit, formState: { errors } } = useForm()",
      "  ",
      "  return (",
      "    <motion.form",
      "      initial={{ opacity: 0, y: 20 }}",
      "      animate={{ opacity: 1, y: 0 }}",
      "      onSubmit={handleSubmit(${2:onSubmit})}",
      "    >",
      "      ${3:// Form fields}",
      "    </motion.form>",
      "  )",
      "}"
    ],
    "description": "Create SISO-style animated form using documented patterns"
  }
}
```

## 🎯 **IMMEDIATE ACTIONABLE STEPS**

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create SISO Design System foundation using UI docs", "status": "completed"}, {"content": "Generate component examples combining all UI libraries", "status": "completed"}, {"content": "Create development workflow integration", "status": "completed"}, {"content": "Build AI-assisted component generator", "status": "in_progress"}]