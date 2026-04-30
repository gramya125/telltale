"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Users, Search, Bell, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [notifications] = useState(3); // Mock notification count

  // Don't show on auth pages or landing page
  if (!session || pathname.startsWith('/auth') || pathname === '/') {
    return null;
  }

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/dashboard',
      isActive: pathname === '/dashboard' || pathname === '/home'
    },
    {
      id: 'communities',
      label: 'Communities',
      icon: Users,
      path: '/communities',
      isActive: pathname.startsWith('/communities')
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      path: '/search',
      isActive: pathname === '/search',
      action: 'search' // Special action instead of navigation
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/notifications',
      isActive: pathname === '/notifications',
      badge: notifications > 0 ? notifications : undefined
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      isActive: pathname === '/profile'
    }
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.action === 'search') {
      // Trigger global search modal
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);
    } else {
      router.push(item.path);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="glass dark:glass-dark border-t border-white/10 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavClick(item)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                  item.isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </motion.span>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">
                  {item.label}
                </span>
                
                {item.isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}