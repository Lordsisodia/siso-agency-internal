# React Hook Form: Comprehensive Guide for 2025

This documentation contains comprehensive information about React Hook Form - a performant, flexible forms library for React.

## Key Features

### ⚡ **Performance Optimized**
- Minimal re-renders through uncontrolled components
- Built-in form state subscription model
- Only 8.6KB minified and gzipped
- Zero dependencies

### 🎯 **Developer Experience**
- Intuitive API with minimal learning curve
- Built-in validation with HTML5 support
- Easy integration with UI libraries
- Excellent TypeScript support

### 🔧 **Flexible & Powerful**
- Schema validation support (Yup, Zod, Joi)
- Custom validation functions
- Dynamic form fields with useFieldArray
- Form wizard and multi-step form support

## Installation

### Basic Installation
```bash
npm install react-hook-form
# or
yarn add react-hook-form
# or
pnpm add react-hook-form
```

### Additional Packages
```bash
# For schema validation
npm install @hookform/resolvers yup zod joi

# For DevTools (development only)
npm install @hookform/devtools --save-dev
```

## Basic Usage

### Simple Form Setup
```tsx
import { useForm } from "react-hook-form"

type FormData = {
  firstName: string
  lastName: string
  email: string
}

export default function BasicForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>()

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} placeholder="First Name" />
      
      <input 
        {...register("lastName", { required: "Last name is required" })} 
        placeholder="Last Name" 
      />
      {errors.lastName && <span>{errors.lastName.message}</span>}
      
      <input 
        type="email" 
        {...register("email")} 
        placeholder="Email" 
      />
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Core API Methods

### useForm Hook Configuration
```tsx
const form = useForm<FormData>({
  // Validation mode - when to trigger validation
  mode: 'onChange', // 'onSubmit' | 'onBlur' | 'onTouched' | 'onChange' | 'all'
  
  // Re-validation mode after first submission
  reValidateMode: 'onChange', // 'onChange' | 'onBlur' | 'onSubmit'
  
  // Default form values
  defaultValues: {
    firstName: '',
    lastName: '',
    email: ''
  },
  
  // Schema validation resolver
  resolver: yupResolver(validationSchema),
  
  // Focus first error field on submission failure
  shouldFocusError: true,
  
  // Use browser native validation
  shouldUseNativeValidation: false,
  
  // Unregister fields when unmounted
  shouldUnregister: false,
  
  // Disable entire form
  disabled: false,
  
  // Delay error display (ms)
  delayError: 0,
  
  // Validation criteria mode
  criteriaMode: 'firstError' // 'firstError' | 'all'
})
```

### register Method with Validation
```tsx
// Basic registration
<input {...register("fieldName")} />

// With validation rules
<input {...register("email", {
  required: "Email is required",
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: "Invalid email address"
  },
  minLength: {
    value: 5,
    message: "Minimum 5 characters"
  },
  maxLength: {
    value: 50,
    message: "Maximum 50 characters"
  },
  validate: {
    notAdmin: value => value !== 'admin' || 'Username admin is not allowed',
    checkEmailAvailability: async (value) => {
      const isAvailable = await checkEmail(value)
      return isAvailable || 'Email already exists'
    }
  }
})} />
```

### handleSubmit with Error Handling
```tsx
const onSubmit = (data: FormData) => {
  console.log('Valid data:', data)
}

const onError = (errors: FieldErrors<FormData>) => {
  console.log('Validation errors:', errors)
}

// Basic usage
<form onSubmit={handleSubmit(onSubmit)}>

// With error handler
<form onSubmit={handleSubmit(onSubmit, onError)}>

// Async submission
const onSubmitAsync = async (data: FormData) => {
  try {
    await submitToAPI(data)
    console.log('Success!')
  } catch (error) {
    console.error('Submission failed:', error)
  }
}
```

## Validation Strategies

### Built-in HTML Validation
```tsx
<input {...register("username", {
  required: "Username is required",
  minLength: { value: 3, message: "Minimum 3 characters" },
  maxLength: { value: 20, message: "Maximum 20 characters" },
  pattern: {
    value: /^[A-Za-z0-9_]+$/,
    message: "Only letters, numbers, and underscores allowed"
  }
})} />

