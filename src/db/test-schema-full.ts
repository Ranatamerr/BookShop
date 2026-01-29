import { db } from '../config/db'
import { users, authors, categories, books, tags, bookTags } from './schema'

async function test() {
  try {
    // Just test a simple select for each table
    const userTest = await db.select().from(users).limit(1)
    const authorTest = await db.select().from(authors).limit(1)
    const categoryTest = await db.select().from(categories).limit(1)
    const bookTest = await db.select().from(books).limit(1)
    const tagTest = await db.select().from(tags).limit(1)
    const bookTagTest = await db.select().from(bookTags).limit(1)

    console.log('✅ Users table OK:', userTest)
    console.log('✅ Authors table OK:', authorTest)
    console.log('✅ Categories table OK:', categoryTest)
    console.log('✅ Books table OK:', bookTest)
    console.log('✅ Tags table OK:', tagTest)
    console.log('✅ Book_Tags table OK:', bookTagTest)

    console.log('🎉 All tables loaded successfully!')
  } catch (error) {
    console.error('❌ Schema test failed:', error)
  }
}

test()
