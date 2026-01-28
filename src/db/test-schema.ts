import { db } from '../config/db.js'
import { sql } from 'drizzle-orm'
import * as schema from './schema/schema.js'

async function test() {
  console.log('Schema loaded:', Object.keys(schema))
  const result = await db.execute(sql`SELECT 1 AS result`)
  console.log('DB connection works! Result:', result)
}

test()
