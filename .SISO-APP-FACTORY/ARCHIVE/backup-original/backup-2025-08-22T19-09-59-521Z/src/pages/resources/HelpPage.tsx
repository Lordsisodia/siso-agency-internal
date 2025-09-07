
import { AppLayout } from "@/components/layout/AppLayout";
import { HelpNavigation } from "@/components/help/HelpNavigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";
import { GettingStartedContent } from "@/components/help/content/GettingStartedContent";
import { DocumentationContent } from "@/components/help/content/DocumentationContent";
import { FAQContent } from "@/components/help/content/FAQContent";

export default function HelpPage() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const getContent = () => {
    const path = location.pathname;
    if (path.includes('/getting-started')) {
      return <GettingStartedContent />;
    } else if (path.includes('/documentation')) {
      return <DocumentationContent />;
    } else if (path.includes('/faq')) {
      return <FAQContent />;
    }
    // Default to Getting Started
    return <GettingStartedContent />;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/resources">Resources</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/resources/help">Help Center</BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.length > 2 && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink className="capitalize">
                    {pathSegments[pathSegments.length - 1].replace(/-/g, ' ')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <HelpNavigation />
          </div>
          <div className="flex-1">
            {getContent()}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
