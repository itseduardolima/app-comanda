/**
 * Development seed — demo brand "Fogo & Brasa" (the product itself is generic).
 * Run with: npx prisma db seed
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TABLE_COUNT = 12;

const operators = [
  // First-access flow (creates PIN in the app):
  { username: 'joao', name: 'João' },
  { username: 'maria', name: 'Maria' },
  // Ready-to-use operator (PIN 1234) for quick manual testing:
  { username: 'demo', name: 'Demo', pin: '1234' },
];

type MenuSeedItem = {
  name: string;
  price: number; // cents
  category: string;
  customization?: {
    removableIngredients?: string[];
    extraIngredients?: { name: string; price: number }[];
    meatPoint?: boolean;
  };
};

const menuItems: MenuSeedItem[] = [
  {
    name: 'Picanha na brasa',
    price: 8990,
    category: 'Carnes',
    customization: {
      removableIngredients: ['Cebola', 'Alho', 'Sal grosso'],
      extraIngredients: [
        { name: 'Farofa', price: 500 },
        { name: 'Vinagrete', price: 400 },
      ],
      meatPoint: true,
    },
  },
  {
    name: 'Maminha grelhada',
    price: 6990,
    category: 'Carnes',
    customization: {
      removableIngredients: ['Cebola', 'Chimichurri'],
      extraIngredients: [{ name: 'Farofa', price: 500 }],
      meatPoint: true,
    },
  },
  {
    name: 'Costela no bafo',
    price: 7590,
    category: 'Carnes',
    customization: {
      removableIngredients: ['Limão'],
      extraIngredients: [{ name: 'Mandioca cozida', price: 800 }],
    },
  },
  {
    name: 'Espeto de frango',
    price: 1890,
    category: 'Espetos',
    customization: {
      removableIngredients: ['Pimenta'],
      extraIngredients: [{ name: 'Queijo coalho', price: 900 }],
    },
  },
  {
    name: 'Espeto de cupim',
    price: 2490,
    category: 'Espetos',
    customization: { meatPoint: true },
  },
  {
    name: 'Espeto misto',
    price: 2190,
    category: 'Espetos',
  },
  {
    name: 'Arroz branco',
    price: 1200,
    category: 'Acompanhamentos',
  },
  {
    name: 'Farofa da casa',
    price: 900,
    category: 'Acompanhamentos',
    customization: { removableIngredients: ['Bacon'] },
  },
  {
    name: 'Mandioca frita',
    price: 1600,
    category: 'Acompanhamentos',
  },
  {
    name: 'Vinagrete',
    price: 700,
    category: 'Acompanhamentos',
  },
  {
    name: 'Refrigerante lata',
    price: 700,
    category: 'Bebidas',
  },
  {
    name: 'Suco natural 500ml',
    price: 1200,
    category: 'Bebidas',
    customization: { extraIngredients: [{ name: 'Gelo e limão', price: 0 }] },
  },
  {
    name: 'Água mineral',
    price: 500,
    category: 'Bebidas',
  },
  {
    name: 'Cerveja long neck',
    price: 1100,
    category: 'Bebidas',
  },
  {
    name: 'Pudim de leite',
    price: 1400,
    category: 'Sobremesas',
  },
  {
    name: 'Açaí na tigela',
    price: 1900,
    category: 'Sobremesas',
    customization: {
      removableIngredients: ['Granola', 'Banana'],
      extraIngredients: [{ name: 'Leite condensado', price: 300 }],
    },
  },
];

async function main(): Promise<void> {
  for (const op of operators) {
    const pinHash = op.pin ? await bcrypt.hash(op.pin, 10) : null;
    await prisma.operator.upsert({
      where: { username: op.username },
      update: {},
      create: {
        username: op.username,
        name: op.name,
        pinHash,
        pinSet: pinHash !== null,
      },
    });
  }

  for (let number = 1; number <= TABLE_COUNT; number++) {
    await prisma.table.upsert({
      where: { number },
      update: {},
      create: { number },
    });
  }

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          price: item.price,
          category: item.category,
          customization: item.customization ?? undefined,
        },
      });
    }
  }

  // Start ticket numbers at a realistic value (e.g. #1404 in the prototype).
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"kitchen_ticket"', 'number'), 1400, false)`,
  );

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
