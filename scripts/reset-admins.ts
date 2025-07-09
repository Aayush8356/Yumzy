// scripts/reset-admins.ts
import { db } from '../lib/db'
import { usersTable } from '../lib/db/schema'
import { eq, not } from 'drizzle-orm'

async function resetAdmins() {
  const legitimateAdminEmail = process.argv[2]

  if (!legitimateAdminEmail) {
    console.error('Please provide the email of the user to keep as admin.')
    console.error('Usage: bun scripts/reset-admins.ts <email>')
    process.exit(1)
  }

  console.log(`Starting admin reset. Keeping ${legitimateAdminEmail} as admin.`)

  try {
    const updatedUsers = await db
      .update(usersTable)
      .set({ role: 'user' })
      .where(not(eq(usersTable.email, legitimateAdminEmail)))
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        role: usersTable.role,
      })

    console.log('Admin roles reset successfully.')
    console.log('Users updated:', updatedUsers.length)
    console.table(updatedUsers)

  } catch (error) {
    console.error('An error occurred while resetting admin roles:', error)
    process.exit(1)
  }
}

resetAdmins()
