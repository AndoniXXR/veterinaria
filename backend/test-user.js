const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('Test123456', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'testuser@test.com',
        password: hashedPassword,
        name: 'Test User',
        phone: '123456789',
        address: 'Test Address'
      }
    });
    
    console.log('Usuario creado:', user);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();