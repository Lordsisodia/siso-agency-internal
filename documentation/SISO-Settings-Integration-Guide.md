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

```
/SISO-IDE/
├── components/
│   ├── settings/
│   │   ├── SISOSettingsPage.tsx      # Main settings component
│   │   ├── SettingsHooks.ts          # Custom hooks for settings
│   │   └── SettingsStyles.css        # CSS design system
│   └── ui/                           # Reusable UI components
├── api/
│   ├── settings.ts                   # Settings API endpoints
│   └── integrations/                 # Integration validation
└── types/
    └── settings.ts                   # TypeScript definitions
```

## 🚀 Quick Setup

### Step 1: Install Dependencies

```bash
# Core dependencies
npm install framer-motion
npm install react react-dom
npm install typescript @types/react @types/react-dom

# Optional: For better styling
npm install tailwindcss
npm install @headlessui/react @heroicons/react
```

### Step 2: Copy Files to Your Project

```bash
# Copy the main files to your SISO IDE project
cp /Users/shaansisodia/DEV/siso-settings-page.tsx ./src/components/settings/
cp /Users/shaansisodia/DEV/siso-settings-hooks.ts ./src/hooks/
cp /Users/shaansisodia/DEV/siso-settings-styles.css ./src/styles/
```

### Step 3: Import and Use

```tsx
// In your main App.tsx or router
import SISOSettingsPage from './components/settings/SISOSettingsPage';
import './styles/siso-settings-styles.css';

function App() {
  return (
    <div className="App">
      {/* Your existing app content */}
      <SISOSettingsPage />
    </div>
  );
}
```

## 🎨 Customization Guide

### Theme Configuration

The settings page includes a complete design system. Customize colors by modifying CSS variables:

```css
/* In siso-settings-styles.css */
:root {
  /* Update SISO brand colors */
  --siso-primary: #your-primary-color;
  --siso-accent: #your-accent-color;
  
  /* Update typography */
  --siso-font-family: 'Your-Font', sans-serif;
}
```

### Adding New Settings Sections

1. **Update the Settings Type**:
```tsx
// In siso-settings-hooks.ts
export interface SISOSettings {
  // Existing sections...
  
  // Add your new section
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

3. **Create the UI Tab**:
```tsx
// Add to the tabs list in SISOSettingsPage.tsx
<TabsTrigger value="deployment">Deployment</TabsTrigger>

// Add the content
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

### Custom Integrations

Add new integrations by extending the integrations section:

```tsx
// Example: Add Slack integration
integrations: {
  github: { /* existing */ },
  notion: { /* existing */ },
  
  // New integration
  slack: {
    enabled: boolean;
    webhookUrl: string;
    channel: string;
  }
}
```

Then create a validation function:
```tsx
// In siso-settings-hooks.ts
const validateSlack = async (webhookUrl: string) => {
  // Validation logic
};
```

## 🔧 Backend Integration

### API Endpoints

Create these endpoints in your SISO IDE backend:

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

## 🔌 Advanced Features

### Settings Export/Import

```tsx
// Usage in your component
import { useSettingsImportExport } from './hooks/siso-settings-hooks';

function SettingsPage() {
  const { exportSettings, importSettings } = useSettingsImportExport();
  
  const handleExport = () => {
    exportSettings(settings);
  };
  
  const handleImport = async (file: File) => {
    try {
      const imported = await importSettings(file);
      setSettings(imported);
    } catch (error) {
      alert('Invalid settings file');
    }
  };
}
```

### Real-time Settings Sync

```tsx
// Add WebSocket integration for real-time sync
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080/settings');
  
  ws.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data);
    if (type === 'settings_update') {
      setSettings(data);
    }
  };
  
  return () => ws.close();
}, []);
```

### Settings Validation

```tsx
// Add client-side validation
const validateSettings = (settings: SISOSettings): string[] => {
  const errors = [];
  
  if (settings.editor.fontSize < 10 || settings.editor.fontSize > 32) {
    errors.push('Font size must be between 10 and 32');
  }
  
  if (settings.ai.temperature < 0 || settings.ai.temperature > 2) {
    errors.push('Temperature must be between 0 and 2');
  }
  
  return errors;
};
```

## 📱 Mobile Optimization

The settings page is already mobile-responsive, but you can enhance it:

### Mobile-Specific Styles

```css
@media (max-width: 640px) {
  .siso-settings-header h1 {
    font-size: 1.875rem; /* Smaller on mobile */
  }
  
  .siso-tabs__list {
    overflow-x: auto; /* Scrollable tabs on mobile */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .siso-tabs__list::-webkit-scrollbar {
    display: none;
  }
}
```

### Touch-Friendly Interactions

```tsx
// Add haptic feedback on mobile
const handleToggle = (checked: boolean) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50); // Brief vibration
  }
  onCheckedChange(checked);
};
```

## 🧪 Testing

### Unit Tests

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

