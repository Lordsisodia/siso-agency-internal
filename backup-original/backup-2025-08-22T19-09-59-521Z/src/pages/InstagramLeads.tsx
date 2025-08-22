
import { InstagramLeadForm } from '@/components/instagram/InstagramLeadForm';
import { InstagramLeadList } from '@/components/instagram/InstagramLeadList';

export default function InstagramLeads() {
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">Instagram Leads</h1>
      <InstagramLeadForm />
      <InstagramLeadList />
    </div>
  );
}
