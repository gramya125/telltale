"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Menu, X, Moon, Sun, User, LogOut, Search, Bell, Home, Users, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import GlobalSearchModal from "@/components/search/GlobalSearchModal";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Mock notifications data
  const [notifications] = useState([
    { id: 1, type: 'follow', message: 'John followed you', time: '2 min ago', read: false },
    { id: 2, type: 'invite', message: 'Sarah invited you to Fantasy Book Club', time: '1 hour ago', read: false },
    { id: 3, type: 'like', message: 'Mike liked your review of The Hobbit', time: '2 hours ago', read: true },
    { id: 4, type: 'mention', message: 'You were mentioned in a discussion', time: 'yesterday', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const openGlobalSearch = () => {
    setShowSearchModal(true);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openGlobalSearch();
    }
    if (e.key === 'Escape') {
      setShowSearchModal(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!mounted) return null;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass dark:glass-dark shadow-lg py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={session ? "/dashboard" : "/"} className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <BookOpen className="w-8 h-8 text-primary" />
            </motion.div>
            <span className="text-2xl font-heading font-bold gradient-text">
              TellTale
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {session ? (
              // Authenticated Navigation
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/communities"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  <Users className="w-4 h-4" />
                  <span>Communities</span>
                </Link>
                
                {/* Search Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openGlobalSearch}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-gray-800/70 transition-colors"
                  title="Search (Cmd+K)"
                >
                  <Search className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">⌘K</span>
                </motion.button>

                {/* Notifications */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg glass dark:glass-dark hover:bg-white/20 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </motion.button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-80 glass dark:glass-dark rounded-xl shadow-xl border border-white/20 z-50"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                            <button className="text-sm text-primary hover:text-primary/80">
                              Mark all read
                            </button>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${
                                  !notification.read ? 'bg-primary/5 border-l-2 border-primary' : ''
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-primary' : 'bg-transparent'}`} />
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <Link
                              href="/notifications"
                              className="block text-center text-sm text-primary hover:text-primary/80"
                              onClick={() => setShowNotifications(false)}
                            >
                              View All Notifications
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                      {session.user.name?.[0]?.toUpperCase()}
                    </div>
                  </motion.button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 glass dark:glass-dark rounded-xl shadow-xl border border-white/20 z-50"
                      >
                        <div className="p-2">
                          <div className="px-3 py-2 border-b border-white/10">
                            <p className="font-medium text-gray-900 dark:text-white">{session.user.name}</p>
                            <p className="text-sm text-gray-500">{session.user.email}</p>
                          </div>
                          <div className="py-1">
                            <Link
                              href="/profile"
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <User className="w-4 h-4" />
                              <span>Profile</span>
                            </Link>
                            <Link
                              href="/dashboard"
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <Home className="w-4 h-4" />
                              <span>Dashboard</span>
                            </Link>
                            <Link
                              href="/settings"
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <Settings className="w-4 h-4" />
                              <span>Settings</span>
                            </Link>
                            <button
                              onClick={() => {
                                setShowProfileMenu(false);
                                handleSignOut();
                              }}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 rounded-lg transition-colors w-full text-left"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              // Unauthenticated Navigation
              <>
                <Link
                  href="#how-it-works"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  How It Works
                </Link>
                <Link
                  href="#featured"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  Featured Books
                </Link>
                <Link
                  href="/communities"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors duration-300"
                >
                  Communities
                </Link>
                <Link href="/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-outline"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </>
            )}

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg glass dark:glass-dark"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg glass dark:glass-dark"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </motion.button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 glass dark:glass-dark rounded-lg p-4"
            >
              <div className="flex flex-col space-y-4">
                {session ? (
                  // Authenticated Mobile Menu
                  <>
                    <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                        {session.user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {session.user.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/home"
                      className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/communities"
                      className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Communities
                    </Link>
                    <Link
                      href="/profile"
                      className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  // Unauthenticated Mobile Menu
                  <>
                    <Link
                      href="#how-it-works"
                      className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      How It Works
                    </Link>
                    <Link
                      href="#featured"
                      className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Featured Books
                    </Link>
                    <Link
                      href="/communities"
                      className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Communities
                    </Link>
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full btn-outline">Login</button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full btn-primary">Sign Up</button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal 
        isOpen={showSearchModal} 
        onClose={() => setShowSearchModal(false)} 
      />
    </motion.nav>
  );
}