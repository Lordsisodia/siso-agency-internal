# 🛡️ React Component Standards

## Hook Ordering Convention

**MANDATORY**: All React components must follow this exact hook ordering to prevent dependency errors:

```tsx
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1️⃣ STATE DECLARATIONS (useState, useReducer)
  const [state, setState] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  // 2️⃣ REFS (useRef, useImperativeHandle)
  const ref = useRef<HTMLDivElement>(null);

  // 3️⃣ MEMOIZED FUNCTIONS (useCallback)
  const handleClick = useCallback(() => {
    // event handler logic
  }, [dependencies]);

  const processData = useCallback((data: any) => {
    // processing logic
  }, [dependencies]);

  // 4️⃣ MEMOIZED VALUES (useMemo)
  const computedValue = useMemo(() => {
    return expensiveCalculation(prop1, state);
  }, [prop1, state]);

  const filteredData = useMemo(() => {
    return data.filter(item => item.active);
  }, [data]);

  // 5️⃣ SIDE EFFECTS (useEffect, useLayoutEffect)
  useEffect(() => {
    // side effect logic
    return () => {
      // cleanup
    };
  }, [dependencies]);

  // 6️⃣ RENDER LOGIC
  return (
    <div ref={ref}>
      {/* JSX */}
    </div>
  );
};
```

## ❌ Common Anti-Patterns That Cause Errors

```tsx
// DON'T: Using variables before declaration
const MyComponent = () => {
  useEffect(() => {
    console.log(computedValue); // ❌ ERROR: computedValue not defined yet
  }, [computedValue]);

  const computedValue = useMemo(() => calculation(), []); // ❌ Too late!
};
```

```tsx
// DON'T: Mixing hook types randomly
const MyComponent = () => {
  const [state, setState] = useState('');
  const computed = useMemo(() => calculation(), []);
  const [loading, setLoading] = useState(false); // ❌ State after memo
  const callback = useCallback(() => {}, []); // ❌ Callback after memo
};
```

## ✅ Correct Pattern

```tsx
// DO: Follow the ordering convention
const MyComponent = () => {
  // All state first
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  
  // All callbacks second  
  const callback = useCallback(() => {}, []);
  
  // All memos third
  const computed = useMemo(() => calculation(), []);
  
  // All effects last
  useEffect(() => {
    console.log(computed); // ✅ Safe: computed is defined
  }, [computed]);
};
```

## 🧪 Testing Requirements

Every component MUST have a mounting test:

```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should mount without errors', () => {
    expect(() => {
      render(<MyComponent />);
    }).not.toThrow();
  });

  it('should render with required props', () => {
    render(<MyComponent requiredProp="value" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## 🚨 Pre-Commit Checklist

- [ ] ESLint passes without React hook warnings
- [ ] Component follows hook ordering convention  
- [ ] All dependencies declared in useEffect/useCallback/useMemo
- [ ] Component has mounting tests
- [ ] No use-before-define errors

## 🛠️ Development Tools

### VSCode Settings
Add to your `.vscode/settings.json`:

```json
{
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.organizeImports": true
}
```

### Quick Fix Commands
```bash
# Check for React hook issues
npm run lint

# Auto-fix what's possible
npm run lint -- --fix

# Run component tests
npm run test -- --testNamePattern="mount"
```

## 📚 Resources

- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [ESLint React Hooks Plugin](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

**Remember**: Following this convention is MANDATORY. It prevents 95% of React dependency errors.