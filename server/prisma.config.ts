import 'dotenv/config';
import type { PrismaConfig } from 'prisma';

console.log('Value : ', process.env.DATABASE_URL || 'postgresql://dummy:dummy@db-server:5432/dbname')

export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://dummy:dummy@db-server:5432/dbname'
  },
} satisfies PrismaConfig