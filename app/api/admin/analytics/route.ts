import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  usersTable, 
  ordersTable, 
  orderItemsTable, 
  foodItemsTable, 
  categoriesTable 
} from '@/lib/db/schema'
import { sql, desc, eq, gte, and } from 'drizzle-orm'
import { ErrorHandler } from '@/lib/error-handler'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return ErrorHandler.handleAsyncError(async () => {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    
    // Calculate date range
    const now = new Date()
    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000))
    const lastPeriodStart = new Date(startDate.getTime() - (daysAgo * 24 * 60 * 60 * 1000))

    // Get revenue data
    const [revenueResult] = await db
      .select({
        total: sql<number>`sum(${ordersTable.total})::numeric`,
        thisMonth: sql<number>`sum(case when ${ordersTable.createdAt} >= ${startDate} then ${ordersTable.total} else 0 end)::numeric`,
        lastMonth: sql<number>`sum(case when ${ordersTable.createdAt} >= ${lastPeriodStart} and ${ordersTable.createdAt} < ${startDate} then ${ordersTable.total} else 0 end)::numeric`
      })
      .from(ordersTable)
      .where(eq(ordersTable.status, 'completed'))

    const revenue = {
      total: Number(revenueResult?.total || 0),
      thisMonth: Number(revenueResult?.thisMonth || 0),
      lastMonth: Number(revenueResult?.lastMonth || 0),
      growth: 0
    }
    
    if (revenue.lastMonth > 0) {
      revenue.growth = ((revenue.thisMonth - revenue.lastMonth) / revenue.lastMonth) * 100
    }

    // Get orders data
    const [ordersResult] = await db
      .select({
        total: sql<number>`count(*)::int`,
        thisMonth: sql<number>`sum(case when ${ordersTable.createdAt} >= ${startDate} then 1 else 0 end)::int`,
        pending: sql<number>`sum(case when ${ordersTable.status} = 'pending' then 1 else 0 end)::int`,
        completed: sql<number>`sum(case when ${ordersTable.status} = 'completed' then 1 else 0 end)::int`,
        cancelled: sql<number>`sum(case when ${ordersTable.status} = 'cancelled' then 1 else 0 end)::int`
      })
      .from(ordersTable)

    const orders = {
      total: Number(ordersResult?.total || 0),
      thisMonth: Number(ordersResult?.thisMonth || 0),
      pending: Number(ordersResult?.pending || 0),
      completed: Number(ordersResult?.completed || 0),
      cancelled: Number(ordersResult?.cancelled || 0)
    }

    // Get users data
    const [usersResult] = await db
      .select({
        total: sql<number>`count(*)::int`,
        verified: sql<number>`sum(case when ${usersTable.isVerified} = true then 1 else 0 end)::int`,
        unverified: sql<number>`sum(case when ${usersTable.isVerified} = false then 1 else 0 end)::int`,
        newThisMonth: sql<number>`sum(case when ${usersTable.createdAt} >= ${startDate} then 1 else 0 end)::int`,
        newLastMonth: sql<number>`sum(case when ${usersTable.createdAt} >= ${lastPeriodStart} and ${usersTable.createdAt} < ${startDate} then 1 else 0 end)::int`
      })
      .from(usersTable)

    const users = {
      total: Number(usersResult?.total || 0),
      verified: Number(usersResult?.verified || 0),
      unverified: Number(usersResult?.unverified || 0),
      newThisMonth: Number(usersResult?.newThisMonth || 0),
      growth: 0
    }

    const newLastMonth = Number(usersResult?.newLastMonth || 0)
    if (newLastMonth > 0) {
      users.growth = ((users.newThisMonth - newLastMonth) / newLastMonth) * 100
    }

    // Get popular items
    const popularItems = await db
      .select({
        id: foodItemsTable.id,
        name: foodItemsTable.name,
        orders: sql<number>`count(${orderItemsTable.id})::int`,
        revenue: sql<number>`sum(${orderItemsTable.price} * ${orderItemsTable.quantity})::numeric`,
        rating: foodItemsTable.rating
      })
      .from(orderItemsTable)
      .innerJoin(foodItemsTable, eq(orderItemsTable.foodItemId, foodItemsTable.id))
      .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
      .where(
        and(
          gte(ordersTable.createdAt, startDate),
          eq(ordersTable.status, 'completed')
        )
      )
      .groupBy(foodItemsTable.id, foodItemsTable.name, foodItemsTable.rating)
      .orderBy(desc(sql`count(${orderItemsTable.id})`))
      .limit(5)

    // Get orders by day for the last 7 days
    const ordersByDay = await db
      .select({
        date: sql<string>`date(${ordersTable.createdAt})`,
        orders: sql<number>`count(*)::int`,
        revenue: sql<number>`sum(${ordersTable.total})::numeric`
      })
      .from(ordersTable)
      .where(
        and(
          gte(ordersTable.createdAt, new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))),
          eq(ordersTable.status, 'completed')
        )
      )
      .groupBy(sql`date(${ordersTable.createdAt})`)
      .orderBy(sql`date(${ordersTable.createdAt})`)

    // Get user registrations by day for the last 7 days
    const userRegistrationsByDay = await db
      .select({
        date: sql<string>`date(${usersTable.createdAt})`,
        users: sql<number>`count(*)::int`
      })
      .from(usersTable)
      .where(gte(usersTable.createdAt, new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))))
      .groupBy(sql`date(${usersTable.createdAt})`)
      .orderBy(sql`date(${usersTable.createdAt})`)

    // Get category performance
    const categoryPerformance = await db
      .select({
        category: categoriesTable.name,
        orders: sql<number>`count(${orderItemsTable.id})::int`,
        revenue: sql<number>`sum(${orderItemsTable.price} * ${orderItemsTable.quantity})::numeric`,
        items: sql<number>`count(distinct ${foodItemsTable.id})::int`
      })
      .from(categoriesTable)
      .leftJoin(foodItemsTable, eq(categoriesTable.id, foodItemsTable.categoryId))
      .leftJoin(orderItemsTable, eq(foodItemsTable.id, orderItemsTable.foodItemId))
      .leftJoin(ordersTable, and(
        eq(orderItemsTable.orderId, ordersTable.id),
        gte(ordersTable.createdAt, startDate),
        eq(ordersTable.status, 'completed')
      ))
      .groupBy(categoriesTable.id, categoriesTable.name)
      .orderBy(desc(sql`sum(${orderItemsTable.price} * ${orderItemsTable.quantity})`))

    const analytics = {
      revenue,
      orders,
      users,
      popularItems: popularItems.map(item => ({
        ...item,
        orders: Number(item.orders),
        revenue: Number(item.revenue || 0),
        rating: Number(item.rating || 0)
      })),
      ordersByDay: ordersByDay.map(day => ({
        ...day,
        orders: Number(day.orders),
        revenue: Number(day.revenue || 0)
      })),
      userRegistrationsByDay: userRegistrationsByDay.map(day => ({
        ...day,
        users: Number(day.users)
      })),
      categoryPerformance: categoryPerformance.map(cat => ({
        ...cat,
        orders: Number(cat.orders),
        revenue: Number(cat.revenue || 0),
        items: Number(cat.items)
      }))
    }

    return NextResponse.json({
      success: true,
      analytics
    })
  })
}