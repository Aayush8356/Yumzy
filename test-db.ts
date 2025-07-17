import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from './lib/db';
import { ordersTable, usersTable, foodItemsTable } from './lib/db/schema';
import { count, eq } from 'drizzle-orm';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL || 'No DATABASE_URL found');
    console.log('Connection string from lib/db:', process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://localhost:5432/yumzy');

    // Check counts
    const [orders] = await db.select({ count: count() }).from(ordersTable);
    const [users] = await db.select({ count: count() }).from(usersTable);
    const [foodItems] = await db.select({ count: count() }).from(foodItemsTable);

    console.log('Database counts:');
    console.log(`Orders: ${orders.count}`);
    console.log(`Users: ${users.count}`);
    console.log(`Food Items: ${foodItems.count}`);

    // Test the specific query that's failing
    const deliveredOrders = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, 'delivered'));
    const completedOrders = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, 'completed'));

    console.log('Delivered orders:', deliveredOrders[0]?.count || 0);
    console.log('Completed orders:', completedOrders[0]?.count || 0);

    // Check some sample data
    const sampleOrders = await db.select().from(ordersTable).limit(3);
    const sampleUsers = await db.select().from(usersTable).limit(3);

    console.log('\nSample orders:');
    console.log(JSON.stringify(sampleOrders, null, 2));

    console.log('\nSample users:');
    console.log(JSON.stringify(sampleUsers, null, 2));

  } catch (error) {
    console.error('Database error:', error);
  }
}

testDatabase();