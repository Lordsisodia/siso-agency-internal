/**
 * Test database connectivity with real Prisma client
 */

async function testDatabaseConnection() {
  try {
    // Using SQLite for development
    console.log('🔍 Testing SQLite database connection...');
    console.log('Database: ./prisma/dev.db');
    
    // Import the generated Prisma client (ES modules)
    const { PrismaClient } = await import('./generated/prisma/index.js');
    
    const prisma = new PrismaClient({
      log: ['error', 'warn', 'info'],
    });
    
    console.log('✅ Prisma client created');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result);
    
    // Test schema - check if tables exist
    try {
      const userCount = await prisma.user.count();
      console.log('✅ User table accessible, count:', userCount);
    } catch (error) {
      console.log('⚠️ User table test failed:', error.message);
    }
    
    try {
      const taskCount = await prisma.personalTask.count();
      console.log('✅ PersonalTask table accessible, count:', taskCount);
    } catch (error) {
      console.log('⚠️ PersonalTask table test failed:', error.message);
    }
    
    await prisma.$disconnect();
    console.log('✅ Disconnected successfully');
    
    console.log('\n🎉 Database connection test PASSED!');
    
  } catch (error) {
    console.error('❌ Database connection test FAILED:', error);
    console.error('Error details:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUTION: Start PostgreSQL server or use a hosted database:');
      console.log('  • Local: brew install postgresql && brew services start postgresql');
      console.log('  • Hosted: Use Supabase, Neon, or PlanetScale');
      console.log('  • Alternative: Switch to SQLite for development');
    }
    
    process.exit(1);
  }
}

testDatabaseConnection();