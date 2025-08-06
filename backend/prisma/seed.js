const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@veterinaria.com' },
      update: {},
      create: {
        email: 'admin@veterinaria.com',
        password: adminPassword,
        name: 'Admin User',
        phone: '+1234567890',
        address: '123 Admin St, Admin City',
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin user created:', admin.email);

    // Create veterinarian user
    const vetPassword = await hashPassword('vet123');
    const veterinarian = await prisma.user.upsert({
      where: { email: 'vet@veterinaria.com' },
      update: {},
      create: {
        email: 'vet@veterinaria.com',
        password: vetPassword,
        name: 'Dr. Veterinarian',
        phone: '+1234567891',
        address: '456 Vet Ave, Pet City',
        role: 'VETERINARIAN'
      }
    });
    console.log('✅ Veterinarian user created:', veterinarian.email);

    // Create regular user
    const userPassword = await hashPassword('user123');
    const user = await prisma.user.upsert({
      where: { email: 'user@veterinaria.com' },
      update: {},
      create: {
        email: 'user@veterinaria.com',
        password: userPassword,
        name: 'John Doe',
        phone: '+1234567892',
        address: '789 User Blvd, Pet Town',
        role: 'USER'
      }
    });
    console.log('✅ Regular user created:', user.email);

    // Create sample pets for the user
    const pets = await Promise.all([
      prisma.pet.upsert({
        where: { id: 'sample-pet-1' },
        update: {},
        create: {
          id: 'sample-pet-1',
          name: 'Max',
          species: 'Perro',
          breed: 'Labrador',
          age: 3,
          weight: 30.5,
          gender: 'MALE',
          ownerId: user.id
        }
      }),
      prisma.pet.upsert({
        where: { id: 'sample-pet-2' },
        update: {},
        create: {
          id: 'sample-pet-2',
          name: 'Luna',
          species: 'Gato',
          breed: 'Persa',
          age: 2,
          weight: 4.2,
          gender: 'FEMALE',
          ownerId: user.id
        }
      })
    ]);
    console.log('✅ Sample pets created:', pets.length);

    // Create sample products
    const products = await Promise.all([
      prisma.product.upsert({
        where: { id: 'sample-product-1' },
        update: {},
        create: {
          id: 'sample-product-1',
          name: 'Alimento Premium para Perros',
          description: 'Alimento balanceado premium para perros adultos',
          price: 29.99,
          stock: 50,
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { id: 'sample-product-2' },
        update: {},
        create: {
          id: 'sample-product-2',
          name: 'Collar Antipulgas',
          description: 'Collar antipulgas y garrapatas de larga duración',
          price: 15.99,
          stock: 30,
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { id: 'sample-product-3' },
        update: {},
        create: {
          id: 'sample-product-3',
          name: 'Juguete Interactivo',
          description: 'Juguete interactivo para mantener a tu mascota entretenida',
          price: 12.50,
          stock: 25,
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { id: 'sample-product-4' },
        update: {},
        create: {
          id: 'sample-product-4',
          name: 'Vitaminas para Gatos',
          description: 'Suplemento vitamínico para gatos de todas las edades',
          price: 22.75,
          stock: 40,
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { id: 'sample-product-5' },
        update: {},
        create: {
          id: 'sample-product-5',
          name: 'Cama Ortopédica',
          description: 'Cama ortopédica con memoria para mascotas mayores',
          price: 89.99,
          stock: 15,
          isActive: true
        }
      })
    ]);
    console.log('✅ Sample products created:', products.length);

    // Create sample appointment
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now

    const appointment = await prisma.appointment.upsert({
      where: { id: 'sample-appointment-1' },
      update: {},
      create: {
        id: 'sample-appointment-1',
        date: futureDate,
        reason: 'Revisión general y vacunación',
        status: 'PENDING',
        petId: pets[0].id,
        userId: user.id
      }
    });
    console.log('✅ Sample appointment created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📧 Login credentials:');
    console.log('👑 Admin: admin@veterinaria.com / admin123');
    console.log('🩺 Veterinarian: vet@veterinaria.com / vet123');
    console.log('👤 User: user@veterinaria.com / user123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  });