"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  Filter, 
  Star, 
  Heart, 
  Clock, 
  TrendingUp,
  User,
  Settings,
  Bell,
  Plus,
  ChevronRight,
  BookMarked,
  Target,
  Award,
  Calendar
} from "lucide-react";
import Image from "next/image";

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  genres: string[];
  rating: number;
  totalRatings: number;
  publishedDate: string;
}

interface UserStats {
  booksRead: number;
  currentStreak: number;
  totalRatings: number;
  favoriteGenre: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    booksRead: 24,
    currentStreak: 7,
    totalRatings: 18,
    favoriteGenre: "Fiction"
  });

  const genres = [
    "Fiction", "Non-Fiction", "Mystery", "Thriller", "Romance", 
    "Sci-Fi", "Fantasy", "Horror", "Biography", "History", 
    "Self-Help", "Business", "Poetry", "Young Adult", "Children"
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchBooks();
      fetchRecommendations();
    }
  }, [session]);

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/books?limit=20");
      const data = await response.json();
      if (data.success) {
        setBooks(data.books);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/books?limit=8");
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.books.slice(0, 8));
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || (book.genres && book.genres.includes(selectedGenre));
    return matchesSearch && matchesGenre;
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
          </motion.div>
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading your library...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <BookOpen className="w-8 h-8 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-heading font-bold">
                  Welcome back, <span className="gradient-text">{session.user.name}</span>!
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ready to discover your next favorite book?
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full glass dark:glass-dark hover:bg-white/20"
              >
                <Bell className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full glass dark:glass-dark hover:bg-white/20"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                {session.user.name?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="glass dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                <BookMarked className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{userStats.booksRead}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Books Read</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">This year</p>
          </div>

          <div className="glass dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{userStats.currentStreak}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Day Streak</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Keep it up!</p>
          </div>

          <div className="glass dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{userStats.totalRatings}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Reviews</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Books rated</p>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass dark:glass-dark rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search books, authors, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="pl-10 pr-8 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none"
                >
                  <option value="">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Book
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Recommendations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-heading font-bold">Recommended for You</h2>
            </div>
            <button className="flex items-center text-primary hover:text-primary/80 font-semibold">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {recommendations.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => router.push(`/books/${book._id}`)}
                className="glass dark:glass-dark rounded-lg p-2 group cursor-pointer"
              >
                <div className="relative mb-2">
                  <div className="aspect-[2/3] rounded-md bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                    {book.cover ? (
                      <Image
                        src={book.cover}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <BookOpen className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-white/80 dark:bg-gray-800/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="w-2.5 h-2.5 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 text-xs">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                  {book.author}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                    <span className="text-xs font-semibold">{book.rating}</span>
                  </div>
                  <span className="px-1 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                    {book.genres && book.genres[0] ? book.genres[0] : 'Fiction'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* All Books Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-heading font-bold">
                {searchQuery || selectedGenre ? 'Search Results' : 'Popular Books'}
              </h2>
              {filteredBooks.length > 0 && (
                <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                  {filteredBooks.length} books
                </span>
              )}
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="glass dark:glass-dark rounded-2xl p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No books found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters to find more books.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => router.push(`/books/${book._id}`)}
                  className="glass dark:glass-dark rounded-lg p-2 group cursor-pointer"
                >
                  <div className="relative mb-2">
                    <div className="aspect-[2/3] rounded-md bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                      {book.cover ? (
                        <Image
                          src={book.cover}
                          alt={book.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <BookOpen className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 rounded-full bg-white text-gray-900"
                        >
                          <Heart className="w-2.5 h-2.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 rounded-full bg-white text-gray-900"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 text-xs">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                    {book.author}
                  </p>
                  
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                      <span className="text-xs font-semibold">{book.rating}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-2 h-2 mr-0.5" />
                      {new Date(book.publishedDate).getFullYear()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    <span className="px-1 py-0.5 text-xs rounded-full bg-primary/10 text-primary line-clamp-1">
                      {book.genres && book.genres[0] ? book.genres[0] : 'Fiction'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
