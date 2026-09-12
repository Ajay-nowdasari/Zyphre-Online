import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Life RPG Database...');

  // Clean existing demo user if exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@liferpg.dev' },
  });

  if (existingUser) {
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const demoHero = await prisma.user.create({
    data: {
      email: 'demo@liferpg.dev',
      username: 'CyberVanguard',
      passwordHash,
      level: 1,
      currentXp: 40,
      currentGold: 180,
      lifetimeGold: 180,
      streakCount: 3,
      streakFreezeCount: 2,
      unspentStatPoints: 3,
      activeTheme: 'CYBERPUNK',
      attributes: {
        create: {
          intellect: 14,
          strength: 12,
          vitality: 11,
          charisma: 13,
        },
      },
      inventory: {
        create: [
          {
            itemKey: 'THEME_CYBERPUNK',
            name: 'Cyberpunk Neon Theme',
            category: 'THEME',
            isEquipped: true,
          },
          {
            itemKey: 'GEAR_CYBER_KATANA',
            name: 'Plasma Cyber-Katana',
            category: 'GEAR',
            isEquipped: true,
          },
        ],
      },
      quests: {
        create: [
          {
            title: 'Neural Architecture Design',
            description: 'Refactor core service layer and architect clean modular interfaces for 60 mins.',
            difficulty: 'EPIC',
            targetAttribute: 'INTELLECT',
            rewardXp: 400,
            rewardGold: 250,
            recurrence: 'ONE_TIME',
            status: 'PENDING',
          },
          {
            title: 'Iron Temple Deadlifts & Squats',
            description: 'Execute high-intensity compound resistance training protocol.',
            difficulty: 'HARD',
            targetAttribute: 'STRENGTH',
            rewardXp: 200,
            rewardGold: 100,
            recurrence: 'DAILY',
            status: 'PENDING',
          },
          {
            title: 'Cellular Restoration Protocol',
            description: 'Complete 20 minutes of restorative breathwork and cold exposure.',
            difficulty: 'EASY',
            targetAttribute: 'VITALITY',
            rewardXp: 50,
            rewardGold: 20,
            recurrence: 'DAILY',
            status: 'PENDING',
          },
          {
            title: 'Guild Alliance Outreach',
            description: 'Connect with 2 engineering leaders and share knowledge in discord guild.',
            difficulty: 'MEDIUM',
            targetAttribute: 'CHARISMA',
            rewardXp: 100,
            rewardGold: 50,
            recurrence: 'WEEKLY',
            status: 'PENDING',
          },
          {
            title: 'Calisthenics Core Blast',
            description: 'Perform 100 pushups and 5-minute plank variations.',
            difficulty: 'EASY',
            targetAttribute: 'STRENGTH',
            rewardXp: 50,
            rewardGold: 20,
            recurrence: 'DAILY',
            status: 'COMPLETED',
            completedAt: new Date(Date.now() - 3600 * 1000 * 4),
          },
        ],
      },
      customRewards: {
        create: [
          {
            title: '1 Hour Cyberpunk 2077 Session',
            description: 'Explore Night City with pure immersion after checking off all dailies.',
            cost: 100,
            icon: 'Gamepad2',
          },
          {
            title: 'Artisan Matcha Latte & Pastry',
            description: 'High-grade focus fuel at the neighborhood cafe.',
            cost: 60,
            icon: 'Coffee',
          },
          {
            title: 'Sci-Fi Novel Reading Evening',
            description: 'Relax with 2 uninterrupted chapters of hard sci-fi.',
            cost: 40,
            icon: 'BookOpen',
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded demo user: ${demoHero.email} (password: password123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
