"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

interface EnhancedTimelineItem {
  title: string;
  description?: React.ReactNode;
  date?: React.ReactNode;
  metadata?: React.ReactNode;
  content?: React.ReactNode;
}

interface TimelineProps {
  data?: TimelineEntry[];
  items?: EnhancedTimelineItem[];
  renderMetadata?: (metadata: EnhancedTimelineItem["metadata"]) => React.ReactNode;
  renderDate?: (date: EnhancedTimelineItem["date"]) => React.ReactNode;
  renderDescription?: (description: EnhancedTimelineItem["description"]) => React.ReactNode;
  className?: string;
}

const DEFAULT_METADATA_CLASS =
  "inline-flex items-center rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60";

const DEFAULT_DATE_CLASS = "flex items-center gap-2 text-xs text-white/60";

export const Timeline: React.FC<TimelineProps> = ({
  data,
  items,
  renderMetadata,
  renderDate,
  renderDescription,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  const normalizedItems = useMemo<TimelineEntry[]>(() => {
    if (items && items.length > 0) {
      return items.map((item) => {
        if (item.content) {
          return {
            title: item.title,
            content: item.content,
          };
        }

        const metadataNode =
          typeof item.metadata !== "undefined" && item.metadata !== null
            ? renderMetadata
              ? renderMetadata(item.metadata)
              : typeof item.metadata === "string"
                ? <span className={DEFAULT_METADATA_CLASS}>{item.metadata}</span>
                : item.metadata
            : null;

        const dateNode =
          typeof item.date !== "undefined" && item.date !== null
            ? renderDate
              ? renderDate(item.date)
              : (
                <span className={DEFAULT_DATE_CLASS}>
                  <Clock className="h-3.5 w-3.5" />
                  {item.date}
                </span>
              )
            : null;

        const descriptionNode =
          typeof item.description !== "undefined" && item.description !== null
            ? renderDescription
              ? renderDescription(item.description)
              : (
                <p className="text-sm leading-relaxed text-white/70">
                  {item.description}
                </p>
              )
            : null;

        return {
          title: item.title,
          content: (
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_20px_40px_rgba(3,3,9,0.45)] space-y-3">
              {(metadataNode || dateNode) && (
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">{metadataNode}</div>
                  {dateNode}
                </div>
              )}
              {descriptionNode}
            </div>
          ),
        };
      });
    }
    return data ?? [];
  }, [items, data, renderMetadata, renderDate, renderDescription]);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [normalizedItems.length]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className={`w-full bg-transparent dark:bg-transparent font-sans md:px-10 ${className}`}
      ref={containerRef}
    >
      <div ref={ref} className="relative max-w-7xl mx-auto pt-8 pb-20">
        {normalizedItems.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-transparent dark:bg-transparent flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-siso-orange/70 dark:bg-siso-orange/70 border border-siso-orange dark:border-siso-orange p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-white dark:text-white">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-white dark:text-white">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-400 dark:via-neutral-400 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
