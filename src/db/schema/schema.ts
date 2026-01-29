import { pgTable, serial, text, varchar, integer, numeric, timestamp } from 'drizzle-orm/pg-core'

// ● Each book should belong to category
// ● Each book belongs to an author
// ● Each book can belong to many tags and each tags has many books

//Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: text('password').notNull(),
  created_at: timestamp('created_at').defaultNow(),
})

//Authors table //One author>>many books
export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
})

//Categories table //One category>>many books
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
})

//Create a new book with following details: Title, Description, Price, Category, Thumbnail

// Books table 
export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  thumbnail: text('thumbnail'),
  author_id: integer('author_id').references(() => authors.id),
  category_id: integer('category_id').references(() => categories.id),
  created_at: timestamp('created_at').defaultNow(),
})

//Tags table //Many tags>>many books
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
})

// Book_Tags table (many-to-many) //Book X has Tag Y
export const book_tags = pgTable('book_tags', {
  book_id: integer('book_id').references(() => books.id).notNull(),
  tag_id: integer('tag_id').references(() => tags.id).notNull(),
})
