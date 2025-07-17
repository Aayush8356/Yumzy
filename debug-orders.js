const { db } = require('./lib/db');
const { ordersTable, orderItemsTable, usersTable } = require('./lib/db/schema');

async function debugOrders() {
  try {
    console.log('Fetching all orders...');
    const orders = await db.select().from(ordersTable);
    
    console.log('Total orders found:', orders.length);
    orders.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log(`  ID: ${order.id}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Payment Status: ${order.paymentStatus}`);
      console.log(`  Total: ${order.total}`);
      console.log(`  Customer: ${order.customerName}`);
      console.log(`  Created: ${order.createdAt}`);
      console.log(`  Updated: ${order.updatedAt}`);
      console.log(`  Estimated Delivery: ${order.estimatedDeliveryTime}`);
    });
    
    console.log('\nFetching order items...');
    const orderItems = await db.select().from(orderItemsTable);
    console.log('Total order items:', orderItems.length);
    
    console.log('\nFetching users...');
    const users = await db.select().from(usersTable);
    console.log('Total users:', users.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugOrders();