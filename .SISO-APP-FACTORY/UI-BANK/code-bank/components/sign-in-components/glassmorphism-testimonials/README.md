# Sign-In Component

A premium, animated sign-in page component with glass-morphism design, testimonials, and OAuth integration.

## 🎯 Features

- **Glass-morphism design** - Modern translucent input fields
- **Animated testimonials** - Sliding testimonials with user avatars
- **OAuth integration** - Google sign-in support
- **Password visibility toggle** - Eye/EyeOff icons from Lucide
- **Responsive design** - Mobile-first approach
- **Custom animations** - Staggered entrance animations
- **TypeScript support** - Full type safety

## 📁 Structure

```
sign-in/
├── index.ts              # Barrel exports
├── types.ts              # TypeScript interfaces
├── icons.tsx             # Google OAuth icon
├── sub-components.tsx    # Reusable UI components
├── SignInPage.tsx        # Main component
├── demo.tsx              # Demo with sample data
└── README.md            # This file
```

## 🚀 Usage

### Basic Usage
```tsx
import { SignInPage } from './sign-in';

const App = () => (
  <SignInPage
    onSignIn={(event) => {
      event.preventDefault();
      // Handle sign in
    }}
    onGoogleSignIn={() => {
      // Handle Google OAuth
    }}
  />
);
```

### Advanced Usage with Testimonials
```tsx
import { SignInPage, type Testimonial } from './sign-in';

const testimonials: Testimonial[] = [
  {
    avatarSrc: "https://example.com/avatar1.jpg",
    name: "John Doe",
    handle: "@johndoe",
    text: "Amazing experience!"
  }
];

const App = () => (
  <SignInPage
    title={<span className="text-4xl font-bold">Welcome Back</span>}
    description="Sign in to continue your journey"
    heroImageSrc="https://example.com/hero.jpg"
    testimonials={testimonials}
    onSignIn={handleSignIn}
    onGoogleSignIn={handleGoogleSignIn}
    onResetPassword={handleResetPassword}
    onCreateAccount={handleCreateAccount}
  />
);
```

## 🎨 Customization

### Props Interface
```tsx
interface SignInPageProps {
  title?: React.ReactNode;           // Custom title (default: "Welcome")
  description?: React.ReactNode;     // Subtitle text
  heroImageSrc?: string;            // Right-side background image
  testimonials?: Testimonial[];      // User testimonials
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}
```

### Testimonial Interface
```tsx
interface Testimonial {
  avatarSrc: string;    // User avatar URL
  name: string;         // User's full name
  handle: string;       // @username
  text: string;         // Testimonial content
}
```

## 🎭 Animations

The component includes several CSS animation classes:
- `.animate-element` - Fade and slide up animation
- `.animate-slide-right` - Slide in from right
- `.animate-testimonial` - Testimonial card animation
- `.animate-delay-*` - Staggered animation delays (100ms to 1400ms)

## 🛠️ Dependencies

- **React** - ^18.0.0
- **lucide-react** - Eye/EyeOff icons
- **Tailwind CSS** - Styling and animations
- **TypeScript** - Type definitions

## 🎯 Integration

### Copy to Active Project
```bash
# Copy entire folder to your components directory
cp -r sign-in/ src/components/ui/sign-in/

# Or copy to shared UI
cp -r sign-in/ src/shared/ui/sign-in/
```

### Import in Project
```tsx
// From components/ui
import { SignInPage } from '@/components/ui/sign-in';

// From shared/ui  
import { SignInPage } from '@/shared/ui/sign-in';
```

## 🎨 Styling Requirements

Ensure these CSS animations are added to your main stylesheet:

```css
@keyframes fadeSlideIn {
  to {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0px);
  }
}

@keyframes slideRightIn {
  to {
    opacity: 1;
    filter: blur(0px);
    transform: translateX(0px);
  }
}

@keyframes testimonialIn {
  to {
    opacity: 1;
    filter: blur(0px);
    transform: translateY(0px) scale(1);
  }
}

/* Animation classes */
.animate-element {
  opacity: 0;
  filter: blur(2px);
  transform: translateY(20px);
  animation: fadeSlideIn 0.6s ease-out forwards;
}

.animate-slide-right {
  opacity: 0;
  filter: blur(2px);
  transform: translateX(50px);
  animation: slideRightIn 0.8s ease-out forwards;
}

.animate-testimonial {
  opacity: 0;
  filter: blur(2px);
  transform: translateY(30px) scale(0.95);
  animation: testimonialIn 0.7s ease-out forwards;
}

/* Delay classes */
.animate-delay-100 { animation-delay: 100ms; }
.animate-delay-200 { animation-delay: 200ms; }
/* ... up to animate-delay-1400 */

/* Custom checkbox */
.custom-checkbox {
  appearance: none;
  width: 1rem;
  height: 1rem;
  border: 2px solid hsl(var(--border));
  border-radius: 0.25rem;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.custom-checkbox:checked {
  background-color: rgb(139 92 246);
  border-color: rgb(139 92 246);
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e");
  background-size: 0.75rem;
  background-position: center;
  background-repeat: no-repeat;
}
```

---

*Premium sign-in component with glass-morphism design and animated testimonials*