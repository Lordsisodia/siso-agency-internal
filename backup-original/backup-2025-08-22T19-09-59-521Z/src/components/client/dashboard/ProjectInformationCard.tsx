
import { AnimatedCard } from "@/components/ui/animated-card";

interface ProjectInformationCardProps {
  projectName: string | null;
  companyName: string | null;
  companyNiche: string | null;
  websiteUrl: string | null;
}

export function ProjectInformationCard({
  projectName,
  companyName,
  companyNiche,
  websiteUrl,
}: ProjectInformationCardProps) {
  return (
    <AnimatedCard className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Project Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400">Project Name</p>
          <p className="font-medium">{projectName || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Company</p>
          <p className="font-medium">{companyName || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Industry/Niche</p>
          <p className="font-medium">{companyNiche || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Website</p>
          <p className="font-medium">
            {websiteUrl ? (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                {websiteUrl}
              </a>
            ) : (
              "N/A"
            )}
          </p>
        </div>
      </div>
    </AnimatedCard>
  );
}
