"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

function Case() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const timer = setTimeout(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0);
        api.scrollTo(0);
      } else {
        api.scrollNext();
        setCurrent(current + 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [api, current]);

  return (
    <div className="w-full py-12">
      <div className="container mx-auto">
        <div className="flex flex-col gap-8">
          <h2 className="text-xl md:text-3xl lg:text-5xl tracking-tighter lg:max-w-xl font-regular text-left text-white ml-[5rem]">
            Powered by thousands of innovators worldwide
          </h2>
          <Carousel 
            setApi={setApi} 
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {Array.from({ length: 15 }).map((_, index) => (
                <CarouselItem 
                  key={index}
                  className={cn(
                    "basis-1/2 md:basis-1/3 lg:basis-1/4",
                    "pl-4 md:pl-6 lg:pl-8"
                  )}
                >
                  <div className="flex rounded-md aspect-square bg-muted/10 backdrop-blur-sm items-center justify-center p-6">
                    <span className="text-sm text-white/70">Logo {index + 1}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}

export { Case };