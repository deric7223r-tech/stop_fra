import { db, packages } from './index';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Check if packages already exist
    const existingPackages = await db.select().from(packages);
    
    if (existingPackages.length > 0) {
      console.log('✅ Packages already seeded:', existingPackages.length);
      return;
    }

    // Insert packages
    const seedPackages = [
      {
        packageType: 'health-check' as const,
        name: 'Package 1: Basic Health Check',
        description: 'Essential fraud risk assessment and basic reporting',
        price: '500.00',
        maxKeypassesDefault: 1,
        features: {
          basic_report: true,
          health_check: true,
        },
        active: true,
      },
      {
        packageType: 'with-awareness' as const,
        name: 'Package 2: Health Check + Training',
        description: 'Comprehensive assessment with employee awareness training',
        price: '1500.00',
        maxKeypassesDefault: 10,
        features: {
          training: true,
          health_check: true,
          employee_assessments: 10,
        },
        active: true,
      },
      {
        packageType: 'with-dashboard' as const,
        name: 'Package 3: Full Dashboard',
        description: 'Complete solution with dashboard analytics and unlimited employee assessments',
        price: '3000.00',
        maxKeypassesDefault: 100,
        features: {
          training: true,
          dashboard: true,
          health_check: true,
          unlimited_employees: true,
        },
        active: true,
      },
    ];

    await db.insert(packages).values(seedPackages);

    console.log('✅ Seeded 3 packages');
    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
