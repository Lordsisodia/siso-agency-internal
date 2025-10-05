// Sign-In Components Collection
// A comprehensive library of premium sign-in components

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

// 1. Glassmorphism with Testimonials ✅
export { 
  SignInPage as GlassmorphismSignIn,
  type SignInPageProps as GlassmorphismSignInProps,
  type Testimonial,
  SignInPageDemo as GlassmorphismSignInDemo 
} from './glassmorphism-testimonials';

// 2. Minimal Centered (Coming Soon)
// export { 
//   SignInPage as MinimalSignIn,
//   type SignInPageProps as MinimalSignInProps,
//   SignInPageDemo as MinimalSignInDemo 
// } from './minimal-centered';

// 3. Split Screen (Coming Soon)
// export { 
//   SignInPage as SplitScreenSignIn,
//   type SignInPageProps as SplitScreenSignInProps,
//   SignInPageDemo as SplitScreenSignInDemo 
// } from './split-screen';

// 4. Animated Gradient (Coming Soon)
// export { 
//   SignInPage as GradientSignIn,
//   type SignInPageProps as GradientSignInProps,
//   SignInPageDemo as GradientSignInDemo 
// } from './animated-gradient';

// 5. Dark Mode First (Coming Soon)
// export { 
//   SignInPage as DarkModeSignIn,
//   type SignInPageProps as DarkModeSignInProps,
//   SignInPageDemo as DarkModeSignInDemo 
// } from './dark-mode-first';

// ============================================================================
// UNIFIED COMPONENT (Future)
// ============================================================================

// Ultimate sign-in component combining best features from all variants
// export { 
//   UnifiedSignIn,
//   type UnifiedSignInProps,
//   UnifiedSignInDemo 
// } from './unified-best-practices';

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

export const SIGN_IN_COMPONENTS = {
  'glassmorphism-testimonials': {
    name: 'Glassmorphism with Testimonials',
    description: 'Premium glass-morphism design with animated testimonials',
    complexity: 'high',
    features: ['testimonials', 'oauth', 'animations', 'responsive'],
    bestFor: ['saas', 'premium', 'landing-pages'],
    available: true,
  },
  'minimal-centered': {
    name: 'Minimal Centered',
    description: 'Clean, minimal centered form design',
    complexity: 'low', 
    features: ['basic-auth', 'clean-typography'],
    bestFor: ['b2b', 'admin-panels', 'internal-tools'],
    available: false,
  },
  'split-screen': {
    name: 'Split Screen',
    description: 'Classic split-screen with brand showcase',
    complexity: 'medium',
    features: ['brand-showcase', 'feature-highlights', 'social-proof'],
    bestFor: ['enterprise', 'corporate', 'marketing'],
    available: false,
  },
  'animated-gradient': {
    name: 'Animated Gradient',
    description: 'Dynamic gradients with smooth animations',
    complexity: 'high',
    features: ['gradient-animations', 'micro-interactions'],
    bestFor: ['creative-agencies', 'portfolios', 'modern-brands'],
    available: false,
  },
  'dark-mode-first': {
    name: 'Dark Mode First',
    description: 'Dark-mode optimized with elegant transitions',
    complexity: 'medium',
    features: ['dark-light-toggle', 'theme-persistence'],
    bestFor: ['developer-tools', 'creative-platforms'],
    available: false,
  },
  'unified-best-practices': {
    name: 'Unified Best Practices',
    description: 'Ultimate component with configurable styles and features',
    complexity: 'very-high',
    features: ['all-features', 'configurable', 'a11y', 'testing'],
    bestFor: ['component-libraries', 'design-systems', 'universal'],
    available: false,
  },
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SignInComponentVariant = keyof typeof SIGN_IN_COMPONENTS;

export interface ComponentInfo {
  name: string;
  description: string;
  complexity: 'low' | 'medium' | 'high' | 'very-high';
  features: string[];
  bestFor: string[];
  available: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getComponentInfo = (variant: SignInComponentVariant): ComponentInfo => {
  return SIGN_IN_COMPONENTS[variant];
};

export const getAvailableComponents = (): SignInComponentVariant[] => {
  return Object.keys(SIGN_IN_COMPONENTS).filter(
    key => SIGN_IN_COMPONENTS[key as SignInComponentVariant].available
  ) as SignInComponentVariant[];
};

export const getComponentsByComplexity = (complexity: ComponentInfo['complexity']): SignInComponentVariant[] => {
  return Object.keys(SIGN_IN_COMPONENTS).filter(
    key => SIGN_IN_COMPONENTS[key as SignInComponentVariant].complexity === complexity
  ) as SignInComponentVariant[];
};