<input type="number" {...register("age", {
  required: "Age is required",
  min: { value: 18, message: "Must be at least 18" },
  max: { value: 120, message: "Must be less than 120" },
  valueAsNumber: true
})} />
```

### Custom Validation Functions
```tsx
<input {...register("password", {
  required: "Password is required",
  validate: {
    minLength: value => 
      value.length >= 8 || "Password must be at least 8 characters",
    hasUpperCase: value => 
      /[A-Z]/.test(value) || "Password must contain uppercase letter",
    hasLowerCase: value => 
      /[a-z]/.test(value) || "Password must contain lowercase letter",
    hasNumber: value => 
      /\d/.test(value) || "Password must contain number",
    hasSpecialChar: value => 
      /[!@#$%^&*(),.?":{}|<>]/.test(value) || "Password must contain special character"
  }
})} />

// Async validation
<input {...register("email", {
  validate: {
    checkAvailability: async (value) => {
      if (!value) return true
      const response = await fetch(`/api/check-email/${value}`)
      const isAvailable = await response.json()
      return isAvailable || "Email is already taken"
    }
  }
})} />
```

### Schema Validation with Zod
```tsx
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  firstName: z.string()
    .min(2, 'Minimum 2 characters')
    .max(50, 'Maximum 50 characters'),
  lastName: z.string()
    .min(2, 'Minimum 2 characters')
    .max(50, 'Maximum 50 characters'),
  email: z.string()
    .email('Invalid email format'),
  age: z.number()
    .min(18, 'Must be at least 18')
    .max(120, 'Must be less than 120'),
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/\d/, 'Must contain number')
})

const form = useForm<FormData>({
  resolver: zodResolver(schema)
})
```

## Performance Optimization

### useWatch for Selective Re-renders
```tsx
import { useWatch } from 'react-hook-form'

// Watch single field
function WatchedComponent({ control }: { control: Control<FormData> }) {
  const firstName = useWatch({
    control,
    name: 'firstName',
    defaultValue: ''
  })
  
  return <div>Hello, {firstName}!</div>
}

// Watch multiple fields
function MultipleWatchComponent({ control }: { control: Control<FormData> }) {
  const [firstName, lastName] = useWatch({
    control,
    name: ['firstName', 'lastName'],
    defaultValue: ['', '']
  })
  
  return <div>Full name: {firstName} {lastName}</div>
}
```

### Optimized Form State Usage
```tsx
import { useFormState } from 'react-hook-form'

function OptimizedComponent({ control }: { control: Control<FormData> }) {
  // ✅ Destructure only what you need for better performance
  const { errors } = useFormState({ 
    control,
    name: 'firstName' // Only subscribe to firstName errors
  })
  
  return <span>{errors.firstName?.message}</span>
}
```

### Performance Best Practices
```tsx
// Use defaultValues to prevent unnecessary re-renders
const form = useForm({
  defaultValues: {
    firstName: '',
    lastName: '',
    email: ''
  }
})

// Prefer register over Controller when possible
<input {...register('firstName')} />

// Use Controller only for complex custom components
<Controller
  name="customField"
  control={control}
  render={({ field }) => <CustomComponent {...field} />}
/>

// Define rules outside render to avoid creating new objects
const fieldRules = { required: true }
<Controller
  name="field"
  control={control}
  rules={fieldRules}
  render={({ field }) => <input {...field} />}
/>
```

## Advanced Features

### useFieldArray for Dynamic Fields
```tsx
import { useFieldArray } from 'react-hook-form'

type FormData = {
  users: Array<{
    firstName: string
    lastName: string
    email: string
  }>
}

