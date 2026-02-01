import {
  pgTable,
  serial,
  varchar,
  text,
  numeric,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core'

export const books = pgTable('books', {
  id: serial('id').primaryKey(),

  title: varchar('title', { length: 200 }).notNull(),

  titleAr: varchar('title_ar', { length: 200 }),

  description: text('description'),

  descriptionAr: text('description_ar'),

  price: numeric('price', { precision: 10, scale: 2 }).notNull(),

  thumbnail: varchar('thumbnail', { length: 500 }),

  //Foreign Keys
  ownerId: integer('owner_id').notNull(),

  authorId: integer('author_id').notNull(),

  categoryId: integer('category_id').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
