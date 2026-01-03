
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Home, Sparkles, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { SisoIcon } from "./icons/SisoIcon"

const navItems = [
  {
    name: "Overview",
    icon: Home,
    sectionId: "hero",
  },
  {
    name: "Features",
    icon: Sparkles, 
    sectionId: "features",
  },
  {
    name: "Why Choose",
    icon: Users,
    sectionId: "why-choose",
  },
  {
    name: "Get Started",
    icon: SisoIcon,
    sectionId: "cta",
  },
]

export function ScrollNav() {
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 }
    )

    const sections = document.querySelectorAll("section[id]")
    sections.forEach((section) => observer.observe(section))

    return () => sections.forEach((section) => observer.unobserve(section))
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
      <div className="flex flex-col gap-4 bg-background/5 border border-border backdrop-blur-lg p-2 rounded-full shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.sectionId

          return (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.sectionId)}
              className={cn(
                "relative p-3 rounded-full transition-colors group",
                "text-foreground/60 hover:text-primary",
                isActive && "text-primary"
              )}
            >
              <Icon size={20} strokeWidth={2} />
              
              <span className="absolute left-14 px-2 py-1 bg-background/80 backdrop-blur-sm border border-border rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {item.name}
              </span>

              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full">
                    <div className="absolute w-6 h-6 bg-primary/20 rounded-full blur-md -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// For backward compatibility with existing imports
export default ScrollNav;
