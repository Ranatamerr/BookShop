import { pgTable, integer, primaryKey, timestamp } from 'drizzle-orm/pg-core'

export const bookTags = pgTable(
  'book_tags',
  {
    bookId: integer('book_id').notNull(),
    tagId: integer('tag_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bookId, table.tagId] }),
  })
)
