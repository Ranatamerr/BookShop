import { relations } from 'drizzle-orm'
import { users } from './users.schema'
import { authors } from './authors.schema'
import { categories } from './categories.schema'
import { books } from './books.schema'
import { tags } from './tags.schema'
import { bookTags } from './book-tags.schema'

export const usersRelations = relations(users, ({ many }) => ({
  books: many(books),
})) // one user can have many books

export const authorsRelations = relations(authors, ({ many }) => ({
  books: many(books),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  books: many(books),
}))

export const booksRelations = relations(books, ({ one, many }) => ({
  owner: one(users, {
    fields: [books.ownerId],
    references: [users.id],
  }),
  author: one(authors, {
    fields: [books.authorId],
    references: [authors.id],
  }),
  category: one(categories, {
    fields: [books.categoryId],
    references: [categories.id],
  }),
  bookTags: many(bookTags),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  bookTags: many(bookTags),
}))

export const bookTagsRelations = relations(bookTags, ({ one }) => ({
  book: one(books, {
    fields: [bookTags.bookId],
    references: [books.id],
  }),
  tag: one(tags, {
    fields: [bookTags.tagId],
    references: [tags.id],
  }),
}))
