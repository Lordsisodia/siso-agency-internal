
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Sidebar } from '@/components/Sidebar';

const DailyNews = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen bg-siso-bg">
      <Helmet>
        <title>Daily AI News | Your One-Stop AI Knowledge Source</title>
        <meta name="description" content="Stay updated with the latest news in artificial intelligence, machine learning, and AI tools." />
      </Helmet>
      
      <Sidebar />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20">
        <h1 className="text-3xl font-bold mb-6">Daily News</h1>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">News content will be available soon.</p>
        </div>
      </main>
    </div>
  );
};

export default DailyNews;
