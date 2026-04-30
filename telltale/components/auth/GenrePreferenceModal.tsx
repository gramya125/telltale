"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

const genres = [
  { id: "fiction", name: "Fiction", emoji: "📚", color: "from-pink-400 to-pink-600" },
  { id: "non-fiction", name: "Non-Fiction", emoji: "📖", color: "from-teal-400 to-cyan-500" },
  { id: "mystery", name: "Mystery", emoji: "🔍", color: "from-gray-600 to-gray-800" },
  { id: "thriller", name: "Thriller", emoji: "😱", color: "from-red-400 to-orange-500" },
  { id: "romance", name: "Romance", emoji: "💕", color: "from-pink-500 to-rose-500" },
  { id: "sci-fi", name: "Science Fiction", emoji: "🚀", color: "from-cyan-400 to-blue-500" },
  { id: "fantasy", name: "Fantasy", emoji: "🐉", color: "from-purple-500 to-pink-500" },
  { id: "horror", name: "Horror", emoji: "👻", color: "from-gray-700 to-black" },
  { id: "biography", name: "Biography", emoji: "👤", color: "from-amber-400 to-orange-500" },
  { id: "history", name: "History", emoji: "🏛️", color: "from-yellow-500 to-amber-600" },
  { id: "self-help", name: "Self-Help", emoji: "💪", color: "from-green-400 to-emerald-500" },
  { id: "business", name: "Business", emoji: "💼", color: "from-blue-500 to-indigo-600" },
  { id: "poetry", name: "Poetry", emoji: "✍️", color: "from-pink-300 to-purple-400" },
  { id: "young-adult", name: "Young Adult", emoji: "🎓", color: "from-cyan-400 to-blue-400" },
  { id: "children", name: "Children's", emoji: "🧸", color: "from-yellow-300 to-orange-400" },
];

interface GenrePreferenceModalProps {
  isOpen: boolean;
  userId: string;
  onComplete: () => void;
}

export default function GenrePreferenceModal({
  isOpen,
  userId,
  onComplete,
}: GenrePreferenceModalProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSubmit = async () => {
    if (selectedGenres.length < 3) {
      toast.error("Please select at least 3 genres");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/user/genres", {
        userId,
        genres: selectedGenres,
      });

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF6B9D", "#4ECDC4", "#FFE66D"],
      });

      toast.success("Preferences saved! Let's find your perfect books!");
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto glass dark:glass-dark rounded-3xl p-8 md:p-10 shadow-2xl border border-white/20 pointer-events-auto"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-block mb-4"
                >
                  <Sparkles className="w-16 h-16 text-primary" />
                </motion.div>
                
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
                  Choose Your <span className="gradient-text">Favorite Genres</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Select at least 3 genres to personalize your recommendations
                </p>
                
                {/* Counter */}
                <motion.div
                  animate={{ scale: selectedGenres.length >= 3 ? [1, 1.1, 1] : 1 }}
                  className={`inline-block mt-4 px-4 py-2 rounded-full ${
                    selectedGenres.length >= 3
                      ? "bg-green-500/20 text-green-500"
                      : "bg-gray-500/20 text-gray-500"
                  }`}
                >
                  <span className="font-bold">{selectedGenres.length}</span> / 3 minimum
                </motion.div>
              </div>

              {/* Genre Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {genres.map((genre, index) => {
                  const isSelected = selectedGenres.includes(genre.id);
                  
                  return (
                    <motion.button
                      key={genre.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleGenre(genre.id)}
                      className={`relative p-4 rounded-2xl transition-all duration-300 ${
                        isSelected
                          ? `bg-gradient-to-br ${genre.color} text-white shadow-lg`
                          : "bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80"
                      }`}
                    >
                      {/* Check Icon */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Genre Content */}
                      <div className="text-center">
                        <div className="text-3xl mb-2">{genre.emoji}</div>
                        <div className={`text-sm font-semibold ${
                          isSelected ? "text-white" : "text-gray-700 dark:text-gray-300"
                        }`}>
                          {genre.name}
                        </div>
                      </div>

                      {/* Hover Effect */}
                      {!isSelected && (
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${genre.color} opacity-0 hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={selectedGenres.length < 3 || isLoading}
                  className="flex-1 btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>Continue</span>
                      <Sparkles className="w-5 h-5" />
                    </span>
                  )}
                </motion.button>
              </div>

              {/* Skip Option */}
              <p className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                You can always update your preferences later in settings
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
