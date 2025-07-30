
import { lazy, Suspense, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ResourceHubProps } from "./types";
import { TabHeader } from "./TabHeader";
import { TabNavigation } from "./TabNavigation";

// Lazy load TabContent for better initial load performance
const TabContent = lazy(() => import("./TabContent").then(mod => ({ default: mod.TabContent })));

export const ResourceHub = ({
  badge = "SISO Agency",
  heading = "Resource Hub Features",
  description = "Access our comprehensive suite of tools and insights designed to accelerate your agency's growth.",
  tabs = []
}: ResourceHubProps) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.value || "");
  const activeTabData = tabs.find(tab => tab.value === activeTab);

  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-radial from-siso-orange/10 via-transparent to-transparent opacity-30" />

      <div className="relative">
        <div className="container mx-auto px-4 md:px-6">
          <TabHeader 
            badge={badge}
            heading={heading}
            description={description}
          />

          <div className="mt-12">
            <div className="container max-w-7xl mx-auto px-6 lg:px-8">
              <TabNavigation 
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              <AnimatePresence mode="wait">
                {activeTabData && (
                  <Suspense 
                    fallback={
                      <div className="flex items-center justify-center h-[400px]">
                        <div className="w-8 h-8 border-2 border-siso-orange border-t-transparent rounded-full animate-spin" />
                      </div>
                    }
                  >
                    <TabContent tab={activeTabData} />
                  </Suspense>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
