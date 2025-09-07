import * as React from "react"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonCtaProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    className?: string;
}

function ButtonCta({ label = "Get Access", className, ...props }: ButtonCtaProps) {
    return (
        <Button
            variant="ghost"
            className={cn(
                "group relative w-1/2 h-12 px-4 rounded-lg overflow-hidden transition-all duration-500",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-b from-[#FF8A65] via-[#FF5722] to-[#FFA726]">
                <div className="absolute inset-0 bg-[#FF5722]/10 rounded-lg opacity-90" />
            </div>

            <div className="absolute inset-[2px] bg-[#FF5722]/5 rounded-lg opacity-95" />

            <div className="absolute inset-[2px] bg-gradient-to-r from-[#FF5722]/10 via-[#FF7043]/20 to-[#FF5722]/10 rounded-lg opacity-90" />
            <div className="absolute inset-[2px] bg-gradient-to-b from-[#FF8A65]/40 via-[#FF5722]/30 to-[#FFA726]/30 rounded-lg opacity-80" />
            <div className="absolute inset-[2px] bg-gradient-to-br from-[#FFB74D]/10 via-[#FF7043]/20 to-[#FF5722]/50 rounded-lg" />

            <div className="absolute inset-[2px] shadow-[inset_0_0_15px_rgba(255,87,34,0.3)] rounded-lg" />

            <div className="relative flex items-center justify-center gap-2">
                <span className="text-lg font-light bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,87,34,0.4)] tracking-tighter">
                    {label}
                </span>
            </div>

            <div className="absolute inset-[2px] opacity-0 transition-opacity duration-300 bg-gradient-to-r from-[#FF5722]/20 via-[#FFA726]/10 to-[#FF5722]/20 group-hover:opacity-100 rounded-lg" />
        </Button>
    );
}

export { ButtonCta }