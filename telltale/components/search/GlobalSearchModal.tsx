"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  X, 
  BookOpen, 
  User, 
  Users, 
  MessageCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResult {
  books: any[];
  users: any[];
  communities: any[];
  discussions: any[];
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState<SearchResult>({
    books: [],
    users: [],
    communities: [],
    discussions: []
  });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const tabs = [
    { id: "all", label: "All", icon: Search },
    { id: "books", label: "Books", icon: BookOpen },
    { id: "users", label: "Users", icon: User },
    { id: "communities", label: "Communities", icon: Users },
    { id: "discussions", label: "Discussions", icon: MessageCircle }
  ];

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Load recent searches from localStorage
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 2) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setResults({ books: [], users: [], communities: [], discussions: [] });
    }
  }, [query, activeTab]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${activeTab}&limit=5`);
      const data = await response.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (type: string, id: string, title: string) => {
    // Save to recent searches
    const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));

    // Navigate to result
    switch (type) {
      case "book":
        router.push(`/books/${id}`);
        break;
      case "user":
        router.push(`/profile/${id}`);
        break;
      case "community":
        router.push(`/communities/${id}`);
        break;
      case "discussion":
        router.push(`/discussions/${id}`);
        break;
    }
    onClose();
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="w-full max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search books, users, communities, discussions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-lg"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {query.length === 0 ? (
              // Recent searches and trending
              <div className="p-4">
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Recent Searches
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(search)}
                          className="block w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-300"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trending Searches
                  </h3>
                  <div className="space-y-2">
                    {["The Seven Husbands of Evelyn Hugo", "Dune", "Project Hail Mary", "The Midnight Library"].map((trend, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(trend)}
                        className="block w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-gray-700 dark:text-gray-300"
                      >
                        {trend}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Search className="w-8 h-8 text-primary mx-auto" />
                </motion.div>
                <p className="text-gray-500 mt-2">Searching...</p>
              </div>
            ) : (
              // Search results
              <div className="p-4 space-y-4">
                {(activeTab === "all" || activeTab === "books") && results.books.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Books
                    </h3>
                    <div className="space-y-2">
                      {results.books.map((book) => (
                        <button
                          key={book._id}
                          onClick={() => handleResultClick("book", book._id, book.title)}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                        >
                          <div className="w-10 h-12 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {book.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              by {book.author}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(activeTab === "all" || activeTab === "users") && results.users.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Users
                    </h3>
                    <div className="space-y-2">
                      {results.users.map((user) => (
                        <button
                          key={user._id}
                          onClick={() => handleResultClick("user", user._id, user.username)}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                            {user.username[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {user.username}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {(activeTab === "all" || activeTab === "communities") && results.communities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Communities
                    </h3>
                    <div className="space-y-2">
                      {results.communities.map((community) => (
                        <button
                          key={community._id}
                          onClick={() => handleResultClick("community", community._id, community.name)}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {community.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {community.memberCount} members
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {Object.values(results).every(arr => arr.length === 0) && query.length > 2 && !loading && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No results found for "{query}"</p>
                    <p className="text-sm text-gray-500 mt-1">Try different keywords or check your spelling</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10 text-center">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> to close
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}