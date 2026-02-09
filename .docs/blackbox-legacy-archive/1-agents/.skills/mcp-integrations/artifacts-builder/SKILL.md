---
name: artifacts-builder
category: mcp
version: 1.0.0
description: Build complex Claude.ai HTML artifacts using React, Tailwind CSS, and shadcn/ui
author: anthropics/skills
verified: true
tags: [artifacts, react, ui, frontend]
---

# Artifacts Builder

## Overview
Create interactive Claude.ai HTML artifacts with modern React patterns, Tailwind CSS styling, and shadcn/ui components.

## When to Use This Skill
✅ Building interactive demos and prototypes
✅ Creating data visualizations
✅ Developing UI mockups
✅ Making reusable tool interfaces

## Artifact Structure

### Basic Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Artifact</title>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-gray-50">
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect } = React;

    function App() {
      const [data, setData] = useState([]);

      return (
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-4">My Artifact</h1>
          {/* Your content here */}
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>
```

## Common Patterns

### Interactive Data Table
```jsx
function DataTable({ data }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Name
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {sortedData.map((row, i) => (
          <tr key={i}>
            <td className="px-6 py-4 whitespace-nowrap">{row.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Chart Visualization
```jsx
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center">
          <div className="w-32 text-sm text-gray-600">{item.label}</div>
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <div className="w-16 text-right text-sm text-gray-600">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Form with Validation
```jsx
function ValidatedForm() {
  const [values, setValues] = useState({ email: '', name: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!values.email.includes('@')) newErrors.email = 'Invalid email';
    if (!values.name) newErrors.name = 'Name required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Submit logic
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        Submit
      </button>
    </form>
  );
}
```

## Tailwind CSS Tips
- Use `className` not `class`
- Responsive: `md:text-lg lg:text-xl`
- States: `hover:bg-blue-600 focus:ring-2`
- Dark mode: `dark:bg-gray-800 dark:text-white`

## Integration with Claude
When building artifacts, say:
- "Create an artifact that shows [data] in a table"
- "Build an interactive form for [purpose]"
- "Make a visualization of [data type]"

Claude will:
- Structure the HTML correctly
- Add React hooks for interactivity
- Style with Tailwind CSS
- Include proper state management
- Handle edge cases gracefully
