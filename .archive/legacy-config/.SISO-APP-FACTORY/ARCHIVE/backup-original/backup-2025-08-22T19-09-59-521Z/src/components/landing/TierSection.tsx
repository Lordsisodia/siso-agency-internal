import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Starter",
    description: "Perfect for agencies just getting started with AI",
    features: [
      "Access to core AI tools",
      "Basic automation templates",
      "Community support",
      "Weekly educational content"
    ],
    icon: "🚀"
  },
  {
    name: "Growth",
    description: "For growing agencies ready to scale with AI",
    features: [
      "Advanced AI integrations",
      "Custom automation workflows",
      "Priority support",
      "Daily educational updates"
    ],
    icon: "⚡",
    popular: true
  },
  {
    name: "Enterprise",
    description: "Full-scale AI transformation for established agencies",
    features: [
      "Enterprise-grade AI solutions",
      "Custom development support",
      "Dedicated success manager",
      "Unlimited resources"
    ],
    icon: "🌟"
  }
];

export const TierSection = () => {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose the Right Tier for Your Agency
          </h2>
          <p className="text-xl text-gray-400">
            Tailored solutions for agencies at every stage of growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative p-8 rounded-xl backdrop-blur-sm border border-white/10 
                transition-all duration-300 hover:scale-105 hover:border-white/20
                ${tier.popular ? 'bg-gradient-to-b from-siso-red/10 to-siso-orange/10' : 'bg-black/30'}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r 
                  from-siso-red to-siso-orange rounded-full text-white text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="text-4xl mb-4">{tier.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-gray-400 mb-6">{tier.description}</p>
              
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-300">
                    <span className="mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${
                  tier.popular 
                    ? 'bg-gradient-to-r from-siso-red to-siso-orange hover:from-siso-red/90 hover:to-siso-orange/90' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                Start Onboarding
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};