function DynamicForm() {
  const { control, handleSubmit, register } = useForm<FormData>({
    defaultValues: {
      users: [{ firstName: '', lastName: '', email: '' }]
    }
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'users',
    rules: {
      minLength: { value: 1, message: 'At least one user required' },
      maxLength: { value: 5, message: 'Maximum 5 users allowed' }
    }
  })

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {fields.map((field, index) => (
        <div key={field.id} className="user-row">
          <input
            {...register(`users.${index}.firstName` as const, {
              required: 'First name required'
            })}
            placeholder="First Name"
          />
          <input
            {...register(`users.${index}.lastName` as const, {
              required: 'Last name required'
            })}
            placeholder="Last Name"
          />
          <input
            {...register(`users.${index}.email` as const, {
              required: 'Email required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email'
              }
            })}
            placeholder="Email"
          />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => append({ firstName: '', lastName: '', email: '' })}
      >
        Add User
      </button>
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Multi-Step Form Wizard
```tsx
import { useState } from 'react'

function FormWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<Partial<WizardData>>({})

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid },
    trigger,
    getValues 
  } = useForm({
    mode: 'onChange'
  })

  const nextStep = async () => {
    const isStepValid = await trigger()
    if (isStepValid) {
      const stepData = getValues()
      setWizardData(prev => ({
        ...prev,
        [`step${currentStep}`]: stepData
      }))
      setCurrentStep(prev => prev + 1)
    }
  }

  const onSubmit = (data: any) => {
    const finalData = {
      ...wizardData,
      [`step${currentStep}`]: data
    }
    console.log('Final form data:', finalData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>Step {currentStep} of 3</div>
      
      {/* Render current step */}
      {renderStep()}
      
      <div>
        {currentStep > 1 && (
          <button type="button" onClick={() => setCurrentStep(prev => prev - 1)}>
            Previous
          </button>
        )}
        
        {currentStep < 3 ? (
          <button type="button" onClick={nextStep} disabled={!isValid}>
            Next
          </button>
        ) : (
          <button type="submit">Submit</button>
        )}
      </div>
    </form>
  )
}
```

## TypeScript Integration

### Basic TypeScript Setup
```tsx
import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form'

interface FormData {
  firstName: string
  lastName: string
  email: string
  age: number
  isSubscribed: boolean
  preferences: {
    theme: 'light' | 'dark'
    language: string
  }
}

function TypedForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: 0,
      isSubscribed: false,
      preferences: {
        theme: 'light',
        language: 'en'
      }
    }
  })

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log(data) // data is properly typed
  }

  const onError = (errors: FieldErrors<FormData>) => {
    console.error(errors) // errors are properly typed
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <input {...register('firstName')} />
      <input {...register('email')} />
      <input type="number" {...register('age', { valueAsNumber: true })} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Schema Integration with TypeScript
```tsx
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Define schema first
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older'),
  role: z.enum(['user', 'admin', 'moderator'])
})

// Infer TypeScript type from schema
type UserFormData = z.infer<typeof userSchema>

function SchemaForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema)
  })

  const onSubmit = (data: UserFormData) => {
    // data is properly typed and validated
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="number" {...register('age', { valueAsNumber: true })} />
      {errors.age && <span>{errors.age.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

## UI Library Integration

### Material-UI Integration
```tsx
import { TextField, Button, Select, MenuItem } from '@mui/material'
import { Controller } from 'react-hook-form'

function MaterialUIForm() {
  const { control, handleSubmit } = useForm<FormData>()

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <Controller
        name="firstName"
        control={control}
        rules={{ required: 'First name is required' }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="First Name"
            error={!!error}
            helperText={error?.message}
            fullWidth
            margin="normal"
          />
        )}
      />

      <Controller
        name="country"
        control={control}
        rules={{ required: 'Please select a country' }}
        render={({ field, fieldState: { error } }) => (
          <Select {...field} error={!!error} fullWidth>
            <MenuItem value="US">United States</MenuItem>
            <MenuItem value="CA">Canada</MenuItem>
            <MenuItem value="UK">United Kingdom</MenuItem>
          </Select>
        )}
      />

      <Button type="submit" variant="contained">Submit</Button>
    </form>
  )
}
```

### Ant Design Integration
```tsx
import { Input, Button, Select, Form } from 'antd'
import { Controller } from 'react-hook-form'

function AntDesignForm() {
  const { control, handleSubmit, formState: { errors } } = useForm()

  return (
    <Form onFinish={handleSubmit(console.log)} layout="vertical">
      <Form.Item 
        label="Username" 
        validateStatus={errors.username ? 'error' : ''}
        help={errors.username?.message}
      >
        <Controller
          name="username"
          control={control}
          rules={{ required: 'Username is required' }}
          render={({ field }) => <Input {...field} />}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">Submit</Button>
      </Form.Item>
    </Form>
  )
}
```

## DevTools and Debugging

### React Hook Form DevTools
```tsx
import { DevTool } from "@hookform/devtools"

function MyForm() {
  const { register, control, handleSubmit } = useForm()

  return (
    <>
      <form onSubmit={handleSubmit(console.log)}>
        <input {...register("firstName")} />
        <input {...register("lastName")} />
        <button type="submit">Submit</button>
      </form>
      
      {/* DevTool component - only shows in development */}
      <DevTool control={control} />
    </>
  )
}
```

### Custom Debug Component
```tsx
import { useWatch } from 'react-hook-form'

function FormDebugger({ control }: { control: Control }) {
  const formData = useWatch({ control })

  if (process.env.NODE_ENV === 'production') return null

  return (
    <details style={{ marginTop: '1rem' }}>
      <summary>Debug Info</summary>
      <pre style={{ background: '#f5f5f5', padding: '1rem', fontSize: '12px' }}>
        {JSON.stringify(formData, null, 2)}
      </pre>
    </details>
  )
}
```

## Best Practices for 2025

### Performance
1. **Use `defaultValues`**: Always provide default values to prevent unnecessary re-renders
2. **Prefer `register` over `Controller`**: Use `Controller` only when necessary
3. **Use `useWatch` selectively**: Only watch specific fields instead of the entire form
4. **Destructure `formState` wisely**: Only destructure properties you need

### Validation
1. **Schema validation for complex forms**: Use Yup or Zod for complex validation logic
2. **Async validation**: Implement debounced async validation for better UX
3. **Custom validation messages**: Provide clear, user-friendly error messages
4. **Field-level validation**: Use appropriate validation modes

### Code Organization
```tsx
// utils/validationRules.ts
export const validationRules = {
  required: (fieldName: string) => `${fieldName} is required`,
  email: 'Please enter a valid email address',
  minLength: (length: number) => `Minimum ${length} characters required`,
}

export const patterns = {
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  phone: /^\+?[\d\s-()]+$/,
  url: /^https?:\/\/.+/,
}
```

### Error Handling
```tsx
function FormWithErrorHandling() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm()

  const onSubmit = async (data: FormData) => {
    try {
      setSubmitError(null)
      clearErrors()
      
      const response = await submitForm(data)
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle field-specific errors from server
        if (errorData.fieldErrors) {
          Object.entries(errorData.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof FormData, {
              type: 'server',
              message: message as string
            })
          })
        }
        
        // Handle general errors
        if (errorData.message) {
          setSubmitError(errorData.message)
        }
        
        return
      }
      
      console.log('Form submitted successfully')
      
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      {submitError && (
        <div className="error-alert">{submitError}</div>
      )}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

### Accessibility
```tsx
function AccessibleForm() {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(console.log)} noValidate>
      <fieldset>
        <legend>Personal Information</legend>
        
        <div className="form-group">
          <label htmlFor="firstName">First Name *</label>
          <input
            id="firstName"
            {...register('firstName', { required: 'First name is required' })}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          {errors.firstName && (
            <span id="firstName-error" role="alert" className="error">
              {errors.firstName.message}
            </span>
          )}
        </div>
      </fieldset>
      
      <button type="submit">Submit Form</button>
    </form>
  )
}
```

## React Hook Form vs React 19 (2025)

React 19 introduces built-in form handling, but React Hook Form continues to offer advantages:

- **Superior performance** through uncontrolled components
- **Advanced validation** with schema support
- **Rich ecosystem** of integrations and extensions
- **Battle-tested** in production environments
- **TypeScript excellence** with comprehensive type safety

React Hook Form remains the go-to choice for complex, high-performance forms in 2025.

## Resources

- **Official Website**: https://react-hook-form.com/
- **GitHub Repository**: https://github.com/react-hook-form/react-hook-form
- **DevTools**: https://github.com/react-hook-form/devtools
- **Examples**: https://github.com/react-hook-form/react-hook-form/tree/master/examples
- **Discord Community**: Active community for support and discussions

Last Updated: August 2025
Source: Comprehensive research + Official documentation

React Hook Form continues to be the premier choice for React applications requiring high-performance, flexible form handling with excellent developer experience in 2025.