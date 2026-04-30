"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  BookOpen, 
  Star, 
  Heart, 
  Calendar, 
  Settings, 
  Edit3,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Award,
  BookMarked
} from "lucide-react";

interface UserProfile {
  username: string;
  email: string;
  joinDate: string;
  favoriteGenres: string[];
  stats: {
    booksRead: number;
    reviewsWritten: number;
    averageRating: number;
    currentStreak: number;
    totalPages: number;
    favoriteGenre: string;
  };
}

interface ReadingActivity {
  id: string;
  bookTitle: string;
  action: "read" | "rated" | "reviewed" | "liked";
  date: string;
  rating?: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentActivity, setRecentActivity] = useState<ReadingActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    favoriteGenres: [] as string[]
  });

  const genres = [
    "Fiction", "Non-Fiction", "Mystery", "Thriller", "Romance", 
    "Sci-Fi", "Fantasy", "Horror", "Biography", "History", 
    "Self-Help", "Business", "Poetry", "Young Adult", "Children"
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session) {
      fetchProfile();
      fetchRecentActivity();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      // Simulate fetching user profile
      const mockProfile: UserProfile = {
        username: session?.user.name || "Book Lover",
        email: session?.user.email || "",
        joinDate: "2024-01-15",
        favoriteGenres: ["Fiction", "Mystery", "Sci-Fi"],
        stats: {
          booksRead: 24,
          reviewsWritten: 18,
          averageRating: 4.2,
          currentStreak: 7,
          totalPages: 8640,
          favoriteGenre: "Fiction"
        }
      };
      setProfile(mockProfile);
      setEditForm({
        username: mockProfile.username,
        favoriteGenres: mockProfile.favoriteGenres
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = () => {
    // Simulate recent activity
    const mockActivity: ReadingActivity[] = [
      {
        id: "1",
        bookTitle: "The Midnight Library",
        action: "read",
        date: "2024-04-20"
      },
      {
        id: "2",
        bookTitle: "Dune",
        action: "rated",
        date: "2024-04-19",
        rating: 5
      },
      {
        id: "3",
        bookTitle: "The Seven Husbands of Evelyn Hugo",
        action: "reviewed",
        date: "2024-04-18",
        rating: 4
      },
      {
        id: "4",
        bookTitle: "Project Hail Mary",
        action: "liked",
        date: "2024-04-17"
      }
    ];
    setRecentActivity(mockActivity);
  };

  const handleSaveProfile = () => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        username: editForm.username,
        favoriteGenres: editForm.favoriteGenres
      };
      setProfile(updatedProfile);
      setIsEditing(false);
      // Here you would save to the database
      console.log("Profile updated:", updatedProfile);
    }
  };

  const toggleGenre = (genre: string) => {
    setEditForm(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "read": return <BookOpen className="w-4 h-4" />;
      case "rated": return <Star className="w-4 h-4" />;
      case "reviewed": return <Edit3 className="w-4 h-4" />;
      case "liked": return <Heart className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "read": return "text-green-500 bg-green-100 dark:bg-green-900/20";
      case "rated": return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20";
      case "reviewed": return "text-blue-500 bg-blue-100 dark:bg-blue-900/20";
      case "liked": return "text-red-500 bg-red-100 dark:bg-red-900/20";
      default: return "text-gray-500 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <User className="w-16 h-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-teal-100 to-yellow-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass dark:glass-dark rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
                {profile.username[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                  {profile.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {profile.email}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
            </motion.button>
          </div>

          {/* Favorite Genres */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Favorite Genres
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {genres.map(genre => (
                    <motion.button
                      key={genre}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
                        editForm.favoriteGenres.includes(genre)
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {genre}
                    </motion.button>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveProfile}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.favoriteGenres.map(genre => (
                  <span
                    key={genre}
                    className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Reading Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="glass dark:glass-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                    <BookMarked className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">{profile.stats.booksRead}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Books Read</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">This year</p>
              </div>

              <div className="glass dark:glass-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">{profile.stats.averageRating}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Avg Rating</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Out of 5 stars</p>
              </div>

              <div className="glass dark:glass-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-teal-500">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">{profile.stats.currentStreak}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Day Streak</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Keep reading!</p>
              </div>

              <div className="glass dark:glass-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">{profile.stats.reviewsWritten}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Reviews</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Written</p>
              </div>

              <div className="glass dark:glass-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">{profile.stats.totalPages.toLocaleString()}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Pages Read</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              </div>

              <div className="glass dark:glass-dark rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-bold">{profile.stats.favoriteGenre}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Top Genre</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Most read</p>
              </div>
            </div>

            {/* Reading Goals */}
            <div className="glass dark:glass-dark rounded-2xl p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">
                2024 Reading Goals
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Books Read
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.stats.booksRead} / 50
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(profile.stats.booksRead / 50) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Reviews Written
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {profile.stats.reviewsWritten} / 30
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(profile.stats.reviewsWritten / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="glass dark:glass-dark rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-6">
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${getActivityColor(activity.action)}`}>
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action === "read" && "Finished reading"}
                        {activity.action === "rated" && "Rated"}
                        {activity.action === "reviewed" && "Reviewed"}
                        {activity.action === "liked" && "Liked"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {activity.bookTitle}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {activity.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-500">{activity.rating}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-3 text-center text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                View All Activity
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}