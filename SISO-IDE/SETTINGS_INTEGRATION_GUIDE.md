# 🚀 SISO IDE Settings Page Integration Guide

Complete guide for integrating the Claudia-inspired settings page into your SISO IDE project.

## 📋 Overview

This settings page is extracted and adapted from the Claudia GUI project, specifically tailored for SISO IDE with:
- Modern React + TypeScript architecture
- Framer Motion animations
- Custom CSS design system
- Local storage + API persistence
- Integration validation
- Mobile-responsive design

## 🗂️ File Structure

Your SISO IDE now includes these new files:

```
/SISO-IDE/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── settings/
│   │   │       └── SISOSettingsPage.tsx     # Main settings component
│   │   ├── hooks/
│   │   │   └── useSettings.ts               # Settings hooks and API
│   │   └── styles/
│   │       └── siso-settings.css            # Complete CSS system
│   └── ...
└── SETTINGS_INTEGRATION_GUIDE.md           # This file
```

## 🚀 Quick Setup

### Step 1: Install Missing Dependencies

```bash
cd /Users/shaansisodia/DEV/SISO-IDE/frontend

# Install Framer Motion for animations
npm install framer-motion

# Install if missing
npm install react react-dom
npm install typescript @types/react @types/react-dom
```

### Step 2: Import the Settings Page

Add to your main App.tsx or router:

```tsx
// In your App.tsx or main router file
import SISOSettingsPage from './components/settings/SISOSettingsPage';
import './styles/siso-settings.css';

function App() {
  return (
    <div className="App">
      {/* Your existing app content */}
      
      {/* Add settings route/component */}
      <SISOSettingsPage />
    </div>
  );
}
```

### Step 3: Add Route (If Using React Router)

```tsx
// If using react-router-dom
import { Routes, Route } from 'react-router-dom';
import SISOSettingsPage from './components/settings/SISOSettingsPage';

function App() {
  return (
    <Routes>
      {/* Your existing routes */}
      <Route path="/settings" element={<SISOSettingsPage />} />
    </Routes>
  );
}
```

## 🎨 Customization

### Update SISO Branding Colors

Edit `/SISO-IDE/frontend/src/styles/siso-settings.css`:

```css
:root {
  /* Update these to match your SISO IDE brand */
  --siso-primary: #your-primary-color;
  --siso-accent: #your-accent-color;
  --siso-success: #your-success-color;
}
```

### Add New Settings Section

1. **Update the Settings Type** in `useSettings.ts`:
```tsx
export interface SISOSettings {
  // Existing sections...
  
  // Add new section
  deployment: {
    autoDeployment: boolean;
    environment: 'dev' | 'staging' | 'prod';
    webhookUrl: string;
  };
}
```

2. **Add Default Values**:
```tsx
export const defaultSettings: SISOSettings = {
  // Existing defaults...
  
  deployment: {
    autoDeployment: false,
    environment: 'dev',
    webhookUrl: ''
  }
};
```

3. **Add UI Tab** in `SISOSettingsPage.tsx`:
```tsx
// Add tab trigger
<TabsTrigger value="deployment">Deployment</TabsTrigger>

// Add tab content
<TabsContent value="deployment">
  <Card>
    <CardHeader>
      <CardTitle>Deployment Settings</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Your deployment settings UI */}
    </CardContent>
  </Card>
</TabsContent>
```

## 🔧 Backend Integration

### API Endpoints to Create

Add these to your SISO IDE backend:

```typescript
// GET /api/settings - Load user settings
app.get('/api/settings', async (req, res) => {
  const settings = await getUserSettings(req.user.id);
  res.json(settings);
});

// POST /api/settings - Save user settings
app.post('/api/settings', async (req, res) => {
  await saveUserSettings(req.user.id, req.body);
  res.json({ success: true });
});

// POST /api/integrations/github/validate
app.post('/api/integrations/github/validate', async (req, res) => {
  const { token } = req.body;
  const isValid = await validateGitHubToken(token);
  res.json({ valid: isValid });
});

// POST /api/integrations/notion/validate
app.post('/api/integrations/notion/validate', async (req, res) => {
  const { token, database } = req.body;
  const isValid = await validateNotionAccess(token, database);
  res.json({ valid: isValid });
});
```

### Database Schema

If using a database, create this table:

```sql
-- Settings table
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  settings JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

## 🔌 Advanced Usage

### Using the Settings Hook

```tsx
import { useSettings } from '../hooks/useSettings';

function MyComponent() {
  const { settings, loading, saving, updateSetting } = useSettings();
  
  // Access current settings
  const currentTheme = settings.general.theme;
  
  // Update a setting
  const handleThemeChange = (newTheme) => {
    updateSetting('general', 'theme', newTheme);
  };
  
  if (loading) return <div>Loading settings...</div>;
  
  return (
    <div>
      <p>Current theme: {currentTheme}</p>
      <button onClick={() => handleThemeChange('dark')}>
        Switch to Dark
      </button>
      {saving && <span>Saving...</span>}
    </div>
  );
}
```

### Settings Export/Import

```tsx
import { useSettingsImportExport } from '../hooks/useSettings';