test('should save settings when form is submitted', async () => {
  const mockSave = jest.fn();
  render(<SISOSettingsPage onSave={mockSave} />);
  
  fireEvent.click(screen.getByText('Save Settings'));
  
  await waitFor(() => {
    expect(mockSave).toHaveBeenCalled();
  });
});
```

### Integration Tests

```tsx
// tests/settings-integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/settings', (req, res, ctx) => {
    return res(ctx.json(mockSettings));
  })
);

test('should load settings from API', async () => {
  render(<SISOSettingsPage />);
  
  await waitFor(() => {
    expect(screen.getByDisplayValue('SISO IDE')).toBeInTheDocument();
  });
});
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

### Memoization

```tsx
// Optimize re-renders
import { memo, useMemo } from 'react';

const SettingsTab = memo(({ settings, onUpdate }) => {
  const tabContent = useMemo(() => {
    return generateTabContent(settings);
  }, [settings]);
  
  return <div>{tabContent}</div>;
});
```

## 🔒 Security Considerations

### Token Storage

```tsx
// Secure token storage
const storeToken = (token: string, integration: string) => {
  // Don't store sensitive tokens in localStorage in production
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

## 🌐 Internationalization

### Adding i18n Support

```tsx
// Install react-i18next
npm install react-i18next i18next

// Configure translations
import { useTranslation } from 'react-i18next';

function SISOSettingsPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('settings.title')}</h1>
      <p>{t('settings.description')}</p>
    </div>
  );
}
```

## 📊 Analytics

### Track Settings Changes

```tsx
// Add analytics to track user behavior
const trackSettingChange = (section: string, setting: string, value: any) => {
  // Your analytics service
  analytics.track('Setting Changed', {
    section,
    setting,
    value: typeof value,
    timestamp: new Date().toISOString()
  });
};

const updateSetting = (section, key, value) => {
  trackSettingChange(section, key, value);
  // ... rest of update logic
};
```

## 🔄 Migration from Claudia

If you're migrating from Claudia GUI, here's a mapping guide:

### Component Mapping

| Claudia Component | SISO Equivalent | Changes |
|------------------|-----------------|---------|
| `Settings.tsx` | `SISOSettingsPage.tsx` | Simplified, SISO branding |
| `PermissionRule` | Not included | Use custom rules system |
| `HookConfig` | Custom hooks | Adapted for SISO needs |
| `StorageConfig` | Local storage + API | Simplified storage |

### API Mapping

| Claudia API | SISO API | Purpose |
|-------------|----------|---------|
| `/api/claude-config` | `/api/settings` | Main settings |
| `/api/permissions` | `/api/integrations` | Integration settings |
| `/api/hooks` | Custom implementation | Webhook configuration |

## 🛠️ Troubleshooting

### Common Issues

1. **Settings not saving**
   - Check API endpoints are correctly configured
   - Verify localStorage is available
   - Check network tab for API errors

2. **Animations not working**
   - Ensure Framer Motion is installed
   - Check for CSS conflicts
   - Verify `initial`, `animate`, `exit` props

3. **Styles not applying**
   - Import the CSS file in your main component
   - Check for CSS specificity conflicts
   - Verify CSS variables are defined

### Debug Mode

```tsx
// Add debug mode for development
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Settings state:', settings);
  console.log('API calls:', apiCalls);
}
```

## 🎯 Best Practices

1. **Settings Structure**
   - Keep settings flat when possible
   - Use semantic section names
   - Provide sensible defaults

2. **Performance**
   - Debounce API calls for auto-save
   - Use React.memo for expensive components
   - Lazy load heavy integrations

3. **UX**
   - Show loading states
   - Provide immediate feedback
   - Use progressive disclosure

4. **Accessibility**
   - Add ARIA labels
   - Support keyboard navigation
   - Ensure color contrast compliance

## 🚀 Deployment

### Production Checklist

- [ ] API endpoints configured
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Security tokens configured
- [ ] Analytics tracking enabled
- [ ] Error reporting setup
- [ ] Performance monitoring enabled

### Environment Variables

```bash
# .env.production
REACT_APP_API_URL=https://api.siso-ide.com
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
REACT_APP_NOTION_CLIENT_ID=your_notion_client_id
REACT_APP_ANALYTICS_KEY=your_analytics_key
```

---

## 🎉 You're Ready!

Your SISO IDE now has a professional settings page inspired by Claudia GUI! The settings system includes:

✅ **Modern UI** - Clean, animated interface  
✅ **Persistent Settings** - Local storage + API sync  
✅ **Integration Support** - GitHub, Notion, and more  
✅ **Mobile Responsive** - Works on all devices  
✅ **Type Safe** - Full TypeScript support  
✅ **Extensible** - Easy to add new settings  

### Next Steps

1. **Integrate into your routing system**
2. **Connect to your backend API**
3. **Add SISO-specific integrations**
4. **Customize the branding and colors**
5. **Add analytics tracking**

Need help? Check the troubleshooting section or create an issue in your project repository.

---
*SISO Settings Page v1.0 | Adapted from Claudia GUI | Built with ❤️*