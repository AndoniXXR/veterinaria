const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'Alimento Premium para Perros',
    description: 'Alimento balanceado de alta calidad para perros adultos. Rico en proteínas y vitaminas esenciales.',
    price: 231.12,
    stock: 50,
    isActive: true
  },
  {
    name: 'Collar Antipulgas para Gatos',
    description: 'Collar efectivo contra pulgas y garrapatas. Protección duradera hasta 8 meses.',
    price: 123.23,
    stock: 30,
    isActive: true
  },
  {
    name: 'Vitaminas para Gatos',
    description: 'Suplemento vitamínico para la salud felina. Fortalece el sistema inmunológico.',
    price: 175.38,
    stock: 25,
    isActive: true
  },
  {
    name: 'Juguete Interactivo para Perros',
    description: 'Juguete estimulante para el desarrollo mental. Perfecto para razas inteligentes.',
    price: 96.25,
    stock: 40,
    isActive: true
  },
  {
    name: 'Shampoo para Mascotas',
    description: 'Shampoo suave para todo tipo de pelaje. Con ingredientes naturales.',
    price: 138.60,
    stock: 35,
    isActive: true
  },
  {
    name: 'Cama Ortopédica para Perros',
    description: 'Cama cómoda con soporte ortopédico. Ideal para perros mayores.',
    price: 354.23,
    stock: 15,
    isActive: true
  },
  {
    name: 'Snacks Dentales para Perros',
    description: 'Snacks que ayudan a mantener los dientes limpios y el aliento fresco.',
    price: 65.45,
    stock: 60,
    isActive: true
  },
  {
    name: 'Rascador para Gatos',
    description: 'Torre rascadora con múltiples niveles. Perfecto para ejercicio y entretenimiento.',
    price: 269.50,
    stock: 20,
    isActive: true
  }
];

async function seedProducts() {
  try {
    console.log('🌱 Seeding products...');
    
    // Delete existing products first
    await prisma.product.deleteMany();
    console.log('🗑️ Cleared existing products');
    
    // Insert new products
    for (const product of sampleProducts) {
      await prisma.product.create({
        data: product
      });
      console.log(`✅ Created product: ${product.name}`);
    }
    
    console.log('🎉 Successfully seeded products!');
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProducts();