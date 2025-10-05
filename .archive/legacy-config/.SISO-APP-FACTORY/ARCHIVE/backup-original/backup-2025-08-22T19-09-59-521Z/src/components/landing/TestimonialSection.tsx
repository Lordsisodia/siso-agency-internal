import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

// Sample testimonial data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Marketing Director',
    company: 'GrowthTech',
    image: "/images/siso-logo.svg",
    quote: "SISO AGENCY's resource hub has been a game-changer. The ROI from implementing these tools has been incredible.",
    stars: 5,
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Agency Owner',
    company: 'DigitalLeap',
    image: "/images/siso-logo.svg",
    quote: "The dashboard analytics alone saved us 15 hours per week in reporting time. Highly recommended!",
    stars: 5,
  },
  {
    id: 3,
    name: 'Amy Chen',
    role: 'Operations Manager',
    company: 'Visionary Media',
    image: "/images/siso-logo.svg",
    quote: "Since adopting these client management tools, we've increased client retention by 35%.",
    stars: 5,
  },
  {
    id: 4,
    name: 'David Thompson',
    role: 'Creative Director',
    company: 'Altitude Design',
    image: "/images/siso-logo.svg",
    quote: "The client approval workflows have transformed how we handle feedback. So intuitive!",
    stars: 5,
  },
  {
    id: 5,
    name: 'Emily Watkins',
    role: 'CEO',
    company: 'InnovateNow',
    image: "/images/siso-logo.svg",
    quote: "As someone running multiple teams, the task management system is exactly what I needed.",
    stars: 5,
  },
  {
    id: 6,
    name: 'Jonathan Lee',
    role: 'Digital Strategist',
    company: 'FutureFocus',
    image: "/images/siso-logo.svg",
    quote: "SISO AGENCY has become an essential part of our tech stack. The continuous improvements keep getting better.",
    stars: 5,
  },
  {
    id: 7,
    name: 'Rebecca Moore',
    role: 'Project Manager',
    company: 'Elevate Agency',
    image: "/images/siso-logo.svg",
    quote: "The resource allocation features alone have paid for the subscription many times over.",
    stars: 5,
  },
];

export const TestimonialSection: React.FC = () => {
  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-primary uppercase font-semibold tracking-wide mb-2">TESTIMONIALS</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            What Our Partners Say About SISO AGENCY
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-3xl">
            Real stories from businesses that have grown with SISO AGENCY's solutions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6 h-full border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="italic mb-6 text-gray-700 dark:text-gray-300">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
