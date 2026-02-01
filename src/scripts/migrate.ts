import { db } from '../config/db'
import { sql } from 'drizzle-orm'

async function runMigration() {
  try {
    console.log('Starting migration: Adding translation columns...')

    // Add Arabic translation columns to books table
    await db.execute(
      sql`ALTER TABLE books ADD COLUMN IF NOT EXISTS title_ar VARCHAR(200)`
    )
    console.log('✓ Added title_ar to books table')

    await db.execute(
      sql`ALTER TABLE books ADD COLUMN IF NOT EXISTS description_ar TEXT`
    )
    console.log('✓ Added description_ar to books table')

    // Add Arabic translation column to categories table
    await db.execute(
      sql`ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ar VARCHAR(100)`
    )
    console.log('✓ Added name_ar to categories table')

    // Add Arabic translation columns to authors table
    await db.execute(
      sql`ALTER TABLE authors ADD COLUMN IF NOT EXISTS name_ar VARCHAR(100)`
    )
    console.log('✓ Added name_ar to authors table')

    await db.execute(
      sql`ALTER TABLE authors ADD COLUMN IF NOT EXISTS bio_ar TEXT`
    )
    console.log('✓ Added bio_ar to authors table')

    console.log('\n✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
