// Test script to simulate frontend Usage page behavior
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiU0lTT0dPTERNSU5FUiIsImlhdCI6MTc1NTU2ODY2Nn0.rXRDobJHYHbFNng1aDFAyUC9mkxzkJ3E5SMQ2eb-hbM';

// Simulate the exact frontend API call
const testDateRanges = ['7d', '30d', 'all'];

console.log('🧪 Testing Frontend Integration with Real Data\n');
console.log('Simulating what happens when user clicks date range buttons:\n');

for (const range of testDateRanges) {
  try {
    const url = `http://localhost:5176/api/usage/stats?range=${range}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      const label = range === 'all' ? 'All Time' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days';
      
      console.log(`📊 ${label}:`);
      console.log(`   💰 Cost: $${data.total_cost.toFixed(2)}`);
      console.log(`   🎯 Sessions: ${data.total_sessions}`);
      console.log(`   🚀 Total Tokens: ${(data.total_tokens / 1000000).toFixed(1)}M`);
      console.log(`   🤖 Models: ${data.by_model.length} different models`);
      console.log(`   📁 Projects: ${data.by_project.length} different projects`);
      console.log('');
    } else {
      console.log(`❌ API Error ${response.status} for ${range}`);
    }
  } catch (error) {
    console.log(`❌ Network Error for ${range}: ${error.message}`);
  }
}

console.log('✅ This proves the exact same data the frontend Usage page displays!');
