import { db } from '../config/db'
import { users } from '../db/schema/users.schema'
import { authors } from '../db/schema/authors.schema'
import { categories } from '../db/schema/categories.schema'
import { tags } from '../db/schema/tags.schema'
import { books } from '../db/schema/books.schema'
import { bookTags } from '../db/schema/book-tags.schema'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    console.log('🌱 Starting database seeding...')

    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...')
    await db.delete(bookTags)
    await db.delete(books)
    await db.delete(tags)
    await db.delete(categories)
    await db.delete(authors)
    await db.delete(users)

    // Seed Users
    console.log('👤 Seeding users...')
    const hashedPassword = await bcrypt.hash('password123', 10)
    const insertedUsers = await db
      .insert(users)
      .values([
        {
          username: 'john_doe',
          email: 'john@example.com',
          passwordHash: hashedPassword,
        },
        {
          username: 'jane_smith',
          email: 'jane@example.com',
          passwordHash: hashedPassword,
        },
        {
          username: 'book_lover',
          email: 'booklover@example.com',
          passwordHash: hashedPassword,
        },
      ])
      .returning()
    console.log(`✅ Created ${insertedUsers.length} users`)

    // Seed Categories
    console.log('📚 Seeding categories...')
    const insertedCategories = await db
      .insert(categories)
      .values([
        { name: 'Fiction' },
        { name: 'Non-Fiction' },
        { name: 'Science Fiction' },
        { name: 'Mystery' },
        { name: 'Romance' },
        { name: 'Biography' },
        { name: 'Self-Help' },
        { name: 'History' },
        { name: 'Technology' },
        { name: 'Fantasy' },
      ])
      .returning()
    console.log(`✅ Created ${insertedCategories.length} categories`)

    // Seed Authors
    console.log('✍️  Seeding authors...')
    const insertedAuthors = await db
      .insert(authors)
      .values([
        {
          name: 'J.K. Rowling',
          bio: 'British author best known for the Harry Potter fantasy series.',
        },
        {
          name: 'George Orwell',
          bio: 'English novelist and essayist, journalist and critic.',
        },
        {
          name: 'Agatha Christie',
          bio: 'English writer known for her detective novels.',
        },
        {
          name: 'Stephen King',
          bio: 'American author of horror, supernatural fiction, and suspense.',
        },
        {
          name: 'Jane Austen',
          bio: 'English novelist known primarily for her six major novels.',
        },
        {
          name: 'Isaac Asimov',
          bio: 'American writer and professor of biochemistry, known for science fiction.',
        },
        {
          name: 'Malcolm Gladwell',
          bio: 'Canadian journalist, author, and public speaker.',
        },
        {
          name: 'Yuval Noah Harari',
          bio: 'Israeli historian and professor at the Hebrew University of Jerusalem.',
        },
        {
          name: 'Michelle Obama',
          bio: 'American attorney and author who served as First Lady of the United States.',
        },
        {
          name: 'James Clear',
          bio: 'American author and speaker focused on habits and decision making.',
        },
      ])
      .returning()
    console.log(`✅ Created ${insertedAuthors.length} authors`)

    // Seed Tags
    console.log('🏷️  Seeding tags...')
    const insertedTags = await db
      .insert(tags)
      .values([
        { name: 'Bestseller' },
        { name: 'Award Winner' },
        { name: 'Classic' },
        { name: 'New Release' },
        { name: 'Popular' },
        { name: 'Educational' },
        { name: 'Inspirational' },
        { name: 'Thriller' },
        { name: 'Adventure' },
        { name: 'Drama' },
        { name: 'Comedy' },
        { name: 'Young Adult' },
        { name: 'Series' },
        { name: 'Standalone' },
      ])
      .returning()
    console.log(`✅ Created ${insertedTags.length} tags`)

    // Seed Books
    console.log('📖 Seeding books...')
    const insertedBooks = await db
      .insert(books)
      .values([
        {
          title: "Harry Potter and the Philosopher's Stone",
          description:
            'The first novel in the Harry Potter series, following a young wizard.',
          price: '19.99',
          thumbnail: 'https://example.com/harry-potter-1.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[0].id,
          categoryId: insertedCategories[9].id, // Fantasy
        },
        {
          title: '1984',
          description:
            'Dystopian social science fiction novel and cautionary tale.',
          price: '15.99',
          thumbnail: 'https://example.com/1984.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[1].id,
          categoryId: insertedCategories[0].id, // Fiction
        },
        {
          title: 'Murder on the Orient Express',
          description: 'A work of detective fiction featuring Hercule Poirot.',
          price: '14.99',
          thumbnail: 'https://example.com/orient-express.jpg',
          ownerId: insertedUsers[1].id,
          authorId: insertedAuthors[2].id,
          categoryId: insertedCategories[3].id, // Mystery
        },
        {
          title: 'The Shining',
          description:
            'Horror novel about a family isolated in a haunted hotel.',
          price: '16.99',
          thumbnail: 'https://example.com/shining.jpg',
          ownerId: insertedUsers[1].id,
          authorId: insertedAuthors[3].id,
          categoryId: insertedCategories[0].id, // Fiction
        },
        {
          title: 'Pride and Prejudice',
          description: 'A romantic novel of manners.',
          price: '12.99',
          thumbnail: 'https://example.com/pride-prejudice.jpg',
          ownerId: insertedUsers[2].id,
          authorId: insertedAuthors[4].id,
          categoryId: insertedCategories[4].id, // Romance
        },
        {
          title: 'Foundation',
          description:
            'Science fiction novel about the fall and rise of a galactic empire.',
          price: '18.99',
          thumbnail: 'https://example.com/foundation.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[5].id,
          categoryId: insertedCategories[2].id, // Science Fiction
        },
        {
          title: 'Outliers',
          description:
            'Examines the factors that contribute to high levels of success.',
          price: '17.99',
          thumbnail: 'https://example.com/outliers.jpg',
          ownerId: insertedUsers[1].id,
          authorId: insertedAuthors[6].id,
          categoryId: insertedCategories[6].id, // Self-Help
        },
        {
          title: 'Sapiens',
          description:
            'A brief history of humankind from the Stone Age to the modern age.',
          price: '20.99',
          thumbnail: 'https://example.com/sapiens.jpg',
          ownerId: insertedUsers[2].id,
          authorId: insertedAuthors[7].id,
          categoryId: insertedCategories[7].id, // History
        },
        {
          title: 'Becoming',
          description: 'Memoir by former First Lady Michelle Obama.',
          price: '22.99',
          thumbnail: 'https://example.com/becoming.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[8].id,
          categoryId: insertedCategories[5].id, // Biography
        },
        {
          title: 'Atomic Habits',
          description:
            'An easy and proven way to build good habits and break bad ones.',
          price: '16.99',
          thumbnail: 'https://example.com/atomic-habits.jpg',
          ownerId: insertedUsers[1].id,
          authorId: insertedAuthors[9].id,
          categoryId: insertedCategories[6].id, // Self-Help
        },
        {
          title: 'Animal Farm',
          description: 'Allegorical novella about Stalinism.',
          price: '11.99',
          thumbnail: 'https://example.com/animal-farm.jpg',
          ownerId: insertedUsers[2].id,
          authorId: insertedAuthors[1].id,
          categoryId: insertedCategories[0].id, // Fiction
        },
        {
          title: 'It',
          description:
            'Horror novel about a shape-shifting creature that preys on children.',
          price: '18.99',
          thumbnail: 'https://example.com/it.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[3].id,
          categoryId: insertedCategories[0].id, // Fiction
        },
      ])
      .returning()
    console.log(`✅ Created ${insertedBooks.length} books`)

    // Seed Book-Tags (Many-to-Many relationships)
    console.log('🔗 Seeding book-tag relationships...')
    const bookTagRelations = [
      // Harry Potter
      { bookId: insertedBooks[0].id, tagId: insertedTags[0].id }, // Bestseller
      { bookId: insertedBooks[0].id, tagId: insertedTags[4].id }, // Popular
      { bookId: insertedBooks[0].id, tagId: insertedTags[11].id }, // Young Adult
      { bookId: insertedBooks[0].id, tagId: insertedTags[12].id }, // Series
      // 1984
      { bookId: insertedBooks[1].id, tagId: insertedTags[2].id }, // Classic
      { bookId: insertedBooks[1].id, tagId: insertedTags[4].id }, // Popular
      { bookId: insertedBooks[1].id, tagId: insertedTags[9].id }, // Drama
      // Murder on the Orient Express
      { bookId: insertedBooks[2].id, tagId: insertedTags[2].id }, // Classic
      { bookId: insertedBooks[2].id, tagId: insertedTags[7].id }, // Thriller
      // The Shining
      { bookId: insertedBooks[3].id, tagId: insertedTags[0].id }, // Bestseller
      { bookId: insertedBooks[3].id, tagId: insertedTags[7].id }, // Thriller
      { bookId: insertedBooks[3].id, tagId: insertedTags[13].id }, // Standalone
      // Pride and Prejudice
      { bookId: insertedBooks[4].id, tagId: insertedTags[2].id }, // Classic
      { bookId: insertedBooks[4].id, tagId: insertedTags[4].id }, // Popular
      { bookId: insertedBooks[4].id, tagId: insertedTags[9].id }, // Drama
      // Foundation
      { bookId: insertedBooks[5].id, tagId: insertedTags[1].id }, // Award Winner
      { bookId: insertedBooks[5].id, tagId: insertedTags[12].id }, // Series
      { bookId: insertedBooks[5].id, tagId: insertedTags[8].id }, // Adventure
      // Outliers
      { bookId: insertedBooks[6].id, tagId: insertedTags[0].id }, // Bestseller
      { bookId: insertedBooks[6].id, tagId: insertedTags[5].id }, // Educational
      // Sapiens
      { bookId: insertedBooks[7].id, tagId: insertedTags[0].id }, // Bestseller
      { bookId: insertedBooks[7].id, tagId: insertedTags[5].id }, // Educational
      { bookId: insertedBooks[7].id, tagId: insertedTags[4].id }, // Popular
      // Becoming
      { bookId: insertedBooks[8].id, tagId: insertedTags[0].id }, // Bestseller
      { bookId: insertedBooks[8].id, tagId: insertedTags[6].id }, // Inspirational
      // Atomic Habits
      { bookId: insertedBooks[9].id, tagId: insertedTags[0].id }, // Bestseller
      { bookId: insertedBooks[9].id, tagId: insertedTags[4].id }, // Popular
      { bookId: insertedBooks[9].id, tagId: insertedTags[6].id }, // Inspirational
      // Animal Farm
      { bookId: insertedBooks[10].id, tagId: insertedTags[2].id }, // Classic
      { bookId: insertedBooks[10].id, tagId: insertedTags[9].id }, // Drama
      // It
      { bookId: insertedBooks[11].id, tagId: insertedTags[0].id }, // Bestseller
      { bookId: insertedBooks[11].id, tagId: insertedTags[7].id }, // Thriller
    ]

    await db.insert(bookTags).values(bookTagRelations)
    console.log(`✅ Created ${bookTagRelations.length} book-tag relationships`)

    console.log('\n✨ Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - ${insertedUsers.length} users`)
    console.log(`   - ${insertedCategories.length} categories`)
    console.log(`   - ${insertedAuthors.length} authors`)
    console.log(`   - ${insertedTags.length} tags`)
    console.log(`   - ${insertedBooks.length} books`)
    console.log(`   - ${bookTagRelations.length} book-tag relationships`)
    console.log('\n🔐 Test user credentials:')
    console.log(
      '   Email: john@example.com, jane@example.com, booklover@example.com'
    )
    console.log('   Password: password123')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seed()
