import { db } from './config/db'
import { sql } from 'drizzle-orm'

async function test() {
  try {
    const result = await db.execute(sql`SELECT 1 AS result`)
    console.log('DB connected successfully:', result)
  } catch (error) {
    console.error('DB connection failed:', error)
  }
}

test()
