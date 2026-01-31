import { db } from '../../config/db'
import { books } from '../../db/schema/books.schema'
import { authors } from '../../db/schema/authors.schema'
import { categories } from '../../db/schema/categories.schema'
import { users } from '../../db/schema/users.schema'
import { bookTags } from '../../db/schema/book-tags.schema'
import { tags } from '../../db/schema/tags.schema'
import { eq, sql, inArray } from 'drizzle-orm'
import type { ListBooksQuery } from './books.schema'

export class BooksService {
  async listBooks(query: ListBooksQuery) {
    const { page, limit } = query
    const offset = (page - 1) * limit

    // Get books with related data
    const booksList = await db
      .select({
        id: books.id,
        title: books.title,
        description: books.description,
        price: books.price,
        thumbnail: books.thumbnail,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        author: {
          id: authors.id,
          name: authors.name,
          bio: authors.bio,
        },
        category: {
          id: categories.id,
          name: categories.name,
        },
        owner: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .leftJoin(users, eq(books.ownerId, users.id))
      .limit(limit)
      .offset(offset)
      .orderBy(books.createdAt)

    // Get tags for each book
    const bookIds = booksList.map((book) => book.id)

    // Only query tags if there are books
    const bookTagsList =
      bookIds.length > 0
        ? await db
            .select({
              bookId: bookTags.bookId,
              tag: {
                id: tags.id,
                name: tags.name,
              },
            })
            .from(bookTags)
            .leftJoin(tags, eq(bookTags.tagId, tags.id))
            .where(inArray(bookTags.bookId, bookIds))
        : []

    // Group tags by book
    const tagsByBook = bookTagsList.reduce(
      (acc, item) => {
        if (!acc[item.bookId]) {
          acc[item.bookId] = []
        }
        if (item.tag) {
          acc[item.bookId].push(item.tag)
        }
        return acc
      },
      {} as Record<number, Array<{ id: number; name: string }>>
    )

    // Combine books with their tags
    const booksWithTags = booksList.map((book) => ({
      ...book,
      tags: tagsByBook[book.id] || [],
    }))

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(books)

    const totalPages = Math.ceil(count / limit)

    return {
      data: booksWithTags,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }
  }

  async getBookById(id: number) {
    const [book] = await db
      .select({
        title: books.title,
        price: books.price,
        thumbnail: books.thumbnail,
        author: {
          name: authors.name,
        },
        category: {
          name: categories.name,
        },
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(books.id, id))
      .limit(1)

    return book || null
  }

  async updateBook(
    bookId: number,
    userId: number,
    updateData: Partial<typeof books.$inferInsert>
  ) {
    // First, check if the book exists and if the user owns it
    const [existingBook] = await db
      .select({
        id: books.id,
        ownerId: books.ownerId,
      })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1)

    if (!existingBook) {
      throw new Error('Book not found')
    }

    if (existingBook.ownerId !== userId) {
      throw new Error('You are not authorized to edit this book')
    }

    // Update the book
    const [updatedBook] = await db
      .update(books)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(books.id, bookId))
      .returning()

    return updatedBook
  }

  async deleteBook(bookId: number, userId: number) {
    // First, check if the book exists and if the user owns it
    const [existingBook] = await db
      .select({
        id: books.id,
        ownerId: books.ownerId,
      })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1)

    if (!existingBook) {
      throw new Error('Book not found')
    }

    if (existingBook.ownerId !== userId) {
      throw new Error('You are not authorized to delete this book')
    }

    // Delete the book
    await db.delete(books).where(eq(books.id, bookId))

    return { deleted: true }
  }
}

export const booksService = new BooksService()
