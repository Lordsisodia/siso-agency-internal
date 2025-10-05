import React, { useState } from 'react';
import { 
  GlassmorphismSignIn, 
  type Testimonial,
  SIGN_IN_COMPONENTS,
  getAvailableComponents,
  type SignInComponentVariant 
} from './index';

// Sample data for all components
const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless and the features are exactly what I needed."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg", 
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "This service has transformed how I work. Clean design, powerful features, and excellent support."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez", 
    handle: "@davidcreates",
    text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful."
  }
];

const SignInComponentShowcase = () => {
  const [currentComponent, setCurrentComponent] = useState<SignInComponentVariant>('glassmorphism-testimonials');
  const availableComponents = getAvailableComponents();

  // Common handlers for all components
  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(`[${currentComponent}] Sign In submitted:`, data);
    alert(`${SIGN_IN_COMPONENTS[currentComponent].name} - Sign In Submitted!`);
  };

  const handleGoogleSignIn = () => {
    console.log(`[${currentComponent}] Google sign in clicked`);
    alert(`${SIGN_IN_COMPONENTS[currentComponent].name} - Google Sign In!`);
  };
  
  const handleResetPassword = () => {
    alert(`${SIGN_IN_COMPONENTS[currentComponent].name} - Reset Password clicked`);
  };

  const handleCreateAccount = () => {
    alert(`${SIGN_IN_COMPONENTS[currentComponent].name} - Create Account clicked`);
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case 'glassmorphism-testimonials':
        return (
          <GlassmorphismSignIn
            heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
            testimonials={sampleTestimonials}
            onSignIn={handleSignIn}
            onGoogleSignIn={handleGoogleSignIn}
            onResetPassword={handleResetPassword}
            onCreateAccount={handleCreateAccount}
          />
        );
      
      // Future components will be added here
      // case 'minimal-centered':
      //   return <MinimalSignIn onSignIn={handleSignIn} />;
      
      // case 'split-screen':
      //   return <SplitScreenSignIn onSignIn={handleSignIn} />;
      
      // case 'animated-gradient':
      //   return <GradientSignIn onSignIn={handleSignIn} />;
      
      // case 'dark-mode-first':
      //   return <DarkModeSignIn onSignIn={handleSignIn} />;
      
      // case 'unified-best-practices':
      //   return (
      //     <UnifiedSignIn
      //       variant="glassmorphism"
      //       layout="split-screen"
      //       providers={['google', 'github']}
      //       onSignIn={handleSignIn}
      //     />
      //   );

      default:
        return (
          <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Component Coming Soon</h2>
              <p className="text-gray-600">
                {SIGN_IN_COMPONENTS[currentComponent].name} is currently in development.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative h-screen bg-background">
      {/* Component Selector */}
      <div className="absolute top-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-semibold text-gray-800 mb-3">Sign-In Components</h3>
        
        <div className="space-y-2">
          {Object.entries(SIGN_IN_COMPONENTS).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setCurrentComponent(key as SignInComponentVariant)}
              disabled={!info.available}
              className={`
                w-full text-left p-3 rounded-lg text-sm transition-all duration-200
                ${currentComponent === key 
                  ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                  : info.available
                    ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    : 'bg-gray-25 text-gray-400 cursor-not-allowed border border-gray-100'
                }
              `}
            >
              <div className="font-medium">{info.name}</div>
              <div className="text-xs opacity-75 mt-1">{info.description}</div>
              {!info.available && (
                <div className="text-xs text-orange-500 mt-1">Coming Soon</div>
              )}
            </button>
          ))}
        </div>

        {/* Component Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
          <div className="font-medium text-gray-800">Current: {SIGN_IN_COMPONENTS[currentComponent].name}</div>
          <div className="text-gray-600 mt-1">
            Complexity: <span className="capitalize">{SIGN_IN_COMPONENTS[currentComponent].complexity}</span>
          </div>
          <div className="text-gray-600">
            Features: {SIGN_IN_COMPONENTS[currentComponent].features.length}
          </div>
        </div>
      </div>

      {/* Component Display */}
      <div className="h-full">
        {renderComponent()}
      </div>
      
      {/* Info Badge */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
        🎨 SISO Sign-In Components Collection ({availableComponents.length} of {Object.keys(SIGN_IN_COMPONENTS).length} available)
      </div>
    </div>
  );
};

export default SignInComponentShowcase;