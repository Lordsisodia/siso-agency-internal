# 📊 Test Fixtures

**Mock data, test databases, and sample data sets for testing**

## 📁 Contents

This directory will contain:
- Mock user data and profiles
- Sample task and XP data
- Database seed files for testing
- API response mocks
- Component prop fixtures

## 🎯 Purpose

Centralized test data management:
- **Mock Data**: Realistic test data sets
- **Database Seeds**: Test database population
- **API Mocks**: Consistent API response data
- **Component Props**: Standard component test props

## 📋 Future Structure

```
fixtures/
├── users/              # Mock user profiles and data
├── tasks/              # Sample task and XP data  
├── database/           # Database seed files
├── api/                # API response mocks
└── components/         # Component fixture data
```

## 🚀 Usage

Import fixtures in tests:
```typescript
import { mockUser } from '@testing/fixtures/users/mockUser';
import { sampleTasks } from '@testing/fixtures/tasks/sampleTasks';
```

---
*Test Data Repository*