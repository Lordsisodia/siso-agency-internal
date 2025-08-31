/**
 * Quick fix - Add missing user to database
 * 
 * The frontend is authenticated as user_31c4PuaPdFf9abejhmzrN9kcill
 * but this user doesn't exist in our database yet.
 */

import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function createMissingUser() {
  try {
    const userId = 'user_31c4PuaPdFf9abejhmzrN9kcill';
    const email = 'fuzeheritage@gmail.com';
    
    console.log(`🔍 Checking if user ${userId} exists...`);
    
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (existingUser) {
      console.log(`✅ User already exists: ${existingUser.email}`);
      return;
    }
    
    console.log(`➕ Creating user: ${userId}`);
    
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        supabaseId: userId, // Use the same ID for simplicity
        email: email,
        displayName: 'Shaan Sisodia',
        role: 'ADMIN'
      }
    });
    
    console.log(`✅ User created successfully:`);
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Display Name: ${newUser.displayName}`);
    console.log(`   Role: ${newUser.role}`);
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingUser();