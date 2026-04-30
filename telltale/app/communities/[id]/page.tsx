"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Send,
  ArrowLeft,
  Bot,
  Globe,
  Lock,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Message {
  _id: string;
  communityId: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  createdAt: string;
  type?: "bot" | "user";
}

interface Community {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  isPublic: boolean;
  category?: string;
  genre?: string;
}

// Dummy seed messages shown when community has no real messages yet
const DUMMY_MESSAGES: Omit<Message, "communityId">[] = [
  {
    _id: "dummy-1",
    userId: "user-alice",
    username: "Alice",
    message: "Hey everyone! Just finished reading 'The Midnight Library' — absolutely loved it! 📚",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "dummy-2",
    userId: "user-bob",
    username: "Bob",
    message: "Oh I read that last month! The concept of parallel lives is so fascinating. Did you like the ending?",
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
  {
    _id: "dummy-3",
    userId: "telltale-bot",
    username: "TellTale Bot",
    message: "Great choice! 🌟 What's the one life decision you'd want to explore in your own 'Midnight Library'? I'm curious what everyone would change!",
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    type: "bot",
  },
  {
    _id: "dummy-4",
    userId: "user-alice",
    username: "Alice",
    message: "Honestly? I'd explore the path where I studied literature instead of engineering 😅",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    _id: "dummy-5",
    userId: "user-carol",
    username: "Carol",
    message: "Same! Also — has anyone read anything by Matt Haig besides this one? Recommendations?",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const communityId = params.id as string;
  const { data: session } = useSession();

  const [community, setCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [useDummy, setUseDummy] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const getUserId = () =>
    (session?.user as any)?.id || session?.user?.email || "anonymous";

  const getUsername = () =>
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "Reader";

  // Fetch community info
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await fetch(`/api/communities/${communityId}`);
        const data = await res.json();
        if (data.success && data.community) {
          setCommunity({
            ...data.community,
            category:
              data.community.genre ||
              data.community.category ||
              "General",
          });
        }
      } catch (err) {
        console.error("Error fetching community:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunity();
  }, [communityId]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/communities/${communityId}/messages`);
      const data = await res.json();
      if (data.success) {
        const msgs: Message[] = data.messages.map((m: any) => ({
          ...m,
          _id: m._id?.toString() || m._id,
        }));

        if (msgs.length === 0) {
          // Show dummy messages if no real messages exist
          setUseDummy(true);
          setMessages(
            DUMMY_MESSAGES.map((m) => ({ ...m, communityId }))
          );
        } else {
          setUseDummy(false);
          setMessages(msgs);
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [communityId]);

  // Bot always replies to every user message — show typing, call API, fetch result
  const scheduleBotResponse = useCallback((lastUserMessage: string) => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    // Small natural delay (1.5–3s) so it feels like the bot is reading
    const delay = 1500 + Math.random() * 1500;
    botTimerRef.current = setTimeout(async () => {
      setBotTyping(true);
      try {
        await fetch(`/api/communities/${communityId}/bot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "auto_reply",
            triggerMessage: lastUserMessage,
          }),
        });
        // Short extra pause to simulate typing before revealing the message
        setTimeout(async () => {
          setBotTyping(false);
          await fetchMessages();
          scrollToBottom();
        }, 800);
      } catch {
        setBotTyping(false);
      }
    }, delay);
  }, [communityId, fetchMessages, scrollToBottom]);

  // Initial load + polling
  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 6000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [fetchMessages]);

  // Scroll when messages change; trigger bot on every new user message
  useEffect(() => {
    scrollToBottom();
    if (!useDummy && messages.length > lastMessageCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      // Only trigger for real user messages, not bot messages
      if (lastMsg && lastMsg.userId !== "telltale-bot" && lastMsg.type !== "bot") {
        scheduleBotResponse(lastMsg.message);
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, useDummy, scheduleBotResponse, scrollToBottom]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // If using dummy messages, switch to real mode and clear dummies
    if (useDummy) {
      setUseDummy(false);
      setMessages([]);
    }

    setSending(true);
    try {
      const res = await fetch(`/api/communities/${communityId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getUserId(),
          username: getUsername(),
          avatar: session?.user?.image || "",
          message: messageText,
        }),
      });

      if (res.ok) {
        await fetchMessages();
        scrollToBottom();
        // Bot always replies to user messages
        scheduleBotResponse(messageText);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === today.toDateString()) return "Today";
      if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  messages.forEach((msg) => {
    const label = formatDateLabel(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === label) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: label, msgs: [msg] });
    }
  });

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

  if (!community) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
        <MessageCircle className="w-16 h-16 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
          Community not found
        </h2>
        <button
          onClick={() => router.push("/communities")}
          className="btn-primary"
        >
          Back to Communities
        </button>
      </div>
    );
  }

  const currentUserId = getUserId();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-100 via-teal-100 to-yellow-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* ── Header ── */}
      <div className="glass dark:glass-dark border-b border-white/20 pt-20 z-30 flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          {/* Back */}
          <button
            onClick={() => router.push("/communities")}
            className="p-2 rounded-xl hover:bg-white/30 dark:hover:bg-gray-700/50 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">
              {community.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {community.memberCount} members
              </span>
              <span className="flex items-center gap-1">
                {community.isPublic ? (
                  <Globe className="w-3 h-3 text-green-500" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
                {community.isPublic ? "Public" : "Private"}
              </span>
              {community.category && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  {community.category}
                </span>
              )}
            </div>
          </div>

          {/* Bot active indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium hidden sm:inline">
              Bot active
            </span>
          </div>
        </div>

        {community.description && (
          <div className="container mx-auto px-4 pb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {community.description}
            </p>
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          {useDummy && (
            <div className="text-center mb-4">
              <span className="text-xs text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
                Sample conversation — send a message to start chatting!
              </span>
            </div>
          )}

          {groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400 px-2">{group.date}</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="space-y-3">
                {group.msgs.map((msg, i) => {
                  const isBot =
                    msg.userId === "telltale-bot" || msg.type === "bot";
                  const isOwn = msg.userId === currentUserId && !isBot;

                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`flex items-end gap-2 ${
                        isOwn ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
                          isBot
                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                            : isOwn
                            ? "bg-gradient-to-r from-primary to-secondary"
                            : "bg-gradient-to-r from-teal-400 to-blue-500"
                        }`}
                      >
                        {isBot ? (
                          <Bot className="w-4 h-4" />
                        ) : msg.avatar ? (
                          <img
                            src={msg.avatar}
                            alt={msg.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          (msg.username?.charAt(0) || "?").toUpperCase()
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[72%] flex flex-col gap-0.5 ${
                          isOwn ? "items-end" : "items-start"
                        }`}
                      >
                        {!isOwn && (
                          <span
                            className={`text-xs font-semibold px-1 ${
                              isBot
                                ? "text-purple-500 dark:text-purple-400"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {isBot ? "✨ TellTale Bot" : msg.username}
                          </span>
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                            isBot
                              ? "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                              : isOwn
                              ? "bg-gradient-to-r from-primary to-secondary text-white rounded-br-sm"
                              : "bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                          }`}
                        >
                          {msg.message}
                        </div>
                        <span className="text-xs text-gray-400 px-1">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Bot typing indicator */}
          <AnimatePresence>
            {botTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-end gap-2 mt-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col gap-0.5 items-start">
                  <span className="text-xs font-semibold text-purple-500 dark:text-purple-400 px-1">
                    ✨ TellTale Bot
                  </span>
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* ── Input ── */}
      <div className="glass dark:glass-dark border-t border-white/20 flex-shrink-0 z-30">
        <div className="container mx-auto px-4 py-3 max-w-3xl">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 120) + "px";
              }}
              placeholder="Share your thoughts..."
              rows={1}
              className="flex-1 px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400"
              style={{ maxHeight: "120px" }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="w-11 h-11 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
