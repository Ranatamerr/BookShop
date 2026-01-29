import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),

  name: varchar('name', { length: 100 }).notNull().unique(),

  bio: text('bio'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
