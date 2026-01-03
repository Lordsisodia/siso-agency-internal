"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  showPopupCards?: boolean;
  onItemSelect?: (item: TimelineItem) => void;
}

export default function RadialOrbitalTimeline({
  timelineData,
  showPopupCards = true,
  onItemSelect,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    { 6: true }
  );
  const [viewMode, setViewMode] = useState<"orbital">("orbital");
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset, setCenterOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(6);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Initialize with the default selected item (Marketing Materials - ID: 6)
  useEffect(() => {
    if (onItemSelect) {
      const defaultItem = timelineData.find(item => item.id === 6);
      if (defaultItem) {
        console.log(`🎬 Initial selection:`, defaultItem.title);
        onItemSelect(defaultItem);
      }
    }
  }, [timelineData]); // Remove onItemSelect from dependencies to avoid infinite loops

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking on the background, not on any child elements
    const target = e.target as HTMLElement;
    if (target === containerRef.current || target === orbitRef.current || 
        target.classList.contains('timeline-background')) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    console.log(`🔄 TOGGLE ITEM ${id} called`);
    
    // Always set this item as active
    setActiveNodeId(id);
    setAutoRotate(false);

    // Clear all expanded items and set only this one as expanded
    const newExpandedState = { [id]: true };
    setExpandedItems(newExpandedState);

    // Call the callback to update external state
    if (onItemSelect) {
      const selectedItem = timelineData.find(item => item.id === id);
      if (selectedItem) {
        console.log(`🚀 Calling onItemSelect with:`, selectedItem.title);
        onItemSelect(selectedItem);
      }
    }

    // Set pulse effect for related items
    const relatedItems = getRelatedItems(id);
    const newPulseEffect: Record<number, boolean> = {};
    relatedItems.forEach((relId) => {
      newPulseEffect[relId] = true;
    });
    setPulseEffect(newPulseEffect);

    centerViewOnNode(id);
  };

  useEffect(() => {
    let rotationTimer: NodeJS.Timeout;

    if (autoRotate && viewMode === "orbital") {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.3) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate, viewMode]);

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 200;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-gray-900 border-white";
      case "in-progress":
        return "text-black bg-white border-black";
      case "pending":
        return "text-white bg-gray-900/40 border-white/50";
      default:
        return "text-white bg-gray-900/40 border-white/50";
    }
  };

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center bg-transparent overflow-hidden timeline-background relative z-20"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center pointer-events-none"
          ref={orbitRef}
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 animate-pulse flex items-center justify-center z-10 pointer-events-none">
            <div className="absolute w-20 h-20 rounded-full border border-orange-400/30 animate-ping opacity-70 pointer-events-none"></div>
            <div
              className="absolute w-24 h-24 rounded-full border border-orange-400/20 animate-ping opacity-50 pointer-events-none"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md pointer-events-none"></div>
          </div>

          <div className="absolute w-96 h-96 rounded-full border border-orange-400/20 pointer-events-none"></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            // Debug logging for each render
            if (isExpanded) {
              console.log(`🎨 RENDERING EXPANDED: Item ${item.id} (${item.title}) - isExpanded: ${isExpanded}`);
            }

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => (nodeRefs.current[item.id] = el)}
                className="absolute transition-all duration-700 cursor-pointer pointer-events-auto"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`🔥 CLICKED NODE ${item.id}: ${item.title}`);
                  console.log(`📊 Current expandedItems:`, expandedItems);
                  console.log(`🎯 isExpanded before:`, expandedItems[item.id]);
                  toggleItem(item.id);
                }}
              >
                {/* Larger invisible click area */}
                <div className="absolute -inset-4 w-18 h-18 rounded-full"></div>
                <div
                  className={`absolute rounded-full -inset-1 pointer-events-none ${
                    isPulsing ? "animate-pulse duration-1000" : ""
                  }`}
                  style={{
                    background: `radial-gradient(circle, rgba(251,146,60,0.3) 0%, rgba(251,146,60,0) 70%)`,
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                ></div>

                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center relative
                  ${
                    isExpanded
                      ? "bg-orange-500 text-white"
                      : isRelated
                      ? "bg-orange-400/70 text-white"
                      : "bg-gray-900 text-white"
                  }
                  border-2 
                  ${
                    isExpanded
                      ? "border-orange-400 shadow-lg shadow-orange-500/30"
                      : isRelated
                      ? "border-orange-400 animate-pulse"
                      : "border-gray-600/60"
                  }
                  transition-all duration-300 transform
                  ${isExpanded ? "scale-150" : ""}
                  hover:scale-110 hover:border-orange-400
                `}
                >
                  {/* Larger click area */}
                  <div className="absolute inset-0 w-full h-full rounded-full"></div>
                  <Icon size={16} className="relative z-10" />
                </div>

                <div
                  className={`
                  absolute top-12  whitespace-nowrap
                  text-xs font-semibold tracking-wider
                  transition-all duration-300
                  ${isExpanded ? "text-white scale-125" : "text-gray-300"}
                `}
                >
                  {item.title} {isExpanded ? "🔥" : ""}
                </div>

                {/* Original card */}
                {showPopupCards && isExpanded && (
                  <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-gray-900/95 backdrop-blur-lg border-gray-600/40 shadow-xl shadow-gray-900/20 overflow-visible z-[300]">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-gray-500/50"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge
                          className={`px-2 text-xs ${getStatusStyles(
                            item.status
                          )}`}
                        >
                          {item.status === "completed"
                            ? "COMPLETE"
                            : item.status === "in-progress"
                            ? "IN PROGRESS"
                            : "PENDING"}
                        </Badge>
                        <span className="text-xs font-mono text-gray-400">
                          {item.date}
                        </span>
                      </div>
                      <CardTitle className="text-sm mt-2 text-white">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-gray-300">
                      <p>{item.content}</p>

                      <div className="mt-4 pt-3 border-t border-gray-600/30">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="flex items-center text-gray-400">
                            <Zap size={10} className="mr-1" />
                            Energy Level
                          </span>
                          <span className="font-mono text-white">{item.energy}%</span>
                        </div>
                        <div className="w-full h-1 bg-gray-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                            style={{ width: `${item.energy}%` }}
                          ></div>
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-600/30">
                          <div className="flex items-center mb-2">
                            <Link size={10} className="text-gray-400 mr-1" />
                            <h4 className="text-xs uppercase tracking-wider font-medium text-gray-400">
                              Connected Nodes
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find(
                                (i) => i.id === relatedId
                              );
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center h-6 px-2 py-0 text-xs rounded-none border-gray-600/40 bg-transparent hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight
                                    size={8}
                                    className="ml-1 text-gray-400"
                                  />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 