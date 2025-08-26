import { ClerkUserSync } from '../ai-first/core/auth.service.js';

async function testUserCreation() {
  console.log('🧪 Testing User Creation Fix...\n');
  
  // Simulate a Clerk user signing in
  const mockClerkUser = {
    id: 'test-clerk-user-' + Date.now(),
    emailAddresses: [
      { emailAddress: 'testuser@example.com' }
    ],
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'https://images.clerk.dev/test.png'
  };
  
  try {
    console.log('🔄 Attempting to sync user to database...');
    const result = await ClerkUserSync.getOrCreateUser(mockClerkUser);
    
    if (result) {
      console.log('✅ User sync successful!');
      console.log('   Database ID:', result.id);
      console.log('   Email:', result.email);
      console.log('   Clerk ID:', result.supabaseId);
      console.log('');
      
      // Now test if we can create a task for this user
      console.log('🔄 Testing task creation for new user...');
      
      const { PrismaClient } = await import('../generated/prisma/index.js');
      const prisma = new PrismaClient();
      
      try {
        const testTask = await prisma.personalTask.create({
          data: {
            userId: result.id,
            title: 'Test Task After User Creation',
            description: 'This task should save correctly',
            workType: 'MORNING',
            priority: 'HIGH',
            currentDate: new Date().toISOString().split('T')[0],
            originalDate: new Date().toISOString().split('T')[0],
            timeEstimate: '10 min',
            estimatedDuration: 10
          }
        });
        
        console.log('✅ Task creation successful!');
        console.log('   Task ID:', testTask.id);
        console.log('   Task Title:', testTask.title);
        console.log('');
        
        // Toggle completion to test that functionality
        console.log('🔄 Testing task completion toggle...');
        const updatedTask = await prisma.personalTask.update({
          where: { id: testTask.id },
          data: { completed: true, completedAt: new Date() }
        });
        
        console.log('✅ Task completion toggle successful!');
        console.log('   Completed:', updatedTask.completed);
        console.log('');
        
        // Cleanup
        console.log('🧹 Cleaning up test data...');
        await prisma.personalTask.delete({ where: { id: testTask.id } });
        await prisma.user.delete({ where: { id: result.id } });
        console.log('✅ Cleanup completed\n');
        
      } finally {
        await prisma.$disconnect();
      }
      
      console.log('🎉 ALL TESTS PASSED!');
      console.log('The database persistence issue should now be fixed!');
      
    } else {
      console.log('❌ User sync failed - returned null');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserCreation();