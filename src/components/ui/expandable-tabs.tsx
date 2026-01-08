"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// Custom 9-dot icon (circle with 9 smaller circles inside)
export const NineDotsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer circle */}
    <circle cx="12" cy="12" r="11" strokeWidth="2" />
    {/* 9 inner dots in 3x3 grid */}
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    <circle cx="12" cy="8" r="1.5" fill="currentColor" />
    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
    <circle cx="8" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="16" cy="12" r="1.5" fill="currentColor" />
    <circle cx="8" cy="16" r="1.5" fill="currentColor" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    <circle cx="16" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

interface Tab {
  title: string;
  icon: LucideIcon;
  type?: never;
}

interface Separator {
  type: "separator";
  title?: never;
  icon?: never;
}

type TabItem = Tab | Separator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  activeBgColor?: string;
  inactiveColor?: string;
  activeIndex?: number | null;
  onChange?: (index: number | null) => void;
}

const transition = { type: "spring", bounce: 0, duration: 0.4 };

export const ExpandableTabs = React.memo(function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  activeBgColor = "bg-muted",
  inactiveColor = "text-white/80",
  activeIndex,
  onChange,
}: ExpandableTabsProps) {
  const outsideClickRef = React.useRef(null);

  // Use activeIndex prop directly - eliminates state synchronization race condition
  const selected = activeIndex;

  const handleSelect = (index: number) => {
    // Only call parent onChange - no local state to manage
    onChange?.(index);
  };

  const Separator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-border" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-white/10 bg-gray-900/30 backdrop-blur-xl p-1.5 shadow-2xl",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <Separator key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        const isLastTab = index === tabs.length - 1;
        const isSelected = selected === index;

        // Use NineDotsIcon for the last tab (More button)
        const DisplayIcon = isLastTab ? NineDotsIcon : Icon;

        return (
          <motion.button
            key={tab.title}
            onClick={() => handleSelect(index)}
            transition={transition}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 min-w-[60px] transition-all duration-300",
              isSelected
                ? cn(activeBgColor, activeColor)
                : cn(
                    inactiveColor,
                    "hover:bg-white/5"
                  )
            )}
          >
            <DisplayIcon size={20} strokeWidth={2} />
            <span className="text-[10px] font-medium whitespace-nowrap">
              {tab.title}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
});
