# Design Review Command

Comprehensive design review for UI/UX changes in the SISO platform.

## Quick Design Review

Run a focused design review on recent changes:

```bash
# Switch to design review agent
/agent design-reviewer

# Run visual testing suite
npm run test:visual

# Check accessibility compliance
npm run test:a11y

# Performance impact assessment
npm run build && npm run analyze
```

## Full Design Audit

Complete design quality assessment:

### 1. **Component Analysis**
```bash
# Find recent UI component changes
git diff --name-only HEAD~5 src/components/
```

### 2. **Responsive Testing** (Manual Check Points)
- Mobile (375px): Check touch targets and thumb reach
- Tablet (768px): Verify layout transitions
- Desktop (1024px+): Ensure proper spacing and hierarchy

### 3. **Accessibility Validation**
```bash
# Run accessibility tests
npm run test:a11y

# Check color contrast (manual verification needed)
# Use browser dev tools accessibility panel
```

### 4. **Performance Impact**
```bash
# Bundle size analysis
npm run build
npm run bundle-analyzer

# Core Web Vitals check
npm run lighthouse
```

## Design Standards Checklist

### **Visual Design** ✨
- [ ] Consistent with shadcn/ui design system
- [ ] Proper Tailwind spacing (4px grid)
- [ ] Correct typography scale
- [ ] Appropriate color usage
- [ ] Smooth Framer Motion animations

### **Responsive Design** 📱
- [ ] Mobile-first approach
- [ ] Touch targets ≥ 44px
- [ ] Thumb-friendly navigation
- [ ] No horizontal scrolling
- [ ] Readable text at all sizes

### **Accessibility** ♿
- [ ] WCAG 2.1 AA compliant
- [ ] Color contrast ≥ 4.5:1
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators visible

### **Performance** ⚡
- [ ] First Contentful Paint < 1.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Bundle size impact minimal
- [ ] Images optimized
- [ ] Smooth 60fps animations

### **Code Quality** 🔧
- [ ] TypeScript types defined
- [ ] Component props documented
- [ ] Error boundaries implemented
- [ ] Loading states included
- [ ] Reusable and composable

## Common Design Issues

### **Mobile UX Problems**
- Touch targets too small (< 44px)
- Text too small on mobile
- Gestures conflict with native behavior
- Poor thumb reach for primary actions

### **Accessibility Gaps**
- Missing ARIA labels
- Low color contrast
- No keyboard focus indicators
- Images without alt text

### **Performance Issues**
- Large images not optimized
- Unnecessary animations on mobile
- Bundle size increases > 10%
- Layout shift during loading

## Integration with Development Workflow

1. **Pre-commit**: Run basic design checks
2. **PR Review**: Full design review with Playwright
3. **Staging**: User acceptance testing
4. **Production**: Monitor Core Web Vitals