"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Bell, 
  User, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  BookOpen,
  Check,
  X,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Notification {
  _id: string;
  type: 'follow' | 'like' | 'comment' | 'invite' | 'mention' | 'book_recommendation';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionData?: {
    userId?: string;
    bookId?: string;
    communityId?: string;
    inviteId?: string;
  };
  sender?: {
    _id: string;
    username: string;
    avatar?: string;
  };
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'invites'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          _id: "1",
          type: "follow",
          title: "New Follower",
          message: "John Smith started following you",
          timestamp: "2024-04-21T10:30:00Z",
          read: false,
          actionUrl: "/profile/john-smith",
          sender: { _id: "user1", username: "John Smith" }
        },
        {
          _id: "2",
          type: "invite",
          title: "Community Invitation",
          message: "Sarah invited you to join 'Fantasy Book Club'",
          timestamp: "2024-04-21T09:15:00Z",
          read: false,
          actionData: { communityId: "community1", inviteId: "invite1" },
          sender: { _id: "user2", username: "Sarah Johnson" }
        },
        {
          _id: "3",
          type: "like",
          title: "Review Liked",
          message: "Mike liked your review of 'The Hobbit'",
          timestamp: "2024-04-21T08:45:00Z",
          read: false,
          actionUrl: "/books/book1",
          sender: { _id: "user3", username: "Mike Chen" }
        },
        {
          _id: "4",
          type: "comment",
          title: "New Reply",
          message: "Emma replied to your discussion about 'Dune'",
          timestamp: "2024-04-20T16:20:00Z",
          read: true,
          actionUrl: "/discussions/discussion1",
          sender: { _id: "user4", username: "Emma Wilson" }
        },
        {
          _id: "5",
          type: "mention",
          title: "You were mentioned",
          message: "Alex mentioned you in a discussion about sci-fi recommendations",
          timestamp: "2024-04-20T14:10:00Z",
          read: true,
          actionUrl: "/discussions/discussion2",
          sender: { _id: "user5", username: "Alex Rodriguez" }
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif._id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleInviteAction = async (notificationId: string, action: 'accept' | 'reject') => {
    // Handle invite acceptance/rejection
    console.log(`${action} invite for notification ${notificationId}`);
    
    // Remove the notification after action
    setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow': return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'invite': return <User className="w-5 h-5 text-purple-500" />;
      case 'mention': return <MessageCircle className="w-5 h-5 text-orange-500" />;
      case 'book_recommendation': return <BookOpen className="w-5 h-5 text-indigo-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.read;
      case 'invites': return notif.type === 'invite';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Bell className="w-16 h-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-teal-100 to-yellow-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 pt-24">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
              </p>
            </div>
            
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Mark all as read
              </motion.button>
            )}
          </div>

          {/* Filters */}
          <div className="flex space-x-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'invites', label: 'Invites' }
            ].map(filterOption => (
              <button
                key={filterOption.id}
                onClick={() => setFilter(filterOption.id as any)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                  filter === filterOption.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {filterOption.label}
                {filterOption.id === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {filteredNotifications.length === 0 ? (
            <div className="glass dark:glass-dark rounded-2xl p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'unread' 
                  ? "You have no unread notifications"
                  : filter === 'invites'
                  ? "You have no pending invites"
                  : "You're all caught up!"
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`glass dark:glass-dark rounded-2xl p-6 transition-all cursor-pointer hover:shadow-lg ${
                  !notification.read 
                    ? 'border-l-4 border-primary bg-primary/5' 
                    : 'hover:bg-white/70 dark:hover:bg-gray-800/70'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Avatar */}
                  {notification.sender && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                        {notification.sender.username[0]?.toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                        <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Invite Actions */}
                    {notification.type === 'invite' && (
                      <div className="flex space-x-3 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInviteAction(notification._id, 'accept');
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInviteAction(notification._id, 'reject');
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline</span>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}