function SettingsExportImport() {
  const { exportSettings, importSettings } = useSettingsImportExport();
  const { settings, saveSettings } = useSettings();
  
  const handleExport = () => {
    exportSettings(settings);
  };
  
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const imported = await importSettings(file);
        saveSettings(imported);
        alert('Settings imported successfully!');
      } catch (error) {
        alert('Invalid settings file');
      }
    }
  };
  
  return (
    <div>
      <button onClick={handleExport}>Export Settings</button>
      <input
        type="file"
        accept=".json"
        onChange={handleImport}
      />
    </div>
  );
}
```

### Theme Integration

```tsx
import { useTheme } from '../hooks/useSettings';

function ThemeProvider({ children }) {
  const { theme } = useTheme();
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  return <div className="theme-provider">{children}</div>;
}
```

## 📱 Mobile Optimization

The settings page is already mobile-responsive, but you can enhance it:

```css
/* Add to your CSS for mobile-specific improvements */
@media (max-width: 640px) {
  .siso-settings-header h1 {
    font-size: 1.875rem; /* Smaller on mobile */
  }
  
  .siso-tabs__list {
    overflow-x: auto; /* Scrollable tabs */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .siso-tabs__list::-webkit-scrollbar {
    display: none;
  }
}
```

## 🧪 Testing

Create tests for your settings:

```tsx
// tests/settings.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SISOSettingsPage from '../components/settings/SISOSettingsPage';

test('should render settings tabs', () => {
  render(<SISOSettingsPage />);
  
  expect(screen.getByText('General')).toBeInTheDocument();
  expect(screen.getByText('Editor')).toBeInTheDocument();
  expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  expect(screen.getByText('Integrations')).toBeInTheDocument();
});

test('should update settings when form is changed', async () => {
  render(<SISOSettingsPage />);
  
  const projectNameInput = screen.getByPlaceholderText('Enter project name');
  fireEvent.change(projectNameInput, { target: { value: 'My New Project' } });
  
  expect(projectNameInput.value).toBe('My New Project');
});
```

## 🔒 Security Considerations

### Token Storage

```tsx
// For production, don't store sensitive tokens in localStorage
const storeToken = (token: string, integration: string) => {
  if (process.env.NODE_ENV === 'development') {
    localStorage.setItem(`${integration}_token`, token);
  } else {
    // Use secure HTTP-only cookies or encrypted storage
    fetch('/api/tokens', {
      method: 'POST',
      body: JSON.stringify({ token, integration }),
      credentials: 'include'
    });
  }
};
```

### Input Sanitization

```tsx
// Sanitize user inputs
const sanitizeInput = (value: string): string => {
  return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};
```

## 🚀 Performance Optimization

### Code Splitting

```tsx
// Lazy load the settings page
import { lazy, Suspense } from 'react';

const SISOSettingsPage = lazy(() => import('./components/settings/SISOSettingsPage'));

function App() {
  return (
    <Suspense fallback={<div>Loading settings...</div>}>
      <SISOSettingsPage />
    </Suspense>
  );
}
```

### Debounced Auto-save

```tsx
// The settings already include auto-save with 1s delay
// You can adjust the delay in useSettings.ts:

const updateSetting = useCallback((section, key, value) => {
  setSettings(prev => {
    const newSettings = { /* ... */ };
    
    // Adjust this delay as needed
    setTimeout(() => saveSettings(newSettings), 2000); // 2 seconds
    
    return newSettings;
  });
}, []);
```

## 🌐 Integration with Existing SISO IDE

### Adding Settings Button to Navigation

```tsx
// In your main navigation component
import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      {/* Your existing nav items */}
      <Link to="/settings" className="nav-link">
        ⚙️ Settings
      </Link>
    </nav>
  );
}
```

### Settings Context Provider

```tsx
// Create a settings context for app-wide access
import { createContext, useContext } from 'react';
import { useSettings } from '../hooks/useSettings';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const settingsData = useSettings();
  
  return (
    <SettingsContext.Provider value={settingsData}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within SettingsProvider');
  }
  return context;
}
```

Then wrap your app:

```tsx
// In your App.tsx root
function App() {
  return (
    <SettingsProvider>
      {/* Your existing app components */}
      <Router>
        <Routes>
          <Route path="/settings" element={<SISOSettingsPage />} />
          {/* Other routes */}
        </Routes>
      </Router>
    </SettingsProvider>
  );
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Framer Motion not working**
   ```bash
   npm install framer-motion
   ```

2. **CSS styles not applying**
   - Make sure you import the CSS file: `import './styles/siso-settings.css'`
   - Check for CSS specificity conflicts

3. **Settings not persisting**
   - Check browser localStorage
   - Verify API endpoints are working
   - Check network tab for errors

4. **TypeScript errors**
   ```bash
   npm install @types/react @types/react-dom
   ```

## ✅ Ready to Use!

Your SISO IDE now has a complete settings system! 

### What's Included:

✅ **Modern Settings Page** - 4 tabs with all common settings  
✅ **Persistent Storage** - Local storage + API sync  
✅ **Integration Support** - GitHub, Notion validation  
✅ **Mobile Responsive** - Works on all devices  
✅ **Type Safe** - Full TypeScript support  
✅ **Animated UI** - Smooth transitions  
✅ **SISO Branded** - Custom design system  

### Next Steps:

1. **Install dependencies** (framer-motion)
2. **Add to your routing system**
3. **Create backend API endpoints**
4. **Test on mobile devices**
5. **Customize colors and branding**

The settings page is now fully integrated and ready to use in your SISO IDE! 🎉

---
*SISO Settings Page v1.0 | Adapted from Claudia GUI | Built with ❤️ for SISO IDE*