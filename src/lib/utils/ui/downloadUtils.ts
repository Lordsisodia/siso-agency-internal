
export const downloadTemplate = () => {
  const headers = ['username', 'full_name', 'followers_count', 'following_count', 'posts_count', 'bio', 'profile_url', 'status'];
  const sampleData = ['johndoe', 'John Doe', '1000', '500', '100', 'Digital creator', 'https://instagram.com/johndoe', 'new'];
  
  const csvContent = [
    headers.join(','),
    sampleData.join(',')
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leads_import_template.csv';
  link.click();
};
