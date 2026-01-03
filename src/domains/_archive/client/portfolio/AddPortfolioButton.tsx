
import { Button } from '@/components/ui/button';
import { useAddPortfolioProjects } from '@/domains/projects/hooks/useAddPortfolioProjects';

export const AddPortfolioButton = () => {
  const { addProjects } = useAddPortfolioProjects();

  return (
    <Button 
      onClick={addProjects}
      variant="outline"
      className="mb-4"
    >
      Add Sample Projects
    </Button>
  );
};
