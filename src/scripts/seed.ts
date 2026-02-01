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
        { name: 'Fiction', nameAr: 'خيال' },
        { name: 'Non-Fiction', nameAr: 'واقعي' },
        { name: 'Science Fiction', nameAr: 'خيال علمي' },
        { name: 'Mystery', nameAr: 'غموض' },
        { name: 'Romance', nameAr: 'رومانسي' },
        { name: 'Biography', nameAr: 'سيرة ذاتية' },
        { name: 'Self-Help', nameAr: 'تطوير الذات' },
        { name: 'History', nameAr: 'تاريخ' },
        { name: 'Technology', nameAr: 'تكنولوجيا' },
        { name: 'Fantasy', nameAr: 'فانتازيا' },
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
          nameAr: 'ج.ك. رولينج',
          bio: 'British author best known for the Harry Potter fantasy series.',
          bioAr: 'مؤلفة بريطانية اشتهرت بسلسلة هاري بوتر الخيالية.',
        },
        {
          name: 'George Orwell',
          nameAr: 'جورج أورويل',
          bio: 'English novelist and essayist, journalist and critic.',
          bioAr: 'روائي ومقالي وصحفي وناقد إنجليزي.',
        },
        {
          name: 'Agatha Christie',
          nameAr: 'أجاثا كريستي',
          bio: 'English writer known for her detective novels.',
          bioAr: 'كاتبة إنجليزية معروفة برواياتها البوليسية.',
        },
        {
          name: 'Stephen King',
          nameAr: 'ستيفن كينج',
          bio: 'American author of horror, supernatural fiction, and suspense.',
          bioAr: 'مؤلف أمريكي للرعب والخيال الخارق والتشويق.',
        },
        {
          name: 'Jane Austen',
          nameAr: 'جين أوستن',
          bio: 'English novelist known primarily for her six major novels.',
          bioAr: 'روائية إنجليزية معروفة برواياتها الست الرئيسية.',
        },
        {
          name: 'Isaac Asimov',
          nameAr: 'إسحاق أسيموف',
          bio: 'American writer and professor of biochemistry, known for science fiction.',
          bioAr: 'كاتب أمريكي وأستاذ كيمياء حيوية، معروف بالخيال العلمي.',
        },
        {
          name: 'Malcolm Gladwell',
          nameAr: 'مالكولم جلادويل',
          bio: 'Canadian journalist, author, and public speaker.',
          bioAr: 'صحفي كندي ومؤلف ومتحدث عام.',
        },
        {
          name: 'Yuval Noah Harari',
          nameAr: 'يوفال نوح هراري',
          bio: 'Israeli historian and professor at the Hebrew University of Jerusalem.',
          bioAr: 'مؤرخ إسرائيلي وأستاذ في الجامعة العبرية في القدس.',
        },
        {
          name: 'Michelle Obama',
          nameAr: 'ميشيل أوباما',
          bio: 'American attorney and author who served as First Lady of the United States.',
          bioAr:
            'محامية ومؤلفة أمريكية شغلت منصب السيدة الأولى للولايات المتحدة.',
        },
        {
          name: 'James Clear',
          nameAr: 'جيمس كلير',
          bio: 'American author and speaker focused on habits and decision making.',
          bioAr: 'مؤلف ومتحدث أمريكي يركز على العادات واتخاذ القرارات.',
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
          titleAr: 'هاري بوتر وحجر الفيلسوف',
          description:
            'The first novel in the Harry Potter series, following a young wizard.',
          descriptionAr:
            'الرواية الأولى في سلسلة هاري بوتر، تتبع ساحراً صغيراً.',
          price: '19.99',
          thumbnail: 'https://example.com/harry-potter-1.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[0].id,
          categoryId: insertedCategories[9].id, // Fantasy
        },
        {
          title: '1984',
          titleAr: '1984',
          description:
            'Dystopian social science fiction novel and cautionary tale.',
          descriptionAr: 'رواية خيال علمي اجتماعي ديستوبي وحكاية تحذيرية.',
          price: '15.99',
          thumbnail: 'https://example.com/1984.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[1].id,
          categoryId: insertedCategories[0].id, // Fiction
        },
        {
          title: 'Murder on the Orient Express',
          titleAr: 'جريمة في قطار الشرق السريع',
          description: 'A work of detective fiction featuring Hercule Poirot.',
          descriptionAr: 'عمل خيالي بوليسي يضم هرقل بوارو.',
          price: '14.99',
          thumbnail: 'https://example.com/orient-express.jpg',
          ownerId: insertedUsers[1].id,
          authorId: insertedAuthors[2].id,
          categoryId: insertedCategories[3].id, // Mystery
        },
        {
          title: 'The Shining',
          titleAr: 'البريق',
          description:
            'Horror novel about a family isolated in a haunted hotel.',
          descriptionAr: 'رواية رعب عن عائلة معزولة في فندق مسكون.',
          price: '16.99',
          thumbnail: 'https://example.com/shining.jpg',
          ownerId: insertedUsers[1].id,
          authorId: insertedAuthors[3].id,
          categoryId: insertedCategories[0].id, // Fiction
        },
        {
          title: 'Pride and Prejudice',
          titleAr: 'كبرياء وتحامل',
          description: 'A romantic novel of manners.',
          descriptionAr: 'رواية رومانسية عن الأخلاق والسلوكيات.',
          price: '12.99',
          thumbnail: 'https://example.com/pride-prejudice.jpg',
          ownerId: insertedUsers[2].id,
          authorId: insertedAuthors[4].id,
          categoryId: insertedCategories[4].id, // Romance
        },
        {
          title: 'Foundation',
          titleAr: 'المؤسسة',
          description:
            'Science fiction novel about the fall and rise of a galactic empire.',
          descriptionAr: 'رواية خيال علمي عن سقوط وصعود إمبراطورية مجرية.',
          price: '18.99',
          thumbnail: 'https://example.com/foundation.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[5].id,
          categoryId: insertedCategories[2].id, // Science Fiction
        },
        {
          title: 'Outliers',
          titleAr: 'المتميزون',
          description:
            'Examines the factors that contribute to high levels of success.',
          descriptionAr: 'يفحص العوامل التي تساهم في مستويات عالية من النجاح.',
          price: '17.99',
          thumbnail: 'https://example.com/outliers.jpg',
          ownerId: insertedUsers[1].id,
          authorId: insertedAuthors[6].id,
          categoryId: insertedCategories[6].id, // Self-Help
        },
        {
          title: 'Sapiens',
          titleAr: 'العاقل',
          description:
            'A brief history of humankind from the Stone Age to the modern age.',
          descriptionAr: 'تاريخ موجز للبشرية من العصر الحجري إلى العصر الحديث.',
          price: '20.99',
          thumbnail: 'https://example.com/sapiens.jpg',
          ownerId: insertedUsers[2].id,
          authorId: insertedAuthors[7].id,
          categoryId: insertedCategories[7].id, // History
        },
        {
          title: 'Becoming',
          titleAr: 'الصيرورة',
          description: 'Memoir by former First Lady Michelle Obama.',
          descriptionAr: 'مذكرات السيدة الأولى السابقة ميشيل أوباما.',
          price: '22.99',
          thumbnail: 'https://example.com/becoming.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[8].id,
          categoryId: insertedCategories[5].id, // Biography
        },
        {
          title: 'Atomic Habits',
          titleAr: 'العادات الذرية',
          description:
            'An easy and proven way to build good habits and break bad ones.',
          descriptionAr:
            'طريقة سهلة ومثبتة لبناء عادات جيدة وكسر العادات السيئة.',
          price: '16.99',
          thumbnail: 'https://example.com/atomic-habits.jpg',
          ownerId: insertedUsers[1].id,
          authorId: insertedAuthors[9].id,
          categoryId: insertedCategories[6].id, // Self-Help
        },
        {
          title: 'Animal Farm',
          titleAr: 'مزرعة الحيوان',
          description: 'Allegorical novella about Stalinism.',
          descriptionAr: 'رواية رمزية عن الستالينية.',
          price: '11.99',
          thumbnail: 'https://example.com/animal-farm.jpg',
          ownerId: insertedUsers[2].id,
          authorId: insertedAuthors[1].id,
          categoryId: insertedCategories[0].id, // Fiction
        },
        {
          title: 'It',
          titleAr: 'هو',
          description:
            'Horror novel about a shape-shifting creature that preys on children.',
          descriptionAr: 'رواية رعب عن مخلوق متحول يفترس الأطفال.',
          price: '18.99',
          thumbnail: 'https://example.com/it.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[3].id,
          categoryId: insertedCategories[0].id, // Fiction
        },
        {
          title: 'The Great Gatsby',
          titleAr: 'غاتسبي العظيم',
          description: 'A novel about the American Dream and the Jazz Age.',
          descriptionAr: 'رواية عن الحلم الأمريكي وعصر الجاز.',
          price: '13.99',
          thumbnail: 'https://example.com/gatsby.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[1].id,
          categoryId: insertedCategories[0].id, // Fiction
        },
        {
          title: 'To Kill a Mockingbird',
          titleAr: 'لقتل طائر الطنان',
          description: 'A novel about racial injustice in the Deep South.',
          descriptionAr: 'رواية عن الظلم العنصري في الجنوب العميق.',
          price: '14.99',
          thumbnail: 'https://example.com/mockingbird.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[2].id,
          categoryId: insertedCategories[0].id, // Fiction
        },
        {
          title: 'The Hobbit',
          titleAr: 'الهوبيت',
          description: 'A fantasy novel about Bilbo Baggins adventure.',
          descriptionAr: 'رواية فانتازيا عن مغامرة بيلبو باجينز.',
          price: '16.99',
          thumbnail: 'https://example.com/hobbit.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[0].id,
          categoryId: insertedCategories[9].id, // Fantasy
        },
        {
          title: 'Brave New World',
          titleAr: 'عالم جديد شجاع',
          description: 'A dystopian novel set in a futuristic World State.',
          descriptionAr: 'رواية ديستوبية تدور أحداثها في دولة عالمية مستقبلية.',
          price: '15.99',
          thumbnail: 'https://example.com/brave-new-world.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[1].id,
          categoryId: insertedCategories[2].id, // Science Fiction
        },
        {
          title: 'The Catcher in the Rye',
          titleAr: 'الحارس في حقل الشوفان',
          description: 'A novel about teenage rebellion and alienation.',
          descriptionAr: 'رواية عن تمرد المراهقين والاغتراب.',
          price: '12.99',
          thumbnail: 'https://example.com/catcher.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[2].id,
          categoryId: insertedCategories[0].id, // Fiction
        },
        {
          title: 'Lord of the Flies',
          titleAr: 'ملك الذباب',
          description: 'A novel about a group of boys stranded on an island.',
          descriptionAr: 'رواية عن مجموعة من الأولاد العالقين على جزيرة.',
          price: '13.99',
          thumbnail: 'https://example.com/flies.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[1].id,
          categoryId: insertedCategories[0].id, // Fiction
        },
        {
          title: 'Fahrenheit 451',
          titleAr: 'فهرنهايت 451',
          description:
            'A dystopian novel about a future where books are banned.',
          descriptionAr: 'رواية ديستوبية عن مستقبل حيث الكتب محظورة.',
          price: '14.99',
          thumbnail: 'https://example.com/fahrenheit.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[1].id,
          categoryId: insertedCategories[2].id, // Science Fiction
        },
        {
          title: 'The Chronicles of Narnia',
          titleAr: 'سجلات نارنيا',
          description:
            'A series of fantasy novels set in the magical land of Narnia.',
          descriptionAr:
            'سلسلة روايات فانتازيا تدور أحداثها في أرض نارنيا السحرية.',
          price: '24.99',
          thumbnail: 'https://example.com/narnia.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[0].id,
          categoryId: insertedCategories[9].id, // Fantasy
        },
        {
          title: 'Dune',
          titleAr: 'الكثيب',
          description:
            'A science fiction novel set on the desert planet Arrakis.',
          descriptionAr:
            'رواية خيال علمي تدور أحداثها على كوكب أراكيس الصحراوي.',
          price: '19.99',
          thumbnail: 'https://example.com/dune.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[5].id,
          categoryId: insertedCategories[2].id, // Science Fiction
        },
        {
          title: 'The Martian',
          titleAr: 'المريخي',
          description:
            'A science fiction novel about an astronaut stranded on Mars.',
          descriptionAr: 'رواية خيال علمي عن رائد فضاء عالق على كوكب المريخ.',
          price: '17.99',
          thumbnail: 'https://example.com/martian.jpg',
          ownerId: insertedUsers[0].id,
          authorId: insertedAuthors[5].id,
          categoryId: insertedCategories[2].id, // Science Fiction
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
