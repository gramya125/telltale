"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { UserPlus, Heart, BookOpen, Sparkles, MessageCircle, Users } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up and tell us about your reading preferences and favorite genres.",
    color: "from-pink-400 to-pink-600",
  },
  {
    icon: MessageCircle,
    title: "Discuss & Share",
    description: "Connect with friends, share your thoughts, and join book discussions.",
    color: "from-teal-400 to-cyan-500",
  },
  {
    icon: Sparkles,
    title: "Get Recommendations",
    description: "Discover books based on your taste and what your friends are reading.",
    color: "from-yellow-400 to-amber-500",
  },
];

export default function HowItWorks() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="how-it-works" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Three simple steps to discover books and connect with fellow readers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative group"
            >
              {/* Connection Line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-1/2 z-0" />
              )}

              <div className="relative glass dark:glass-dark rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/30">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} p-4 mb-6 shadow-lg`}
                >
                  <step.icon className="w-full h-full text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-heading font-bold mb-4 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>

                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Ready to find your next great read?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary text-lg px-8 py-4"
          >
            Start Your Journey
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
