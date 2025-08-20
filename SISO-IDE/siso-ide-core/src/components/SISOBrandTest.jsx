import React from 'react';

export const SISOBrandTest = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="siso-header mb-6">
        <h1 className="text-3xl font-bold">🧠 SISO IDE</h1>
        <p className="text-lg opacity-90">Black & Orange Brand Test</p>
      </div>
      
      <div className="grid gap-4 mb-6">
        <div className="siso-card">
          <h3 className="text-lg font-semibold mb-2 text-[hsl(var(--foreground))]">Brand Colors Applied!</h3>
          <p className="text-[hsl(var(--muted-foreground))] mb-4">
            Your SISO IDE now uses black backgrounds with orange accents throughout.
          </p>
          <div className="flex gap-2">
            <button className="siso-button px-4 py-2 rounded">
              Orange Button
            </button>
            <button className="siso-button-secondary px-4 py-2 rounded">
              Secondary Button
            </button>
          </div>
        </div>
        
        <div className="siso-card">
          <h3 className="text-lg font-semibold mb-2 text-[hsl(var(--foreground))]">Color Swatches</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-12 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded flex items-center justify-center text-xs">
              Background
            </div>
            <div className="h-12 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded flex items-center justify-center text-xs font-bold">
              Primary
            </div>
            <div className="h-12 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded flex items-center justify-center text-xs">
              Card
            </div>
          </div>
        </div>
        
        <div className="siso-card">
          <h3 className="text-lg font-semibold mb-2 text-[hsl(var(--foreground))]">Interactive Elements</h3>
          <div className="space-y-3">
            <input 
              className="siso-input w-full px-3 py-2 rounded" 
              placeholder="Orange focus ring on click"
            />
            <div className="siso-nav-item">
              Navigation Item (hover for orange)
            </div>
            <div className="siso-nav-item active">
              Active Navigation Item
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <span className="siso-badge">
          ✅ SISO Branding Active
        </span>
      </div>
    </div>
  );
};

export default SISOBrandTest;