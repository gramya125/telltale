"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  MessageCircle,
  Globe,
  Lock,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Community {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  isPublic: boolean;
  category?: string;
  genre?: string;
  coverImage?: string;
  members?: string[];
  createdBy?: string;
}

export default function CommunitiesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"your" | "discover">("your");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    category: "Fiction",
    isPublic: true,
  });

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Sci-Fi",
    "Fantasy",
    "Romance",
    "Mystery",
    "Biography",
    "Self-Help",
    "Young Adult",
  ];

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch("/api/communities");
      const data = await response.json();
      if (data.success) {
        setCommunities(data.communities);
      }
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const getUserId = () => {
    return (session?.user as any)?.id || session?.user?.email || "anonymous";
  };

  const yourCommunities = communities.filter((c) =>
    c.members?.includes(getUserId())
  );

  const discoverCommunities = communities.filter(
    (c) => !c.members?.includes(getUserId())
  );

  const joinCommunity = async (communityId: string) => {
    if (!session) {
      showNotification("error", "Please sign in to join communities");
      return;
    }

    setJoining(communityId);
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: getUserId() }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification("success", "Joined community successfully!");
        await fetchCommunities();
      } else {
        showNotification("error", data.message || "Failed to join community");
      }
    } catch (error) {
      showNotification("error", "Failed to join community");
      console.error("Error joining community:", error);
    } finally {
      setJoining(null);
    }
  };

  const createCommunity = async () => {
    if (!session) {
      showNotification("error", "Please sign in to create communities");
      return;
    }

    if (!newCommunity.name.trim() || !newCommunity.description.trim()) {
      showNotification("error", "Name and description are required");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCommunity,
          createdBy: getUserId(),
          genre: newCommunity.category,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification("success", "Community created successfully!");
        setShowCreateModal(false);
        setNewCommunity({
          name: "",
          description: "",
          category: "Fiction",
          isPublic: true,
        });
        await fetchCommunities();
      } else {
        showNotification("error", data.message || "Failed to create community");
      }
    } catch (error) {
      showNotification("error", "Failed to create community");
      console.error("Error creating community:", error);
    } finally {
      setCreating(false);
    }
  };

  const filteredYourCommunities = yourCommunities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDiscoverCommunities = discoverCommunities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Users className="w-16 h-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-teal-100 to-yellow-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 pt-20 pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div
                className={`flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg ${
                  notification.type === "success"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{notification.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            Communities
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join book clubs, discuss with readers, and make friends who share
            your passion
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="glass dark:glass-dark rounded-2xl p-2 flex">
            <button
              onClick={() => setActiveTab("your")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "your"
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Your Communities ({yourCommunities.length})
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "discover"
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Discover ({discoverCommunities.length})
            </button>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl glass dark:glass-dark border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-800 dark:text-gray-200"
            />
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "your" ? (
            <motion.div
              key="your"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {filteredYourCommunities.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {searchQuery
                      ? "No communities found"
                      : "You haven't joined any communities yet"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery
                      ? "Try a different search term"
                      : "Discover amazing book communities and connect with fellow readers"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setActiveTab("discover")}
                      className="btn-primary"
                    >
                      Discover Communities
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredYourCommunities.map((community, index) => (
                    <CommunityCard
                      key={community._id}
                      community={community}
                      index={index}
                      isJoined={true}
                      onAction={() => router.push(`/communities/${community._id}`)}
                      actionLabel="Open"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="discover"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {filteredDiscoverCommunities.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No communities found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try a different search term or create your own community
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDiscoverCommunities.map((community, index) => (
                    <CommunityCard
                      key={community._id}
                      community={community}
                      index={index}
                      isJoined={false}
                      onAction={() => joinCommunity(community._id)}
                      actionLabel="Join"
                      isLoading={joining === community._id}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Community FAB — bottom-left to avoid overlapping the chatbot */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-8 left-8 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-lg z-40 hover:shadow-xl transition-shadow"
          title="Create Community"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-semibold hidden sm:inline">New Community</span>
        </motion.button>

        {/* Create Community Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass dark:glass-dark rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                    Create Community
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Community Name *
                    </label>
                    <input
                      type="text"
                      value={newCommunity.name}
                      onChange={(e) =>
                        setNewCommunity((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-800 dark:text-gray-200"
                      placeholder="Enter community name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newCommunity.description}
                      onChange={(e) =>
                        setNewCommunity((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none text-gray-800 dark:text-gray-200"
                      placeholder="Describe your community"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newCommunity.category}
                      onChange={(e) =>
                        setNewCommunity((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-800 dark:text-gray-200"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Privacy
                    </label>
                    <select
                      value={newCommunity.isPublic ? "public" : "private"}
                      onChange={(e) =>
                        setNewCommunity((prev) => ({
                          ...prev,
                          isPublic: e.target.value === "public",
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-gray-800 dark:text-gray-200"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={createCommunity}
                    disabled={
                      !newCommunity.name.trim() ||
                      !newCommunity.description.trim() ||
                      creating
                    }
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Community"
                    )}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Community Card Component
function CommunityCard({
  community,
  index,
  isJoined,
  onAction,
  actionLabel,
  isLoading = false,
}: {
  community: Community;
  index: number;
  isJoined: boolean;
  onAction: () => void;
  actionLabel: string;
  isLoading?: boolean;
}) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass dark:glass-dark rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => isJoined && router.push(`/communities/${community._id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center space-x-1">
          {community.isPublic ? (
            <Globe className="w-4 h-4 text-green-500" />
          ) : (
            <Lock className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-xs text-gray-500">
            {community.isPublic ? "Public" : "Private"}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {community.name}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
        {community.description}
      </p>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {community.memberCount}
          </span>
          {(community.category || community.genre) && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
              {community.category || community.genre}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction();
        }}
        disabled={isLoading}
        className={`w-full py-2 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
          isJoined
            ? "bg-primary text-white hover:bg-primary/90"
            : "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Joining...
          </>
        ) : isJoined ? (
          <>
            <MessageCircle className="w-4 h-4" />
            {actionLabel}
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            {actionLabel}
          </>
        )}
      </button>
    </motion.div>
  );
}
