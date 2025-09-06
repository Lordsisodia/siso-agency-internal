/**
 * Database Seed Script for XP Store
 * Creates realistic rewards for the psychology-optimized XP spending system
 */

import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding XP Store database...');

  // Clear existing rewards (be careful in production!)
  await prisma.rewardDefinition.deleteMany({});
  console.log('🧹 Cleared existing rewards');

  // Seed reward categories with psychology-optimized pricing
  const rewards = [
    // 🍔 FOOD & TREATS (Low-Medium Price - Instant Gratification)
    {
      category: 'Food',
      name: 'Premium Coffee',
      description: 'Guilt-free artisan coffee or fancy latte',
      basePrice: 100,
      iconEmoji: '☕',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 3
    },
    {
      category: 'Food', 
      name: 'Dessert Indulgence',
      description: 'Ice cream, pastry, or your favorite sweet treat',
      basePrice: 150,
      iconEmoji: '🍰',
      availabilityWindow: 'AFTERNOON_EVENING',
      maxDailyUse: 1
    },
    {
      category: 'Food',
      name: 'Takeout Meal',
      description: 'Order your favorite meal without cooking',
      basePrice: 300,
      iconEmoji: '🍕',
      availabilityWindow: 'LUNCH_DINNER',
      maxDailyUse: 1
    },
    {
      category: 'Food',
      name: 'Fancy Restaurant',
      description: 'Nice dinner out or premium food experience',
      basePrice: 800,
      iconEmoji: '🍽️',
      availabilityWindow: 'EVENING',
      maxDailyUse: 1
    },

    // 🎮 ENTERTAINMENT (Medium Price - Variable Timing)
    {
      category: 'Entertainment',
      name: 'Gaming Session',
      description: '2-hour guilt-free gaming time',
      basePrice: 200,
      iconEmoji: '🎮',
      availabilityWindow: 'EVENING',
      maxDailyUse: 1
    },
    {
      category: 'Entertainment',
      name: 'Movie Night',
      description: 'Movie at home or cinema with snacks',
      basePrice: 250,
      iconEmoji: '🎬',
      availabilityWindow: 'EVENING',
      maxDailyUse: 1
    },
    {
      category: 'Entertainment',
      name: 'Streaming Binge',
      description: '4+ hours of Netflix/YouTube guilt-free',
      basePrice: 350,
      iconEmoji: '📺',
      availabilityWindow: 'WEEKEND',
      maxDailyUse: 1
    },
    {
      category: 'Entertainment',
      name: 'Concert/Event Ticket',
      description: 'Live music, comedy show, or entertainment event',
      basePrice: 1000,
      iconEmoji: '🎵',
      availabilityWindow: 'WEEKEND',
      maxDailyUse: 1
    },

    // 🌿 CANNABIS (Medium-High Price - Psychology Focus)
    {
      category: 'Cannabis',
      name: 'Evening Joint',
      description: 'Relaxing cannabis session after productive day',
      basePrice: 180,
      iconEmoji: '🌿',
      availabilityWindow: 'EVENING',
      maxDailyUse: 1,
      requiresStreak: 1 // Must have 1+ day streak
    },
    {
      category: 'Cannabis',
      name: 'Weekend Session',
      description: 'Extended cannabis relaxation session',
      basePrice: 400,
      iconEmoji: '🍃',
      availabilityWindow: 'WEEKEND',
      maxDailyUse: 1,
      requiresStreak: 3 // Must have 3+ day streak
    },
    {
      category: 'Cannabis',
      name: 'Premium Experience',
      description: 'High-quality cannabis with special setup',
      basePrice: 600,
      iconEmoji: '✨',
      availabilityWindow: 'WEEKEND',
      maxDailyUse: 1,
      requiresStreak: 7 // Must have 1+ week streak
    },

    // 🛍️ SHOPPING (Variable Price - Material Rewards)
    {
      category: 'Shopping',
      name: 'Small Purchase',
      description: 'Book, app, small accessory, or impulse buy',
      basePrice: 200,
      iconEmoji: '📚',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 2
    },
    {
      category: 'Shopping',
      name: 'Clothing Item',
      description: 'New shirt, shoes, or fashion accessory',
      basePrice: 500,
      iconEmoji: '👕',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 1
    },
    {
      category: 'Shopping',
      name: 'Tech Gadget',
      description: 'Headphones, accessories, or small electronics',
      basePrice: 800,
      iconEmoji: '🎧',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 1
    },
    {
      category: 'Shopping',
      name: 'Major Purchase',
      description: 'Expensive item you\'ve been wanting',
      basePrice: 2000,
      iconEmoji: '💎',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 1
    },

    // 🎯 EXPERIENCES (High Price - Memorable Rewards)
    {
      category: 'Experience',
      name: 'Massage/Spa',
      description: 'Professional massage or spa treatment',
      basePrice: 600,
      iconEmoji: '💆',
      availabilityWindow: 'WEEKEND',
      maxDailyUse: 1
    },
    {
      category: 'Experience',
      name: 'Day Trip',
      description: 'Explore new place or fun day out',
      basePrice: 800,
      iconEmoji: '🚗',
      availabilityWindow: 'WEEKEND',
      maxDailyUse: 1
    },
    {
      category: 'Experience',
      name: 'Weekend Getaway',
      description: 'Short vacation or travel experience',
      basePrice: 1500,
      iconEmoji: '🏖️',
      availabilityWindow: 'WEEKEND',
      maxDailyUse: 1,
      requiresStreak: 14 // Must have 2+ week streak
    },

    // ⏰ TIME REWARDS (Medium Price - Time-based)
    {
      category: 'Time',
      name: 'Sleep In',
      description: 'No alarm, sleep as long as you want',
      basePrice: 150,
      iconEmoji: '😴',
      availabilityWindow: 'MORNING',
      maxDailyUse: 1
    },
    {
      category: 'Time',
      name: 'Lazy Afternoon',
      description: '3+ hours of complete relaxation',
      basePrice: 300,
      iconEmoji: '🛋️',
      availabilityWindow: 'AFTERNOON',
      maxDailyUse: 1
    },
    {
      category: 'Time',
      name: 'Full Rest Day',
      description: 'Entire day off from productivity',
      basePrice: 800,
      iconEmoji: '🏝️',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 1
    },

    // 🎲 SPECIAL REWARDS (Psychology Bonuses)
    {
      category: 'Special',
      name: 'Surprise Reward',
      description: 'Mystery reward chosen for you',
      basePrice: 300,
      iconEmoji: '🎁',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 1
    },
    {
      category: 'Special',
      name: 'Double XP Day',
      description: 'Next day all tasks give 2x XP',
      basePrice: 500,
      iconEmoji: '⚡',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 1
    }
  ];

  // Insert rewards
  for (const reward of rewards) {
    await prisma.rewardDefinition.create({
      data: {
        category: reward.category,
        name: reward.name,
        description: reward.description,
        basePrice: reward.basePrice,
        iconEmoji: reward.iconEmoji,
        availabilityWindow: reward.availabilityWindow,
        maxDailyUse: reward.maxDailyUse || 1,
        requiresStreak: reward.requiresStreak || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  console.log(`✅ Created ${rewards.length} rewards across categories:`);
  
  // Show category breakdown
  const categories = rewards.reduce((acc, reward) => {
    acc[reward.category] = (acc[reward.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} rewards`);
  });

  console.log('\n🎯 Psychology Features:');
  console.log('   • Streak requirements for premium rewards');
  console.log('   • Time-based availability windows');
  console.log('   • Daily usage limits for balance');
  console.log('   • Price ranges: 100-2000 XP');
  console.log('   • Categories optimized for different motivations');
  console.log('   • Psychology-based reward pricing tiers');

  console.log('\n🌱 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });