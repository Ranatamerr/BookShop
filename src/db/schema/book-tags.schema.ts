import { pgTable, integer } from 'drizzle-orm/pg-core'

export const bookTags = pgTable('book_tags', {
  bookId: integer('book_id').notNull(),
  tagId: integer('tag_id').notNull(),
})
