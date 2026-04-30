"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  BookOpen, 
  Calendar, 
  User, 
  Tag,
  Share2,
  Plus,
  MessageCircle
} from "lucide-react";
import { useSession } from "next-auth/react";
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
  isbn?: string;
}

export default function BookDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchBook(params.id as string);
    }
  }, [params.id]);

  const fetchBook = async (id: string) => {
    try {
      // For now, we'll simulate fetching a single book
      // In a real app, you'd have an API endpoint like /api/books/[id]
      const response = await fetch("/api/books");
      const data = await response.json();
      if (data.success) {
        const foundBook = data.books.find((b: Book) => b._id === id);
        setBook(foundBook || null);
      }
    } catch (error) {
      console.error("Error fetching book:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    // Here you would save the rating to the database
    console.log("Rating saved:", rating);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Here you would save the like to the database
  };

  const handleReviewSubmit = () => {
    if (review.trim() && userRating > 0) {
      // Here you would save the review to the database
      console.log("Review submitted:", { rating: userRating, review });
      setShowReviewForm(false);
      setReview("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <BookOpen className="w-16 h-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Book Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The book you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.back()}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-teal-100 to-yellow-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Books</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover and Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass dark:glass-dark rounded-2xl p-4 sticky top-24">
              {/* Book Cover */}
              <div className="aspect-[2/3] w-48 mx-auto rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-4 overflow-hidden">
                {book.cover ? (
                  <Image
                    src={book.cover}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <BookOpen className="w-16 h-16 text-gray-400" />
                )}
              </div>

              {/* Add to Library Dropdown */}
              <div className="mb-6">
                <select className="w-full px-4 py-3 rounded-xl bg-primary text-white font-semibold cursor-pointer">
                  <option>Want to Read</option>
                  <option>Currently Reading</option>
                  <option>Read</option>
                </select>
              </div>

              {/* User Rating */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rate This Book
                  </span>
                  <span className="text-sm text-gray-500">
                    {userRating > 0 ? `${userRating}/5` : "Not rated"}
                  </span>
                </div>
                <div className="flex space-x-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || userRating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                {userRating > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full py-2 text-sm bg-green-500 text-white rounded-lg font-semibold"
                  >
                    ✨ Rating Submitted!
                  </motion.button>
                )}
              </div>

              {/* Reading Progress (if in library) */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Reading Progress</span>
                  <span className="text-sm text-blue-600 dark:text-blue-400">65%</span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-3">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 py-2 text-xs bg-blue-500 text-white rounded-lg font-semibold">
                    Update Progress
                  </button>
                  <button className="flex-1 py-2 text-xs bg-green-500 text-white rounded-lg font-semibold">
                    Mark Completed
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLike}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all ${
                    isLiked
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                  <span>{isLiked ? "Liked" : "Add to Favorites"}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share Book</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Book Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Title and Author */}
            <div className="glass dark:glass-dark rounded-2xl p-6">
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                {book.title}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{book.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(book.publishedDate).getFullYear()}</span>
                </div>
              </div>

              {/* Rating and Stats */}
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold text-lg">{book.rating}</span>
                  </div>
                  <span className="text-gray-500">({book.totalRatings} ratings)</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {book.genres && book.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    <Tag className="w-3 h-3 inline mr-1" />
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="glass dark:glass-dark rounded-2xl p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                About This Book
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {book.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Published:</span>
                  <p className="font-medium">{new Date(book.publishedDate).getFullYear()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Pages:</span>
                  <p className="font-medium">320</p>
                </div>
                <div>
                  <span className="text-gray-500">ISBN:</span>
                  <p className="font-medium">{book.isbn || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Publisher:</span>
                  <p className="font-medium">Random House</p>
                </div>
              </div>
            </div>

            {/* Reviews & Comments */}
            <div className="glass dark:glass-dark rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                  Reviews & Comments
                </h2>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Write Review
                </button>
              </div>

              {/* Write Review Form */}
              {showReviewForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating (required)
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setUserRating(star)}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= userRating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Review (500 characters max)
                    </label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your thoughts about this book..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {review.length}/500 characters
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReviewSubmit}
                      disabled={userRating === 0}
                      className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Submit Review
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowReviewForm(false)}
                      className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {/* Sample Review */}
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      S
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Sarah Johnson</h4>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= 5 ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">2 days ago</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        This book completely blew my mind! The plot twists were unexpected and the character development was phenomenal. Couldn't put it down once I started reading.
                      </p>
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary transition-colors">
                          <Heart className="w-4 h-4" />
                          <span>12 likes</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Another Sample Review */}
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Mike Chen</h4>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">1 week ago</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        Great read overall! The writing style is engaging and the story keeps you hooked. Some parts felt a bit slow, but the ending made up for it.
                      </p>
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary transition-colors">
                          <Heart className="w-4 h-4" />
                          <span>8 likes</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass dark:glass-dark rounded-2xl p-6"
              >
                <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-4">
                  Write a Review
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating (required)
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setUserRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= userRating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review (optional)
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your thoughts about this book..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReviewSubmit}
                    disabled={userRating === 0}
                    className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Submit Review
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Similar Books */}
            <div className="glass dark:glass-dark rounded-2xl p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                Similar Books
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-[3/4] rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                      Similar Book Title {i}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Author Name
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}