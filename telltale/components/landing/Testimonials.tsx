"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Book Club Leader",
    avatar: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    text: "TellTale has transformed our book club! We can now discuss books, share recommendations, and stay connected between meetings. It's amazing!",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Book Blogger",
    avatar: "https://i.pravatar.cc/150?img=13",
    rating: 5,
    text: "I love how I can connect with my readers and discuss books together. The social features make it feel like a real community of book lovers!",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Teacher",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    text: "My students love discussing books with their friends on TellTale. It's made reading more social and engaging for them!",
  },
];

export default function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="testimonials" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4">
            What Our <span className="gradient-text">Community Says</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of book lovers connecting and sharing their passion
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="relative"
            >
              <div className="glass dark:glass-dark rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-gray-800">
                {/* Quote Icon */}
                <Quote className="w-12 h-12 text-primary/20 mb-4" />

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/50">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                  </motion.div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">4.9/5 Average Rating</span>
            </div>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
            <span className="font-semibold">5,000+ Book Lovers</span>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />
            <span className="font-semibold">50,000+ Discussions</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
