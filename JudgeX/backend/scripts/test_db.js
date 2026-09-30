const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

async function testConnection(urlName, connectionString) {
  console.log(`\nTesting ${urlName}: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
  const prisma = new PrismaClient({
    datasources: {
      db: { url: connectionString }
    }
  });

  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log(`✅ SUCCESS for ${urlName}!`, result);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.error(`❌ FAILED for ${urlName}:`, err.message);
    await prisma.$disconnect();
    return false;
  }
}

async function run() {
  const password = "Samiran%232005%40";
  const ref = "qaztdzylxnojwwrtriai";

  const candidates = [
    { name: "Direct 5432 (current)", url: `postgresql://postgres:${password}@db.${ref}.supabase.co:5432/postgres?sslmode=require` },
    { name: "Pooler 6543 pgbouncer db.ref", url: `postgresql://postgres.${ref}:${password}@db.${ref}.supabase.co:6543/postgres?pgbouncer=true&sslmode=require` },
    { name: "Pooler 6543 ap-south-1", url: `postgresql://postgres.${ref}:${password}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` },
    { name: "Pooler 6543 ap-southeast-1", url: `postgresql://postgres.${ref}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` },
    { name: "Pooler 6543 us-east-1", url: `postgresql://postgres.${ref}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` },
    { name: "Pooler 6543 eu-central-1", url: `postgresql://postgres.${ref}:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` },
  ];

  for (const c of candidates) {
    const ok = await testConnection(c.name, c.url);
    if (ok) break;
  }
}

run();
