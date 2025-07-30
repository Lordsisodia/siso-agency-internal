import { MoveDownLeft, MoveUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function Stats() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge className="bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20">
                Platform
              </Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-xl md:text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular text-left text-white">
                Building the future of 
                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  {" "}web solutions
                </span>
              </h2>
              <p className="text-lg lg:max-w-sm leading-relaxed tracking-tight text-gray-300 text-left">
                SISO delivers lightning-fast web applications and MVPs in just 48 hours. 
                Our proven process helps agencies scale their offerings while maintaining 
                quality and client satisfaction.
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="grid text-left grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 w-full gap-2">
              <div className="flex gap-0 flex-col justify-between p-6 border border-gray-800 rounded-md bg-gray-900/50 backdrop-blur-sm hover:border-orange-500/30 transition-colors">
                <MoveUpRight className="w-4 h-4 mb-10 text-orange-400" />
                <h2 className="text-4xl tracking-tighter max-w-xl text-left font-regular flex flex-row gap-4 items-end text-white">
                  150+
                  <span className="text-gray-400 text-sm tracking-normal">
                    +25%
                  </span>
                </h2>
                <p className="text-base leading-relaxed tracking-tight text-gray-400 max-w-xl text-left">
                  Active Partners
                </p>
              </div>
              <div className="flex gap-0 flex-col justify-between p-6 border border-gray-800 rounded-md bg-gray-900/50 backdrop-blur-sm hover:border-orange-500/30 transition-colors">
                <MoveUpRight className="w-4 h-4 mb-10 text-orange-400" />
                <h2 className="text-4xl tracking-tighter max-w-xl text-left font-regular flex flex-row gap-4 items-end text-white">
                  2,500+
                  <span className="text-gray-400 text-sm tracking-normal">
                    +15%
                  </span>
                </h2>
                <p className="text-base leading-relaxed tracking-tight text-gray-400 max-w-xl text-left">
                  Projects Delivered
                </p>
              </div>
              <div className="flex gap-0 flex-col justify-between p-6 border border-gray-800 rounded-md bg-gray-900/50 backdrop-blur-sm hover:border-orange-500/30 transition-colors">
                <MoveUpRight className="w-4 h-4 mb-10 text-orange-400" />
                <h2 className="text-4xl tracking-tighter max-w-xl text-left font-regular flex flex-row gap-4 items-end text-white">
                  98%
                  <span className="text-gray-400 text-sm tracking-normal">
                    +2%
                  </span>
                </h2>
                <p className="text-base leading-relaxed tracking-tight text-gray-400 max-w-xl text-left">
                  Client Satisfaction
                </p>
              </div>
              <div className="flex gap-0 flex-col justify-between p-6 border border-gray-800 rounded-md bg-gray-900/50 backdrop-blur-sm hover:border-orange-500/30 transition-colors">
                <MoveDownLeft className="w-4 h-4 mb-10 text-green-400" />
                <h2 className="text-4xl tracking-tighter max-w-xl text-left font-regular flex flex-row gap-4 items-end text-white">
                  48hrs
                  <span className="text-gray-400 text-sm tracking-normal">
                    -20%
                  </span>
                </h2>
                <p className="text-base leading-relaxed tracking-tight text-gray-400 max-w-xl text-left">
                  Average Delivery Time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Stats };