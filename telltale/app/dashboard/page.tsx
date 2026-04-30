"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Target, 
  Star, 
  Award,
  TrendingUp,
  Users,
  MessageCircle,
  Heart,
  Calendar,
  Plus,
  ChevronRight,
  BookMarked,
  Clock,
  Zap
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

interface Activity {
  id: string;
  type: 'read' | 'rated' | 'joined' | 'discussed';
  message: string;
  time: string;
  book?: {
    title: string;
    author: string;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    booksRead: 24,
    currentStreak: 7,
    totalRatings: 18,
    favoriteGenre: "Fiction"
  });

  const [activities] = useState<Activity[]>([
    {
      id: "1",
      type: "read",
      message: "Finished reading 'The Midnight Library'",
      time: "2 hours ago",
      book: { title: "The Midnight Library", author: "Matt Haig" }
    },
    {
      id: "2",
      type: "rated",
      message: "Rated 'Dune' 5 stars",
      time: "1 day ago",
      book: { title: "Dune", author: "Frank Herbert" }
    },
    {
      id: "3",
      type: "joined",
      message: "Joined Sci-Fi Enthusiasts community",
      time: "2 days ago"
    },
    {
      id: "4",
      type: "discussed",
      message: "Started a discussion about 'Project Hail Mary'",
      time: "3 days ago",
      book: { title: "Project Hail Mary", author: "Andy Weir" }
    }
  ]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      fetchRecommendations();
    }
  }, [status, router]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/books?limit=6");
      const data = await response.json();
      if (data.success) {
        setBooks(data.books);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'read': return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'rated': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'joined': return <Users className="w-4 h-4 text-blue-500" />;
      case 'discussed': return <MessageCircle className="w-4 h-4 text-purple-500" />;
      default: return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  };

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
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-teal-100 to-yellow-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, <span className="gradient-text">{session.user?.name}</span>! 📚
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Ready to continue your reading journey?
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="glass dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                <BookMarked className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.booksRead}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Books Read</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">This year</p>
          </div>

          <div className="glass dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.currentStreak}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Day Streak</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Keep it up!</p>
          </div>

          <div className="glass dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{userStats.totalRatings}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Reviews</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Books rated</p>
          </div>

          <div className="glass dark:glass-dark rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500">
                <Award className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{userStats.favoriteGenre}</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Top Genre</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Most read</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reading Goal Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass dark:glass-dark rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                  Reading Goal Progress
                </h2>
              </div>
              <button className="text-primary hover:text-primary/80 font-semibold text-sm">
                Update Goal
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  24 of 36 books completed
                </span>
                <span className="text-sm font-bold text-primary">67%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '67%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full"
                />
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              You're doing great! At this pace, you'll reach your goal by November.
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass dark:glass-dark rounded-2xl p-6"
          >
            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/communities")}
                className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
              >
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Join Communities</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
              >
                <Plus className="w-5 h-5 text-green-500" />
                <span className="font-medium">Add New Book</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/profile")}
                className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
              >
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Rate Books</span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                Recommended for You
              </h2>
            </div>
            <button className="flex items-center text-primary hover:text-primary/80 font-semibold">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {books.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => router.push(`/books/${book._id}`)}
                className="glass dark:glass-dark rounded-xl p-3 group cursor-pointer"
              >
                <div className="relative mb-3">
                  <div className="aspect-[2/3] rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                    {book.cover ? (
                      <Image
                        src={book.cover}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  </motion.button>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 text-sm">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {book.author}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs font-semibold">{book.rating}</span>
                    <span className="text-xs text-gray-500">({book.totalRatings})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {book.genres && book.genres.slice(0, 2).map(genre => (
                      <span
                        key={genre}
                        className="px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 glass dark:glass-dark rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
            </div>
            <button className="text-primary hover:text-primary/80 font-semibold text-sm">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {activity.message}
                  </p>
                  {activity.book && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.book.title} by {activity.book.author}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}