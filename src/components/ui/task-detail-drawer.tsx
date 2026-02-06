"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { motion, AnimatePresence } from "framer-motion";
import { X, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm", className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  theme?: "light" | "deep" | "amber";
  showHandle?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
}

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, children, theme = "light", showHandle = true, showCloseButton = true, onClose, ...props }, ref) => {
  // Theme colors matching the app
  const themeStyles = {
    light: {
      gradient: "from-emerald-950/95 via-slate-950/98 to-slate-950/95",
      border: "border-emerald-500/20",
      handle: "bg-emerald-400/30",
      accent: "text-emerald-400",
      closeBg: "bg-emerald-500/10 hover:bg-emerald-500/20",
    },
    deep: {
      gradient: "from-blue-950/95 via-slate-950/98 to-slate-950/95",
      border: "border-blue-500/20",
      handle: "bg-blue-400/30",
      accent: "text-blue-400",
      closeBg: "bg-blue-500/10 hover:bg-blue-500/20",
    },
    amber: {
      gradient: "from-amber-950/95 via-slate-950/98 to-slate-950/95",
      border: "border-amber-500/20",
      handle: "bg-amber-400/30",
      accent: "text-amber-400",
      closeBg: "bg-amber-500/10 hover:bg-amber-500/20",
    },
  };

  const styles = themeStyles[theme];

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex h-[90vh] flex-col rounded-t-3xl border-t",
          "bg-gradient-to-b",
          styles.gradient,
          styles.border,
          "backdrop-blur-2xl",
          "shadow-[0_-20px_60px_rgba(0,0,0,0.5)]",
          className
        )}
        {...props}
      >
        {/* Drag Handle */}
        {showHandle && (
          <div className="flex flex-col items-center pt-3 pb-2">
            <div className={cn("w-12 h-1.5 rounded-full", styles.handle)} />
          </div>
        )}

        {/* Close Button */}
        {showCloseButton && onClose && (
          <motion.button
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "absolute top-4 right-4 z-50 p-2 rounded-full",
              "transition-colors duration-200",
              styles.closeBg,
              styles.accent
            )}
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col gap-2 p-6 pb-4",
      "border-b border-white/5",
      className
    )}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-auto flex flex-col gap-3 p-6 pt-4",
      "border-t border-white/5",
      "bg-gradient-to-t from-black/20 to-transparent",
      className
    )}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-tight tracking-tight text-white",
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-white/60 leading-relaxed", className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
