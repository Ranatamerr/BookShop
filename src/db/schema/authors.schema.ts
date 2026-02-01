import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),

  name: varchar('name', { length: 100 }).notNull().unique(),

  nameAr: varchar('name_ar', { length: 100 }),

  bio: text('bio'),

  bioAr: text('bio_ar'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
