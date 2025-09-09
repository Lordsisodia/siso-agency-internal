
import { Button } from '@/shared/ui/button';
import { useAddPortfolioProjects } from '@/shared/hooks/useAddPortfolioProjects';

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
