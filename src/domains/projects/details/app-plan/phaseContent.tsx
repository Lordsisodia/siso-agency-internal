
import React from 'react';
import {
  FileCheck,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Search,
  File,
  FileSpreadsheet,
  Framer,
  Code,
  TrendingUp
} from 'lucide-react';
import { PhaseData } from './types';

// Function that creates the UI content for each subsection
function createPhaseContent(): PhaseData[] {
  return [
    {
      id: "phase-1",
      title: "1. Product Management",
      description: "Forging Your Vision",
      subsections: [
        {
          id: "phase-1-1",
          title: "1.1 Ideation and User Needs",
          content: (
            <div className="space-y-4">
              <div className="mb-4">
                <p className="text-neutral-300">
                  Get ready to launch a cryptocurrency app that redefines investing for retail users, with real-time price tracking, 
                  seamless portfolio management, and bulletproof transactions. In this Product Management phase, we'll unleash a 
                  visionary plan powered by AI to outsmart competitors and thrill your users. Our process is razor-sharp, data-driven, 
                  and fueled by your input, ensuring a game-changing app that's as bold as the crypto market itself.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <FileSpreadsheet className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">AI Brainstorming</h5>
                      <p className="text-neutral-300 text-sm">
                        Host high-energy workshops with you and users to unearth pain points, like clunky wallet 
                        navigation or unclear market signals, using dynamic visualization to spark ideas.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <TrendingUp className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Feature Ideation</h5>
                      <p className="text-neutral-300 text-sm">
                        Unleash AI to generate 30+ bold feature ideas, from sentiment-driven trade alerts to gamified 
                        portfolio challenges, tailored for novices and crypto pros alike.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <FileCheck className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">User Insights</h5>
                      <p className="text-neutral-300 text-sm">
                        Engage diverse user personas (newbies to traders) to eliminate bias, 
                        ensuring features resonate across your audience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 p-4 rounded-md">
                <h5 className="text-md font-medium text-[#FF5722] mb-2">Expected Outcomes:</h5>
                <ul className="list-disc pl-5 space-y-1 text-neutral-300 text-sm">
                  <li>Vibrant workshop report capturing user struggles and your strategic goals</li>
                  <li>Catalog of 30+ innovative feature ideas, buzzing with crypto flair</li>
                  <li>Top 5 feature shortlist, laser-focused on user impact and approved by you</li>
                  <li>Unified vision statement, blending your ambitions with user needs</li>
                </ul>
              </div>
            </div>
          ),
          actionableSteps: [
            "Host high-energy workshops with you and users to unearth pain points, like clunky wallet navigation or unclear market signals.",
            "Unleash AI to generate 30+ bold feature ideas, from sentiment-driven trade alerts to gamified portfolio challenges.",
            "Engage diverse user personas (newbies to traders) to eliminate bias, ensuring features resonate across your audience.",
            "Refine ideas with you, spotlighting 5 blockbuster features that solve real user frustrations."
          ],
          expectedOutcomes: [
            "Vibrant workshop report capturing user struggles and your strategic goals",
            "Catalog of 30+ innovative feature ideas, buzzing with crypto flair",
            "Top 5 feature shortlist, laser-focused on user impact and approved by you",
            "Unified vision statement, blending your ambitions with user needs"
          ]
        },
        {
          id: "phase-1-2",
          title: "1.2 Market Analysis and Validation",
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <Search className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Competitor Analysis</h5>
                      <p className="text-neutral-300 text-sm">
                        Dive into 10+ rival crypto apps, dissecting features, pricing, and 10,000+ user reviews 
                        to expose gaps, like weak DeFi tools or sluggish interfaces.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <File className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Unmet Needs Discovery</h5>
                      <p className="text-neutral-300 text-sm">
                        Scour crypto forums and social channels with AI to pinpoint unmet needs, 
                        such as real-time yield tracking or simplified staking.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <ArrowRight className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Feature Impact Simulation</h5>
                      <p className="text-neutral-300 text-sm">
                        Simulate feature impact with AI, forecasting adoption for ideas like 
                        AI-powered market predictions, prioritizing winners that spike engagement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          actionableSteps: [
            "Dive into 10+ rival crypto apps, dissecting features, pricing, and 10,000+ user reviews to expose gaps.",
            "Scour crypto forums and social channels with AI to pinpoint unmet needs.",
            "Simulate feature impact with AI, forecasting adoption for ideas like AI-powered market predictions.",
            "Validate the top 3 features with you, ensuring they crush competitor weaknesses and align with market hype."
          ],
          expectedOutcomes: [
            "Slick competitor report revealing 5 critical market gaps and opportunities",
            "User feedback summary highlighting 3 must-have needs from forums",
            "AI-driven feature ranking, showcasing top 3 with projected user uptake",
            "Your green light on a feature set poised to dominate the crypto space"
          ]
        },
        {
          id: "phase-1-3",
          title: "1.3 Planning and Feedback",
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <FileSpreadsheet className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Problem Statement & Goals</h5>
                      <p className="text-neutral-300 text-sm">
                        Craft a razor-sharp problem statement (e.g., "Investors crave intuitive crypto platforms") and 
                        set ambitious goals, like slashing onboarding time by 50%.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <TrendingUp className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Feature Roadmap</h5>
                      <p className="text-neutral-300 text-sm">
                        Build a roadmap, ranking features (e.g., ironclad transactions, DeFi yield trackers) 
                        by user value and feasibility, with crystal-clear prioritization logic.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <ArrowRight className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Feedback Loop</h5>
                      <p className="text-neutral-300 text-sm">
                        Launch an AI-charged feedback loop, analyzing user input to pivot
                        priorities and keep the app red-hot.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#FF5722]/10 border border-[#FF5722]/20 p-4 rounded-md mt-4">
                <h5 className="text-md font-medium text-[#FF5722] mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Why This Matters for You
                </h5>
                <p className="text-neutral-300 text-sm mb-2">Your crypto app will be:</p>
                <ul className="list-disc pl-5 space-y-1 text-neutral-300 text-sm">
                  <li><span className="font-medium text-white">User-Obsessed:</span> Tackling investor pain points with precision.</li>
                  <li><span className="font-medium text-white">Market-Crushing:</span> Outshining rivals with next-level features.</li>
                  <li><span className="font-medium text-white">Laser-Focused:</span> Driven by bold goals and a killer roadmap.</li>
                  <li><span className="font-medium text-white">Your Vision:</span> Shaped by your feedback at every turn.</li>
                </ul>
                <p className="text-neutral-300 text-sm mt-2">
                  We'll deliver electrifying reports and demos to keep you in the loop, forging a foundation that's 
                  as unstoppable as the crypto market itself.
                </p>
              </div>
            </div>
          ),
          actionableSteps: [
            "Craft a razor-sharp problem statement and set ambitious goals.",
            "Build a roadmap, ranking features by user value and feasibility.",
            "Detail requirements for the top 3 features, mapping user stories and edge cases for your sign-off.",
            "Launch an AI-charged feedback loop, analyzing user input to pivot priorities and keep the app red-hot."
          ],
          expectedOutcomes: [
            "Compelling value proposition and measurable goals document",
            "Sleek roadmap with top-ranked features and transparent reasoning",
            "Polished requirements for 3 key features, ready for your approval",
            "Dynamic feedback system delivering real-time user insights and plan tweaks"
          ]
        }
      ]
    },
    {
      id: "phase-2",
      title: "2. UX/UI Design",
      description: "AI-Assisted Design and Usability",
      subsections: [
        {
          id: "phase-2-1",
          title: "2.1 AI-Driven Wireframing & Prototyping",
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <Framer className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Instant Prototypes</h5>
                      <p className="text-neutral-300 text-sm">
                        Use Uizard or Lovable to convert sketches or descriptions into high-fidelity wireframes. 
                        AI outputs React or HTML/CSS code for rapid front-end development.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <CheckCircle className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Design Best Practices Built-In</h5>
                      <p className="text-neutral-300 text-sm">
                        Ensure AI enforces accessibility (e.g., high-contrast price charts for vision-impaired users) 
                        and UX standards.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <Code className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Lovable & Bolt for UI</h5>
                      <p className="text-neutral-300 text-sm">
                        Use Lovable to generate a functional UI with components like price tickers 
                        and transaction forms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          actionableSteps: [
            "Create initial wireframes for 3 key screens (dashboard, portfolio, transaction) using AI tools.",
            "Run AI accessibility checks to ensure compliance with WCAG standards.",
            "Generate a functional UI prototype with Lovable, then customize for brand consistency."
          ]
        },
        {
          id: "phase-2-2",
          title: "2.2 AI in User Research & Usability Testing",
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <Search className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Synthetic User Testing</h5>
                      <p className="text-neutral-300 text-sm">
                        Use AI agents to simulate user interactions and identify friction points, 
                        like unclear wallet connection steps.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <FileCheck className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Automated Feedback Analysis</h5>
                      <p className="text-neutral-300 text-sm">
                        Analyze beta tester feedback with NLP to categorize themes 
                        (e.g., "confusing transaction flow").
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <ArrowRight className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">AI-Augmented A/B Testing</h5>
                      <p className="text-neutral-300 text-sm">
                        Generate design variants and analyze A/B test results to optimize 
                        for user segments (e.g., novice vs. expert traders).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          bestPractices: [
            "Use AI prototyping for rapid mocks, then refine with human creativity.",
            "Ensure accessibility with AI checks, verified by designers.",
            "Leverage AI for synthetic and real user feedback analysis.",
            "Embrace A/B testing with AI to optimize designs iteratively."
          ]
        }
      ]
    },
    {
      id: "phase-3",
      title: "3. Development",
      description: "AI-Augmented Coding and Collaboration",
      subsections: [
        {
          id: "phase-3-1",
          title: "3.1 Coding with AI Assistance",
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <Code className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">AI Pair Programming</h5>
                      <p className="text-neutral-300 text-sm">
                        Integrate GitHub Copilot or Cursor into the IDE to autocomplete code for features 
                        like real-time price APIs or wallet integration.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <FileCheck className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Code Generation Platforms</h5>
                      <p className="text-neutral-300 text-sm">
                        Use Bolt.new to scaffold a full-stack crypto app from a prompt like 
                        "build a crypto price tracker with portfolio."
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-2 rounded-md bg-[#FF5722]/10">
                      <ArrowRight className="h-5 w-5 text-[#FF5722]" />
                    </div>
                    <div>
                      <h5 className="font-medium text-white">Version Control & Merging</h5>
                      <p className="text-neutral-300 text-sm">
                        Use AI to write commit messages, resolve simple merge conflicts, 
                        and enforce conventional commit standards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          actionableSteps: [
            "Set up Copilot or Cursor for all developers to boost coding speed by 20%.",
            "Generate a full-stack prototype with Bolt.new, then refine for production use.",
            "Implement AI-driven commit message generation and merge conflict resolution in Git workflow."
          ]
        }
      ]
    }
  ];
}

export const phaseData = createPhaseContent();
