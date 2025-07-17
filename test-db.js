const { drizzle } = require('drizzle-orm/node-postgres');
const { Client } = require('pg');
const { ordersTable, usersTable, foodItemsTable } = require('./lib/db/schema');
const { count } = require('drizzle-orm');

async function testDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'yumzy',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const db = drizzle(client);

    // Check counts
    const [orders] = await db.select({ count: count() }).from(ordersTable);
    const [users] = await db.select({ count: count() }).from(usersTable);
    const [foodItems] = await db.select({ count: count() }).from(foodItemsTable);

    console.log('Database counts:');
    console.log(`Orders: ${orders.count}`);
    console.log(`Users: ${users.count}`);
    console.log(`Food Items: ${foodItems.count}`);

    // Check some sample data
    const sampleOrders = await db.select().from(ordersTable).limit(3);
    const sampleUsers = await db.select().from(usersTable).limit(3);

    console.log('\nSample orders:');
    console.log(JSON.stringify(sampleOrders, null, 2));

    console.log('\nSample users:');
    console.log(JSON.stringify(sampleUsers, null, 2));

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.end();
  }
}

testDatabase();