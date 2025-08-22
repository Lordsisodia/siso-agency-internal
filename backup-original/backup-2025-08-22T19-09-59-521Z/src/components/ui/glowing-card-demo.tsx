"use client";

import * as React from "react"
import { GridBackground } from "@/components/ui/glowing-card"
import { Button } from "@/components/ui/button"

export function GridBackgroundDemo() {
  return (
    <GridBackground
      title='SISO Agency'
      description="Transforming your ideas into scalable intelligence systems. Explore the world of premium digital solutions with us."
      showAvailability={true}
      className="max-w-4xl"
    >
      <div className="flex gap-4 justify-center">
        <Button className="bg-siso-orange hover:bg-siso-orange/90 text-black">
          Get Started
        </Button>
        <Button variant="outline" className="border-siso-orange text-siso-orange">
          Learn More
        </Button>
      </div>
    </GridBackground>
  )
} 