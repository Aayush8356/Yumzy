// scripts/create-db.ts
import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' });

const dbUrl = process.env.POSTGRES_URL;

if (!dbUrl) {
  console.error('POSTGRES_URL environment variable is not set.')
  process.exit(1)
}

const sql = postgres(dbUrl, { max: 1 });

async function createDatabase() {
  try {
    await sql`CREATE DATABASE yumzy`;
    console.log('Database "yumzy" created successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('Database "yumzy" already exists.');
    } else {
      console.error('An error occurred while creating the database:', error);
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

createDatabase();
