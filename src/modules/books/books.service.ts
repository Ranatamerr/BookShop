import { db } from '../../config/db'
import { books } from '../../db/schema/books.schema'
import { authors } from '../../db/schema/authors.schema'
import { categories } from '../../db/schema/categories.schema'
import { users } from '../../db/schema/users.schema'
import { bookTags } from '../../db/schema/book-tags.schema'
import { tags } from '../../db/schema/tags.schema'
import { eq, sql, inArray, ilike, asc, desc } from 'drizzle-orm'
import type {
  ListBooksQuery,
  MyBooksQuery,
  CreateBookInput,
} from './books.schema'

export class BooksService {
  async listBooks(query: ListBooksQuery) {
    const { page, limit, search, sortBy, category, minPrice, maxPrice } = query
    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = []

    // Add search filter if provided
    if (search) {
      whereConditions.push(ilike(books.title, `%${search}%`))
    }

    // Add category filter if provided (case-insensitive)
    if (category) {
      whereConditions.push(sql`LOWER(${categories.name}) = LOWER(${category})`)
    }

    // Add price range filters if provided
    if (minPrice !== undefined) {
      whereConditions.push(sql`${books.price}::numeric >= ${minPrice}`)
    }
    if (maxPrice !== undefined) {
      whereConditions.push(sql`${books.price}::numeric <= ${maxPrice}`)
    }

    // Determine sort order
    const orderByClause =
      sortBy === 'title_desc' ? desc(books.title) : asc(books.title)

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
      .where(
        whereConditions.length > 0
          ? sql`${sql.join(whereConditions, sql` AND `)}`
          : undefined
      )
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset)

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
    const countWhereConditions = []
    if (search) {
      countWhereConditions.push(ilike(books.title, `%${search}%`))
    }
    if (category) {
      countWhereConditions.push(
        sql`LOWER(${categories.name}) = LOWER(${category})`
      )
    }
    if (minPrice !== undefined) {
      countWhereConditions.push(sql`${books.price}::numeric >= ${minPrice}`)
    }
    if (maxPrice !== undefined) {
      countWhereConditions.push(sql`${books.price}::numeric <= ${maxPrice}`)
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(
        countWhereConditions.length > 0
          ? sql`${sql.join(countWhereConditions, sql` AND `)}`
          : undefined
      )

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

  async createBook(userId: number, bookData: CreateBookInput) {
    // Find or create author (case-insensitive)
    let author = await db
      .select()
      .from(authors)
      .where(sql`LOWER(${authors.name}) = LOWER(${bookData.authorName})`)
      .limit(1)

    if (author.length === 0) {
      // Create new author
      const [newAuthor] = await db
        .insert(authors)
        .values({
          name: bookData.authorName,
          bio: null,
        })
        .returning()
      author = [newAuthor]
    }

    // Find or create category (case-insensitive)
    let category = await db
      .select()
      .from(categories)
      .where(sql`LOWER(${categories.name}) = LOWER(${bookData.categoryName})`)
      .limit(1)

    if (category.length === 0) {
      // Create new category
      const [newCategory] = await db
        .insert(categories)
        .values({
          name: bookData.categoryName,
        })
        .returning()
      category = [newCategory]
    }

    // Insert the new book
    const [newBook] = await db
      .insert(books)
      .values({
        title: bookData.title,
        description: bookData.description || null,
        price: bookData.price,
        thumbnail: bookData.thumbnail || null,
        ownerId: userId,
        authorId: author[0].id,
        categoryId: category[0].id,
      })
      .returning()

    // Get the complete book details with author and category
    const bookDetails = await db
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
        },
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(eq(books.id, newBook.id))
      .limit(1)

    return bookDetails[0]
  }

  async getMyBooks(userId: number, query: MyBooksQuery) {
    const { page, limit, search, sortBy, category, minPrice, maxPrice } = query
    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = [eq(books.ownerId, userId)]

    // Add search filter if provided
    if (search) {
      whereConditions.push(ilike(books.title, `%${search}%`))
    }

    // Add category filter if provided (case-insensitive)
    if (category) {
      whereConditions.push(sql`LOWER(${categories.name}) = LOWER(${category})`)
    }

    // Add price range filters if provided
    if (minPrice !== undefined) {
      whereConditions.push(sql`${books.price}::numeric >= ${minPrice}`)
    }
    if (maxPrice !== undefined) {
      whereConditions.push(sql`${books.price}::numeric <= ${maxPrice}`)
    }

    // Get books owned by the user
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
          name: authors.name,
          bio: authors.bio,
        },
        category: {
          name: categories.name,
        },
      })
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(sql`${sql.join(whereConditions, sql` AND `)}`)
      .orderBy(sortBy === 'title_desc' ? desc(books.title) : asc(books.title))
      .limit(limit)
      .offset(offset)

    // Get tags for each book
    const bookIds = booksList.map((book) => book.id)

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

    // Get total count for pagination (only user's books, with search filter)
    const countWhereConditions = [eq(books.ownerId, userId)]
    if (search) {
      countWhereConditions.push(ilike(books.title, `%${search}%`))
    }
    if (category) {
      countWhereConditions.push(
        sql`LOWER(${categories.name}) = LOWER(${category})`
      )
    }
    if (minPrice !== undefined) {
      countWhereConditions.push(sql`${books.price}::numeric >= ${minPrice}`)
    }
    if (maxPrice !== undefined) {
      countWhereConditions.push(sql`${books.price}::numeric <= ${maxPrice}`)
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(books)
      .leftJoin(categories, eq(books.categoryId, categories.id))
      .where(sql`${sql.join(countWhereConditions, sql` AND `)}`)

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
