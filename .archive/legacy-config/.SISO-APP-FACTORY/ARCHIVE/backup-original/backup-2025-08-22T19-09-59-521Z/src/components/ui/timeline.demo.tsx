
// Dark glass, branded TimelineDemo.jsx

import React from "react";
import { Timeline } from "@/components/ui/timeline";

export function TimelineDemo() {
  // Use your own branding/colors, not Aceternity or NEXT-specific.
  const data = [
    {
      title: "2024",
      content: (
        <div>
          <p className="text-[#e0e0e0] text-xs md:text-sm font-normal mb-8">
            🚀 Major dashboard and sidebar overhaul – now with a dark, sleek glass appearance.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://assets.aceternity.com/templates/startup-1.webp"
              alt="Feature update"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-[#9b87f5]/30"
            />
            <img
              src="https://assets.aceternity.com/templates/startup-2.webp"
              alt="UI improvement"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-[#7E69AB]/20"
            />
            <img
              src="https://assets.aceternity.com/templates/startup-3.webp"
              alt="Feature"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-[#9b87f5]/30"
            />
            <img
              src="https://assets.aceternity.com/templates/startup-4.webp"
              alt="Update"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-[#7E69AB]/20"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Q1 2023",
      content: (
        <div>
          <p className="text-[#e0e0e0] text-xs md:text-sm font-normal mb-8">
            ✨ Refined theme colors for brand harmony and visual comfort.
          </p>
          <p className="text-[#a9a6c1] text-xs md:text-sm font-normal mb-8">
            Launched the new Timeline feature. Improved project structure, navigation, and onboarding experience!
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://assets.aceternity.com/pro/hero-sections.png"
              alt="Feature"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-indigo-900 border border-[#7E69AB]/30"
            />
            <img
              src="https://assets.aceternity.com/features-section.png"
              alt="Theme"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-[#9b87f5]/10"
            />
            <img
              src="https://assets.aceternity.com/pro/bento-grids.png"
              alt="UI"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-[#7E69AB]/20"
            />
            <img
              src="https://assets.aceternity.com/cards.png"
              alt="Cards"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-lg border border-[#9b87f5]/30"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Changelog",
      content: (
        <div>
          <p className="text-[#bfa6f8] text-xs md:text-sm font-normal mb-4">
            📝 Deployed 5+ new features and UI improvements today
          </p>
          <div className="mb-8 space-y-2">
            <div className="flex gap-2 items-center text-[#d6bcfa] text-xs md:text-sm">
              ✅ Card grid component
            </div>
            <div className="flex gap-2 items-center text-[#d6bcfa] text-xs md:text-sm">
              ✅ Sleek sidebar and Dashboard modernized
            </div>
            <div className="flex gap-2 items-center text-[#d6bcfa] text-xs md:text-sm">
              ✅ Timeline glass animation
            </div>
            <div className="flex gap-2 items-center text-[#d6bcfa] text-xs md:text-sm">
              ✅ Dark/light mode polish
            </div>
            <div className="flex gap-2 items-center text-[#d6bcfa] text-xs md:text-sm">
              ✅ Mobile-responsiveness enhancements
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://assets.aceternity.com/pro/hero-sections.png"
              alt="feature"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow border border-[#7E69AB]/25"
            />
            <img
              src="https://assets.aceternity.com/features-section.png"
              alt="feature"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow border border-[#9b87f5]/30"
            />
            <img
              src="https://assets.aceternity.com/pro/bento-grids.png"
              alt="bento"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow border border-[#7E69AB]/20"
            />
            <img
              src="https://assets.aceternity.com/cards.png"
              alt="cards"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow border border-[#9b87f5]/20"
            />
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="min-h-screen w-full bg-transparent">
      <Timeline data={data} />
    </div>
  );
}
