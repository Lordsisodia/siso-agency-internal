/**
 * Practical XP Store Rewards - Time-Based Progression System
 * Focus on realistic, time-based rewards that people actually want
 */

import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding practical XP Store rewards...');

  // Clear existing rewards
  await prisma.rewardDefinition.deleteMany({});
  console.log('🧹 Cleared existing rewards');

  const rewards = [
    // 🕐 TIME-BASED DOWNTIME REWARDS (Core Progression)
    {
      category: 'Time',
      name: '30min Downtime',
      description: 'Guilt-free relaxation, phone scrolling, or doing nothing',
      basePrice: 25,  // Very accessible - about 1 small task
      iconEmoji: '⏳',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 4
    },
    {
      category: 'Time',
      name: '1 Hour Downtime',
      description: 'Extended break time - nap, games, Netflix, whatever you want',
      basePrice: 50,  // 1 medium task
      iconEmoji: '🛋️',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 3
    },
    {
      category: 'Time',
      name: '2 Hour Session',
      description: 'Long relaxation block - gaming, series binge, creative time',
      basePrice: 100, // 2 medium tasks
      iconEmoji: '🎮',
      availabilityWindow: 'AFTERNOON_EVENING',
      maxDailyUse: 2
    },
    {
      category: 'Time',
      name: '4 Hour Block',
      description: 'Half-day off - major relaxation, hobby time, social activities',
      basePrice: 200, // 4 medium tasks
      iconEmoji: '🏖️',
      availabilityWindow: 'AFTERNOON_EVENING',
      maxDailyUse: 1
    },
    {
      category: 'Time',
      name: 'Full Day Off',
      description: 'Complete day of freedom - no work, pure relaxation and fun',
      basePrice: 500, // 10 medium tasks - big commitment
      iconEmoji: '🏝️',
      availabilityWindow: 'WEEKEND',
      maxDailyUse: 1
    },

    // 🌿 CANNABIS/SMOKE REWARDS (Responsible Management)
    {
      category: 'Cannabis',
      name: 'Quick Smoke',
      description: '15-30min smoke break - micro-dose for creativity or stress relief',
      basePrice: 75,  // 1.5 tasks - makes you think twice
      iconEmoji: '🌱',
      availabilityWindow: 'EVENING',
      maxDailyUse: 2,
      requiresStreak: 1 // Must have 1+ productive day
    },
    {
      category: 'Cannabis',
      name: 'Smoke Session',
      description: '1-2 hour smoke session with games, music, or relaxation',
      basePrice: 150, // 3 tasks
      iconEmoji: '💨',
      availabilityWindow: 'EVENING',
      maxDailyUse: 1,
      requiresStreak: 2 // Must have 2+ productive days
    },
    {
      category: 'Cannabis',
      name: 'Weekend Smoke Up',
      description: 'Full weekend cannabis freedom - sessions, edibles, whatever',
      basePrice: 400, // 8 tasks - premium reward
      iconEmoji: '🔥',
      availabilityWindow: 'WEEKEND',
      maxDailyUse: 1,
      requiresStreak: 5 // Must have productive week
    },

    // 🎯 ACTIVITY REWARDS (Experiences)
    {
      category: 'Activity',
      name: 'Takeout Meal',
      description: 'Order your favorite food instead of cooking',
      basePrice: 60, // Just over 1 task
      iconEmoji: '🍕',
      availabilityWindow: 'LUNCH_DINNER',
      maxDailyUse: 1
    },
    {
      category: 'Activity',
      name: 'Movie Experience',
      description: 'Cinema trip or premium streaming movie night with snacks',
      basePrice: 120, // 2.5 tasks
      iconEmoji: '🎬',
      availabilityWindow: 'EVENING_WEEKEND',
      maxDailyUse: 1
    },
    {
      category: 'Activity',
      name: 'Social Activity',
      description: 'Drinks with friends, dinner out, event or concert',
      basePrice: 250, // 5 tasks
      iconEmoji: '🍻',
      availabilityWindow: 'EVENING_WEEKEND',
      maxDailyUse: 1
    },
    {
      category: 'Activity',
      name: 'Day Adventure',
      description: 'Full day activity - hiking, beach, city exploration, museums',
      basePrice: 350, // 7 tasks
      iconEmoji: '🗺️',
      availabilityWindow: 'WEEKEND',
      maxDailyUse: 1
    },
    {
      category: 'Activity',
      name: 'Weekend Getaway',
      description: '2-3 day trip or luxury experience - hotels, travel, adventure',
      basePrice: 800, // 16 tasks - major commitment
      iconEmoji: '✈️',
      availabilityWindow: 'WEEKEND',
      maxDailyUse: 1,
      requiresStreak: 10 // Must have very productive period
    },

    // 🛍️ MATERIAL REWARDS (Tangible Purchases)
    {
      category: 'Shopping',
      name: 'Small Treat',
      description: 'Coffee, snack, small purchase under $20',
      basePrice: 40, // Less than 1 task
      iconEmoji: '☕',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 2
    },
    {
      category: 'Shopping',
      name: 'Medium Purchase',
      description: 'Clothing, book, accessory, or item under $100',
      basePrice: 180, // 3.5 tasks
      iconEmoji: '👕',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 1
    },
    {
      category: 'Shopping',
      name: 'Big Purchase',
      description: 'Electronics, expensive item, or splurge purchase',
      basePrice: 600, // 12 tasks - serious commitment
      iconEmoji: '💎',
      availabilityWindow: 'ANYTIME',
      maxDailyUse: 1,
      requiresStreak: 7
    },

    // 🎮 ENTERTAINMENT REWARDS
    {
      category: 'Entertainment',
      name: 'Gaming Hour',
      description: '1 hour of guilt-free gaming',
      basePrice: 45,
      iconEmoji: '🎮',
      availabilityWindow: 'AFTERNOON_EVENING',
      maxDailyUse: 3
    },
    {
      category: 'Entertainment',
      name: 'Binge Session',
      description: '3+ hours of Netflix, YouTube, or entertainment',
      basePrice: 130,
      iconEmoji: '📺',
      availabilityWindow: 'EVENING_WEEKEND',
      maxDailyUse: 1
    },

    // 💤 COMFORT REWARDS
    {
      category: 'Comfort',
      name: 'Sleep In',
      description: 'No alarm, sleep as long as you want tomorrow',
      basePrice: 80,
      iconEmoji: '😴',
      availabilityWindow: 'EVENING',
      maxDailyUse: 1
    },
    {
      category: 'Comfort',
      name: 'Lazy Morning',
      description: 'No productivity pressure until noon tomorrow',
      basePrice: 90,
      iconEmoji: '🌅',
      availabilityWindow: 'EVENING',
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

  console.log(`✅ Created ${rewards.length} practical rewards across categories:`);
  
  // Show category breakdown with price ranges
  const categories = rewards.reduce((acc, reward) => {
    if (!acc[reward.category]) {
      acc[reward.category] = { count: 0, minPrice: Infinity, maxPrice: 0 };
    }
    acc[reward.category].count += 1;
    acc[reward.category].minPrice = Math.min(acc[reward.category].minPrice, reward.basePrice);
    acc[reward.category].maxPrice = Math.max(acc[reward.category].maxPrice, reward.basePrice);
    return acc;
  }, {} as Record<string, { count: number, minPrice: number, maxPrice: number }>);
  
  Object.entries(categories).forEach(([category, data]) => {
    console.log(`   ${category}: ${data.count} rewards (${data.minPrice}-${data.maxPrice} XP)`);
  });

  console.log('\n🎯 Reward Economy Design:');
  console.log('   💡 Time-based progression: 30min → 1hr → 2hr → 4hr → Full day');
  console.log('   🌿 Cannabis rewards require productive streaks (1-5 days)');
  console.log('   🎯 Activities range from simple (60 XP) to premium (800+ XP)');
  console.log('   ⏰ Time restrictions prevent overuse (evening/weekend only)');
  console.log('   📊 Price range: 25-800 XP for balanced progression');
  console.log('   🔄 Daily limits maintain healthy balance');

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