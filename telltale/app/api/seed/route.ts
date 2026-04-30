import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();

    // Check if books exist
    const booksCount = await db.collection("books").countDocuments();
    console.log(`Found ${booksCount} books in database`);

    // Clear existing books and add our curated collection
    await db.collection("books").deleteMany({});

    // Add sample books if none exist
    const sampleBooks = [
        {
          title: "The Midnight Library",
          author: "Matt Haig",
          description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices... Would you have done anything different, if you had the chance to undo your regrets? A dazzling novel about all the choices that go into a life well lived, from the internationally bestselling author of Reasons to Stay Alive and How To Stop Time. Somewhere out beyond the edge of the universe there is a library that contains an infinite number of books, each one the story of another reality. One tells the story of your life as it is, along with another book for the other life you could have lived if you had made a different choice at any point in your life. While we all wonder how our lives might have been, what if you had the chance to go to the library and see for yourself? Would any of these other lives truly be better? In The Midnight Library, Matt Haig's enchanting new novel, Nora Seed finds herself faced with this decision. Faced with the possibility of changing her life for a new one, following a different career, undoing old breakups, realizing her dreams of becoming a glaciologist; she must search within herself as she travels through the Midnight Library to decide what is truly fulfilling in life, and what makes it worth living in the first place.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg",
          genres: ["Fiction", "Fantasy", "Philosophy"],
          rating: 4.2,
          totalRatings: 156,
          publishedDate: "2020-08-13",
          isbn: "9780525559474",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Dune",
          author: "Frank Herbert",
          description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange, a drug capable of extending life and enhancing consciousness. Coveted across the known universe, melange is a prize worth killing for... When House Atreides is betrayed, the destruction of Paul's family will set the boy on a journey toward a destiny greater than he could ever have imagined. And as he evolves into the mysterious man known as Muad'Dib, he will bring to fruition humankind's most ancient and unattainable dream. A stunning blend of adventure and mysticism, environmentalism and politics, Dune won the first Nebula Award, shared the Hugo Award, and formed the basis of what is undoubtedly the grandest epic in science fiction. Frank Herbert's death in 1986 was a tragic loss, yet the astounding legacy of his visionary fiction will live forever.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg",
          genres: ["Sci-Fi", "Fantasy", "Adventure"],
          rating: 4.6,
          totalRatings: 289,
          publishedDate: "1965-08-01",
          isbn: "9780441172719",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "The Seven Husbands of Evelyn Hugo",
          author: "Taylor Jenkins Reid",
          description: "Aging and reclusive Hollywood movie icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life. But when she chooses unknown magazine reporter Monique Grant for the job, no one is more astounded than Monique herself. Why her? Why now? Monique is not exactly on top of the world. Her husband has left her, and her career has stagnated. Regardless of why Evelyn has selected her to write her biography, Monique is determined to use this opportunity to jumpstart her career. Summoned to Evelyn's luxurious apartment, Monique listens in fascination as the actress tells her story. From making her way to Los Angeles in the 1950s to her decision to leave show business in the '80s, and, of course, the seven husbands along the way, Evelyn unspools a tale of ruthless ambition, unexpected friendship, and a great forbidden love. Monique begins to feel a very real connection to the legendary star, but as Evelyn's story near its conclusion, it becomes clear that her life intersects with Monique's own in tragic and irreversible ways.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1618739729i/32620332.jpg",
          genres: ["Fiction", "Romance", "Historical"],
          rating: 4.5,
          totalRatings: 234,
          publishedDate: "2017-06-13",
          isbn: "9781501161933",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Project Hail Mary",
          author: "Andy Weir",
          description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish. Except that right now, he doesn't know that. He can't even remember his own name, let alone the nature of his assignment or how to complete it. All he knows is that he's been asleep for a very, very long time. And he's just been awakened to find himself millions of miles from home, with nothing but two corpses for company. His crewmates dead, his memories fuzzily returning, Ryland realizes that an impossible task now confronts him. Hurtling through space on this tiny ship, it's up to him to puzzle out an impossible scientific mystery—and conquer an extinction-level threat to our species. And with the clock ticking down and the nearest human being light-years away, he's got to do it all alone. Or does he? An irresistible interplanetary adventure as only Andy Weir could deliver, Project Hail Mary is a tale of discovery, speculation, and survival to rival The Martian—while taking us to places it never dreamed of going.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg",
          genres: ["Sci-Fi", "Thriller", "Adventure"],
          rating: 4.7,
          totalRatings: 198,
          publishedDate: "2021-05-04",
          isbn: "9780593135204",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "The Silent Patient",
          author: "Alex Michaelides",
          description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word. Alicia's refusal to talk, or give any kind of explanation, turns a domestic tragedy into something far grander, a mystery that captures the public imagination and casts Alicia into notoriety. The price of her art skyrockets, and she, the silent patient, is hidden away from the tabloids and spotlight at the Grove, a secure forensic unit in North London. Theo Faber is a criminal psychotherapist who has waited a long time for the opportunity to work with Alicia. His determination to treat her is partly professional curiosity—Alicia has been silent for six years—and partly personal. Theo is convinced he can successfully treat her where others have failed. Obsessed with investigating her crime, he discovers that Alicia's silence goes far deeper than he first thought. And if this is to save her, he may have to risk everything—including his own life.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582398358i/40097951.jpg",
          genres: ["Mystery", "Thriller", "Psychology"],
          rating: 4.1,
          totalRatings: 167,
          publishedDate: "2019-02-05",
          isbn: "9781250301697",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Educated",
          author: "Tara Westover",
          description: "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University. Tara Westover was seventeen the first time she set foot in a classroom. Born to survivalists in the mountains of Idaho, she prepared for the end of the world by stockpiling home-canned peaches and sleeping with her 'head-for-the-hills bag'. In the summer she stewed herbs for her mother, a midwife and healer, and in the winter she salvaged in her father's junkyard. Her father forbade hospitals, so Tara never saw a doctor or nurse. Gashes and concussions, even burns from explosions, were all treated at home with herbalism. The family was so isolated from mainstream society that there was no one to ensure the children received an education, and no one to intervene when one of Tara's older brothers became violent. When another brother got himself into college, Tara decided to try a new kind of life. Her quest for knowledge transformed her, taking her over oceans and across continents, to Harvard and to Cambridge University. Only then would she wonder if she'd traveled too far, if there was still a way home.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1506026635i/35133922.jpg",
          genres: ["Biography", "Non-Fiction", "Education"],
          rating: 4.4,
          totalRatings: 312,
          publishedDate: "2018-02-20",
          isbn: "9780399590504",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "The Invisible Life of Addie LaRue",
          author: "V.E. Schwab",
          description: "A Life No One Will Remember. A Story You Will Never Forget. France, 1714: in a moment of desperation, a young woman makes a Faustian bargain to live forever—and is cursed to be forgotten by everyone she meets. Thus begins the extraordinary life of Addie LaRue, and a story that has been centuries in the making. After nearly 300 years of invisibility, Addie exists only as a muse for artists throughout history. And when she meets a young bookseller in a hidden bookstore below his apartment, he somehow remembers her name. But as their story deepens, she discovers a dark secret about him and a battle that will test them both. For a life no one will remember, and a love story you will never forget, The Invisible Life of Addie LaRue is a spellbinding novel about art, memory, and the lengths we'll go to be remembered.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1584633432i/50623864.jpg",
          genres: ["Fantasy", "Romance", "Historical"],
          rating: 4.3,
          totalRatings: 201,
          publishedDate: "2020-10-06",
          isbn: "9780765387561",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Atomic Habits",
          author: "James Clear",
          description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results. If you're having trouble changing your habits, the problem isn't you. The problem is your system. Bad habits repeat themselves again and again not because you don't want to change, but because you have the wrong system for change. You do not rise to the level of your goals. You fall to the level of your systems. Here, you'll get a proven system that can take you to new heights. Clear is known for his ability to distill complex topics into simple behaviors that can be easily applied to daily life and work. Here, he draws on the most proven ideas from biology, psychology, and neuroscience to create an easy-to-understand guide for making good habits inevitable and bad habits impossible.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1535115320i/40121378.jpg",
          genres: ["Self-Help", "Business", "Psychology"],
          rating: 4.6,
          totalRatings: 445,
          publishedDate: "2018-10-16",
          isbn: "9780735211292",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "The Song of Achilles",
          author: "Madeline Miller",
          description: "Greece in the age of heroes. Patroclus, an awkward young prince, has been exiled to the court of King Peleus and his perfect son Achilles. Despite their differences, Achilles befriends the shamed prince, and as they grow into young men skilled in the arts of war and medicine, their bond blossoms into something deeper—despite the displeasure of Achilles's mother Thetis, a sea goddess. But when word comes that Helen of Troy has been kidnapped, Achilles must go to war in distant Troy and fulfill his destiny. Torn between love and fear for his friend, Patroclus goes with him, little knowing that the years that follow will test everything they hold dear. The Song of Achilles is a breathtaking retelling of one of our greatest love stories. A tale of gods, kings, immortal fame and the human heart, The Song of Achilles is a dazzling literary feat that brilliantly reimagines Homer's enduring masterwork, The Iliad. An action-packed adventure, an epic love story, a marvelously conceived and executed page-turner, Miller's monumental debut novel has already earned resounding acclaim from some of contemporary fiction's brightest lights—and fans of Mary Renault, Bernard Cornwell, Steven Pressfield, and Colleen McCullough's Masters of Rome series will delight in this unforgettable journey back to ancient Greece in the age of heroes.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1612623918i/11250317.jpg",
          genres: ["Fiction", "Historical", "Romance"],
          rating: 4.5,
          totalRatings: 278,
          publishedDate: "2011-09-20",
          isbn: "9780062060624",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Where the Crawdads Sing",
          author: "Delia Owens",
          description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove, a quiet town on the North Carolina coast. So in late 1969, when handsome Chase Andrews is found dead, the locals immediately suspect Kya Clark, the so-called Marsh Girl. But Kya is not what they say. Sensitive and intelligent, she has survived for years alone in the marsh that she calls home, finding friends in the gulls and lessons in the sand. Then the time comes when she yearns to be touched and loved. When two young men from town become intrigued by her wild beauty, Kya opens herself to a new life—until the unthinkable happens. Perfect for fans of Barbara Kingsolver and Karen Russell, Where the Crawdads Sing is at once an exquisite ode to the natural world, a heartbreaking coming-of-age story, and a surprising tale of possible murder. Owens reminds us that we are forever shaped by the children we once were, and that we are all subject to the beautiful and violent secrets that nature keeps.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582135294i/36809135.jpg",
          genres: ["Fiction", "Mystery", "Nature"],
          rating: 4.2,
          totalRatings: 389,
          publishedDate: "2018-08-14",
          isbn: "9780735219090",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "The Alchemist",
          author: "Paulo Coelho",
          description: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure as extravagant as any ever found. The story of the treasures Santiago finds along the way teaches us, as only a few stories can, about the essential wisdom of listening to our hearts, learning to read the omens strewn along life's path, and, above all, following our dreams. Every few decades a book is published that changes the lives of its readers forever. The Alchemist is such a book. With over a million and a half copies sold around the world, The Alchemist has already established itself as a modern classic, universally admired. Paulo Coelho's charming fable, now available in English for the first time, will enchant and inspire an even wider audience of readers for generations to come. The Alchemist is the magical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. His quest will lead him to riches far different—and far more satisfying—than he ever imagined.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg",
          genres: ["Fiction", "Philosophy", "Adventure"],
          rating: 4.0,
          totalRatings: 567,
          publishedDate: "1988-01-01",
          isbn: "9780061122415",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          title: "Circe",
          author: "Madeline Miller",
          description: "In the house of Helios, god of the sun and mightiest of the Titans, a daughter is born. But Circe is a strange child—not powerful, like her father, nor viciously alluring like her mother. Turning to the world of mortals for companionship, she discovers that she does possess power—the power of witchcraft, which can transform rivals into monsters and menace the gods themselves. Threatened, Zeus banishes her to a deserted island, where she hones her occult craft, tames wild beasts and crosses paths with many of the most famous figures in all of mythology, including the Minotaur, Daedalus and his doomed son Icarus, the murderous Medea, and, of course, wily Odysseus. But there is danger, too, for a woman who stands alone, and Circe unwittingly draws the wrath of both men and gods, ultimately finding herself pitted against one of the most terrifying and vengeful of the Olympians. To protect what she loves most, Circe must summon all her strength and choose, once and for all, whether she belongs with the gods she is born from, or the mortals she has come to love. With unforgettably vivid characters, mesmerizing language, and page-turning suspense, Circe is a triumph of storytelling, an intoxicating epic of family rivalry, palace intrigue, love and loss, as well as a celebration of indomitable female strength in a man's world.",
          cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1565909496i/35959740.jpg",
          genres: ["Fantasy", "Fiction", "Mythology"],
          rating: 4.4,
          totalRatings: 234,
          publishedDate: "2018-04-10",
          isbn: "9780316556347",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await db.collection("books").insertMany(sampleBooks);
      console.log(`Added ${sampleBooks.length} sample books`);

    // Clear existing community data only
    await db.collection("communities").deleteMany({});
    await db.collection("messages").deleteMany({});

    // Seed Communities (using existing books if available)
    const communities = [
      {
        name: "Mystery Lovers Club",
        description: "Discuss thrilling mysteries, detective novels, and crime fiction. Share your theories and favorite whodunits!",
        bookId: null,
        coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=400&fit=crop",
        createdBy: "system",
        members: ["user1", "user2", "user3", "user4", "user5"],
        memberCount: 5,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        name: "Sci-Fi Enthusiasts",
        description: "Explore futuristic worlds, space operas, and mind-bending science fiction. From classics to modern masterpieces!",
        bookId: null,
        coverImage: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=400&fit=crop",
        createdBy: "system",
        members: ["user1", "user3", "user6", "user7"],
        memberCount: 4,
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
      },
      {
        name: "Romance Readers",
        description: "Share your favorite love stories, swoon-worthy moments, and romantic book recommendations!",
        bookId: null,
        coverImage: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=400&fit=crop",
        createdBy: "system",
        members: ["user2", "user4", "user8", "user9", "user10"],
        memberCount: 5,
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date("2024-02-10"),
      },
      {
        name: "Fantasy Book Club",
        description: "Dragons, magic, epic quests! Discuss your favorite fantasy series and discover new magical worlds.",
        bookId: null,
        coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop",
        createdBy: "system",
        members: ["user1", "user5", "user6", "user11", "user12", "user13"],
        memberCount: 6,
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-03-01"),
      },
      {
        name: "Non-Fiction Nerds",
        description: "Biographies, history, science, and self-improvement. Let's learn and grow together!",
        bookId: null,
        coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop",
        createdBy: "system",
        members: ["user3", "user7", "user14"],
        memberCount: 3,
        createdAt: new Date("2024-03-15"),
        updatedAt: new Date("2024-03-15"),
      },
      {
        name: "Classic Literature Society",
        description: "Dive into timeless classics from Shakespeare to Austen. Discuss themes, characters, and literary brilliance!",
        bookId: null,
        coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=400&fit=crop",
        createdBy: "system",
        members: ["user2", "user8", "user15", "user16"],
        memberCount: 4,
        createdAt: new Date("2024-04-01"),
        updatedAt: new Date("2024-04-01"),
      },
    ];

    const communityResults = await db.collection("communities").insertMany(communities);
    const communityIds = Object.values(communityResults.insertedIds).map(id => id.toString());

    // Seed Messages for each community
    const messages = [
      // Mystery Lovers Club
      {
        communityId: communityIds[0],
        userId: "user1",
        username: "Sarah Detective",
        avatar: "https://i.pravatar.cc/150?img=1",
        message: "Just finished 'The Silent Patient'! The twist at the end completely blew my mind! 🤯",
        createdAt: new Date("2024-04-20T10:30:00"),
      },
      {
        communityId: communityIds[0],
        userId: "user2",
        username: "Mike Holmes",
        avatar: "https://i.pravatar.cc/150?img=13",
        message: "That book is incredible! Have you read 'Gone Girl'? Similar vibes with unreliable narrators.",
        createdAt: new Date("2024-04-20T10:45:00"),
      },
      {
        communityId: communityIds[0],
        userId: "user3",
        username: "Emma Watson",
        avatar: "https://i.pravatar.cc/150?img=5",
        message: "Adding both to my TBR! I'm currently reading Agatha Christie's 'And Then There Were None'. Classic mystery perfection! 📚",
        createdAt: new Date("2024-04-20T11:00:00"),
      },
      {
        communityId: communityIds[0],
        userId: "user4",
        username: "Detective Dan",
        avatar: "https://i.pravatar.cc/150?img=12",
        message: "Agatha Christie never disappoints! Her plot twists are legendary. Have you tried any Sherlock Holmes stories?",
        createdAt: new Date("2024-04-20T11:15:00"),
      },

      // Sci-Fi Enthusiasts
      {
        communityId: communityIds[1],
        userId: "user1",
        username: "Sarah Detective",
        avatar: "https://i.pravatar.cc/150?img=1",
        message: "Just started 'Project Hail Mary' by Andy Weir. The science is fascinating! 🚀",
        createdAt: new Date("2024-04-19T14:20:00"),
      },
      {
        communityId: communityIds[1],
        userId: "user6",
        username: "Alex Cosmos",
        avatar: "https://i.pravatar.cc/150?img=8",
        message: "That book is AMAZING! The humor mixed with hard science is perfect. You're in for a treat!",
        createdAt: new Date("2024-04-19T14:35:00"),
      },
      {
        communityId: communityIds[1],
        userId: "user7",
        username: "Luna Starlight",
        avatar: "https://i.pravatar.cc/150?img=9",
        message: "If you love that, try 'The Martian' next! Same author, same brilliant storytelling. 🌟",
        createdAt: new Date("2024-04-19T15:00:00"),
      },

      // Romance Readers
      {
        communityId: communityIds[2],
        userId: "user2",
        username: "Mike Holmes",
        avatar: "https://i.pravatar.cc/150?img=13",
        message: "Can we talk about 'The Seven Husbands of Evelyn Hugo'? I cried so much! 😭💕",
        createdAt: new Date("2024-04-18T16:00:00"),
      },
      {
        communityId: communityIds[2],
        userId: "user8",
        username: "Romantic Rose",
        avatar: "https://i.pravatar.cc/150?img=10",
        message: "That book destroyed me in the best way! The love story is so beautifully written. Taylor Jenkins Reid is a genius!",
        createdAt: new Date("2024-04-18T16:20:00"),
      },
      {
        communityId: communityIds[2],
        userId: "user9",
        username: "Love Story Lisa",
        avatar: "https://i.pravatar.cc/150?img=20",
        message: "Adding to my list! I just finished 'Beach Read' by Emily Henry. Perfect blend of romance and humor! ❤️",
        createdAt: new Date("2024-04-18T16:45:00"),
      },

      // Fantasy Book Club
      {
        communityId: communityIds[3],
        userId: "user5",
        username: "Dragon Rider",
        avatar: "https://i.pravatar.cc/150?img=15",
        message: "Who else is reading 'Fourth Wing'? I can't put it down! The dragons, the romance, everything! 🐉",
        createdAt: new Date("2024-04-21T09:00:00"),
      },
      {
        communityId: communityIds[3],
        userId: "user11",
        username: "Magic Maven",
        avatar: "https://i.pravatar.cc/150?img=25",
        message: "YES! I finished it in two days! The world-building is incredible. Already started the sequel!",
        createdAt: new Date("2024-04-21T09:30:00"),
      },
      {
        communityId: communityIds[3],
        userId: "user12",
        username: "Wizard Will",
        avatar: "https://i.pravatar.cc/150?img=30",
        message: "For those who loved it, try 'A Court of Thorns and Roses' series next. Similar vibes! ✨",
        createdAt: new Date("2024-04-21T10:00:00"),
      },

      // Non-Fiction Nerds
      {
        communityId: communityIds[4],
        userId: "user3",
        username: "Emma Watson",
        avatar: "https://i.pravatar.cc/150?img=5",
        message: "Just finished 'Atomic Habits' by James Clear. Life-changing! Anyone else implementing the strategies? 📖",
        createdAt: new Date("2024-04-20T13:00:00"),
      },
      {
        communityId: communityIds[4],
        userId: "user14",
        username: "Knowledge Keeper",
        avatar: "https://i.pravatar.cc/150?img=35",
        message: "That book transformed my daily routine! The 1% improvement concept is so powerful. Highly recommend!",
        createdAt: new Date("2024-04-20T13:30:00"),
      },

      // Classic Literature Society
      {
        communityId: communityIds[5],
        userId: "user2",
        username: "Mike Holmes",
        avatar: "https://i.pravatar.cc/150?img=13",
        message: "Re-reading 'Pride and Prejudice' and falling in love with it all over again. Austen's wit is timeless! 💫",
        createdAt: new Date("2024-04-19T11:00:00"),
      },
      {
        communityId: communityIds[5],
        userId: "user15",
        username: "Classic Carl",
        avatar: "https://i.pravatar.cc/150?img=40",
        message: "Mr. Darcy will forever be the ultimate book boyfriend! Have you read 'Jane Eyre' yet?",
        createdAt: new Date("2024-04-19T11:30:00"),
      },
    ];

    await db.collection("messages").insertMany(messages);

    // Get final counts
    const finalBooksCount = await db.collection("books").countDocuments();
    const communitiesCount = await db.collection("communities").countDocuments();
    const messagesCount = await db.collection("messages").countDocuments();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      stats: {
        books: finalBooksCount,
        communities: communitiesCount,
        messages: messagesCount,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
