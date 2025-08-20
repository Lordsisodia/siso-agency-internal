import { importRealClaudeUsage } from './server/claudeLogParser.js';

console.log('🚀 SISO IDE - Real Claude Usage Import');
console.log('=====================================');
console.log('');
console.log('This script imports REAL Claude usage data from your ~/.claude/projects/ logs');
console.log('exactly like Claude GUI does - no fake data, only actual API usage.');
console.log('');

async function main() {
  try {
    const result = await importRealClaudeUsage();
    
    if (result.success) {
      console.log('\n🎉 Real usage data import completed successfully!');
      console.log('');
      console.log('📈 Your Usage Dashboard now shows:');
      console.log('   ✅ REAL Claude API costs and token usage');
      console.log('   ✅ Actual project usage from your development work');
      console.log('   ✅ Real session data with proper date ranges');
      console.log('   ✅ Authentic model usage distribution');
      console.log('');
      console.log('🔗 Visit http://localhost:5176/ → Usage tab');
      console.log('   Now displays genuine usage data like Claude GUI!');
      console.log('');
      console.log('📊 Summary of imported data:');
      console.log(`   • ${result.imported} real API calls imported`);
      console.log(`   • $${result.totalCost.toFixed(2)} actual spending tracked`);
      console.log(`   • ${result.totalTokens.toLocaleString()} real tokens processed`);
      console.log(`   • ${result.uniqueProjects} actual projects analyzed`);
      console.log(`   • ${result.uniqueSessions} real Claude sessions`);
    } else {
      console.log('\n❌ No real usage data found');
      console.log('');
      console.log('This means either:');
      console.log('   • No Claude CLI usage logs exist yet');
      console.log('   • Claude logs don\'t contain API response data');
      console.log('   • Usage data is stored in a different format');
      console.log('');
      console.log('💡 To generate real usage data:');
      console.log('   1. Use Claude CLI to have conversations');
      console.log('   2. Real usage will be automatically tracked');
      console.log('   3. Re-run this import script');
    }
  } catch (error) {
    console.error('\n❌ Error importing real usage data:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   • Check that ~/.claude/projects/ directory exists');
    console.log('   • Ensure you have Claude CLI usage history');
    console.log('   • Verify file permissions for reading Claude logs');
  }
}

main();