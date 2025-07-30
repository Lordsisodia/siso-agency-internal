import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import UserFlowPage from './projects/UserFlowPage';

export default function UserFlow() {
  const { projectId } = useParams<{ projectId: string }>();
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <UserFlowPage />
      </div>
    </AppLayout>
  );
}
