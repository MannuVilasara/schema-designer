"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components";
import { useTheme } from "next-themes";
import {
  motion,
  useInView,
  useAnimationControls,
  useScroll,
  useTransform,
} from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import {
  Database,
  Moon,
  Sun,
  ArrowRight,
  Zap,
  Users,
  Download,
  Upload,
  Link2,
  Sparkles,
  CheckCircle,
  Star,
  Github,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  // Scroll-based animations
  const { scrollY } = useScroll();
  const backgroundOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  const backgroundScale = useTransform(scrollY, [0, 300], [1, 1.1]);

  // Animation controls
  const controls = useAnimationControls();
  const isHeroInView = useInView(heroRef, { once: true });
  const isFeaturesInView = useInView(featuresRef, { once: true });

  // Spring animation for floating elements
  const floatingSpring = useSpring({
    from: { transform: "translateY(0px)" },
    to: async (next) => {
      while (true) {
        await next({ transform: "translateY(-10px)" });
        await next({ transform: "translateY(0px)" });
      }
    },
    config: { duration: 2000 },
  });

  // Counter animation
  const [counters, setCounters] = useState({
    users: 0,
    schemas: 0,
    downloads: 0,
  });

  useEffect(() => {
    setMounted(true);

    // Animate counters when component mounts
    const timer = setInterval(() => {
      setCounters((prev) => ({
        users: Math.min(prev.users + 50, 1200),
        schemas: Math.min(prev.schemas + 35, 850),
        downloads: Math.min(prev.downloads + 90, 2300),
      }));
    }, 100);

    setTimeout(() => clearInterval(timer), 2000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isHeroInView) {
      controls.start("visible");
    }
  }, [isHeroInView, controls]);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleGetStarted = () => {
    router.push("/designer");
  };

  return (
    <div
      className={`min-h-screen relative ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Global glassy background overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Main gradient background */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/30"
              : "bg-gradient-to-br from-gray-50 via-blue-50/60 to-purple-50/80"
          }`}
        />

        {/* Floating glass orbs */}
        <animated.div
          style={floatingSpring}
          className={`absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl ${
            isDark ? "bg-blue-500/10" : "bg-blue-300/20"
          }`}
        />
        <animated.div
          style={{
            ...floatingSpring,
            transform: floatingSpring.transform.to(
              (t) => `${t.replace("translateY(-10px)", "translateY(-15px)")}`
            ),
          }}
          className={`absolute top-40 right-20 w-80 h-80 rounded-full blur-3xl ${
            isDark ? "bg-purple-500/10" : "bg-purple-300/20"
          }`}
        />
        <animated.div
          style={{
            ...floatingSpring,
            transform: floatingSpring.transform.to((t) => `${t} rotate(45deg)`),
          }}
          className={`absolute bottom-20 left-1/3 w-72 h-72 rounded-full blur-3xl ${
            isDark ? "bg-cyan-500/10" : "bg-cyan-300/20"
          }`}
        />

        {/* Glass noise texture */}
        <div
          className={`absolute inset-0 opacity-30 ${
            isDark
              ? "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"
              : "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]"
          }`}
        />
      </div>

      {/* Header */}
      <header
        className={`relative z-10 border-b backdrop-blur-md ${
          isDark
            ? "border-white/10 bg-gray-900/70"
            : "border-gray-200/50 bg-white/70"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Database
                className={`w-8 h-8 ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <span
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                MongoDB Schema Designer
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className={
                isDark
                  ? "text-white hover:bg-gray-800"
                  : "text-gray-900 hover:bg-gray-100"
              }
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        ref={heroRef}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={
              isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
            }
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              className={`text-4xl md:text-6xl font-bold mb-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={
                isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Design MongoDB Schemas
              <motion.span
                className={`block ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={
                  isHeroInView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.8 }
                }
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Visually & Intuitively
              </motion.span>
            </motion.h1>

            <motion.p
              className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={
                isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Create, visualize, and manage your MongoDB database schemas with
              an intuitive drag-and-drop interface. Build relationships between
              collections and export your designs.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={
                isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3"
                >
                  <Github className="mr-2 h-5 w-5" />
                  View on GitHub
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              className={`grid grid-cols-3 gap-8 max-w-2xl mx-auto p-6 rounded-2xl border backdrop-blur-lg ${
                isDark
                  ? "bg-gray-900/30 border-white/10 shadow-xl shadow-blue-500/10"
                  : "bg-white/40 border-white/30 shadow-xl shadow-gray-500/10"
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={
                isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }
              }
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <div className="text-center">
                <motion.div
                  className={`text-2xl md:text-3xl font-bold ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                  initial={{ scale: 0 }}
                  animate={isHeroInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.5, delay: 1.2, type: "spring" }}
                >
                  {counters.users}+
                </motion.div>
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Active Users
                </div>
              </div>
              <div className="text-center">
                <motion.div
                  className={`text-2xl md:text-3xl font-bold ${
                    isDark ? "text-purple-400" : "text-purple-600"
                  }`}
                  initial={{ scale: 0 }}
                  animate={isHeroInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.5, delay: 1.4, type: "spring" }}
                >
                  {counters.schemas}+
                </motion.div>
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Schemas Created
                </div>
              </div>
              <div className="text-center">
                <motion.div
                  className={`text-2xl md:text-3xl font-bold ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                  initial={{ scale: 0 }}
                  animate={isHeroInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.5, delay: 1.6, type: "spring" }}
                >
                  {counters.downloads}+
                </motion.div>
                <div
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Downloads
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className={`relative z-10 py-20 backdrop-blur-sm ${
          isDark
            ? "bg-gray-800/50 border-t border-white/10"
            : "bg-white/50 border-t border-gray-200/50"
        }`}
        ref={featuresRef}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className={`text-3xl md:text-4xl font-bold text-center mb-16 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={
              isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.8 }}
          >
            Powerful Features
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Database,
                title: "Visual Schema Design",
                description:
                  "Create collections and fields with an intuitive visual interface. Drag, drop, and organize your database structure effortlessly.",
                color: "blue",
                delay: 0.1,
              },
              {
                icon: Link2,
                title: "Smart Relationships",
                description:
                  "Connect collections with ObjectId references. Visual lines show relationships with automatic validation and connection limits.",
                color: "green",
                delay: 0.2,
              },
              {
                icon: Download,
                title: "Export & Import",
                description:
                  "Save your schemas as JSON files. Import existing designs and collaborate with your team seamlessly.",
                color: "purple",
                delay: 0.3,
              },
              {
                icon: Zap,
                title: "Real-time Updates",
                description:
                  "See changes instantly as you design. Auto-save ensures you never lose your progress with persistent local storage.",
                color: "orange",
                delay: 0.4,
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description:
                  "Share schema designs with your team. Context menus and modals provide rich editing capabilities for collaborative work.",
                color: "red",
                delay: 0.5,
              },
              {
                icon: Sparkles,
                title: "Modern Interface",
                description:
                  "Beautiful dark/light themes with smooth animations. Responsive design that works perfectly on any device.",
                color: "cyan",
                delay: 0.6,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={`p-6 rounded-lg border backdrop-blur-md transition-all duration-300 hover:shadow-xl ${
                  isDark
                    ? "bg-gray-900/30 border-white/10 hover:border-white/20 hover:bg-gray-900/40"
                    : "bg-white/40 border-white/30 hover:border-white/40 hover:bg-white/60"
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={
                  isFeaturesInView
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 50 }
                }
                transition={{ duration: 0.8, delay: feature.delay }}
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.2 },
                }}
              >
                <motion.div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    feature.color === "blue"
                      ? isDark
                        ? "bg-blue-600"
                        : "bg-blue-100"
                      : feature.color === "green"
                      ? isDark
                        ? "bg-green-600"
                        : "bg-green-100"
                      : feature.color === "purple"
                      ? isDark
                        ? "bg-purple-600"
                        : "bg-purple-100"
                      : feature.color === "orange"
                      ? isDark
                        ? "bg-orange-600"
                        : "bg-orange-100"
                      : feature.color === "red"
                      ? isDark
                        ? "bg-red-600"
                        : "bg-red-100"
                      : isDark
                      ? "bg-cyan-600"
                      : "bg-cyan-100"
                  }`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <feature.icon
                    className={`w-6 h-6 ${
                      feature.color === "blue"
                        ? isDark
                          ? "text-white"
                          : "text-blue-600"
                        : feature.color === "green"
                        ? isDark
                          ? "text-white"
                          : "text-green-600"
                        : feature.color === "purple"
                        ? isDark
                          ? "text-white"
                          : "text-purple-600"
                        : feature.color === "orange"
                        ? isDark
                          ? "text-white"
                          : "text-orange-600"
                        : feature.color === "red"
                        ? isDark
                          ? "text-white"
                          : "text-red-600"
                        : isDark
                        ? "text-white"
                        : "text-cyan-600"
                    }`}
                  />
                </motion.div>
                <h3
                  className={`text-xl font-semibold mb-3 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {feature.title}
                </h3>
                <p className={isDark ? "text-gray-300" : "text-gray-600"}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div
          className={`max-w-4xl mx-auto text-center p-8 rounded-3xl backdrop-blur-lg border ${
            isDark
              ? "bg-gray-900/30 border-white/10 shadow-2xl shadow-blue-500/10"
              : "bg-white/40 border-white/30 shadow-2xl shadow-gray-500/10"
          }`}
        >
          <motion.h2
            className={`text-3xl md:text-4xl font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Design Your Database?
          </motion.h2>
          <motion.p
            className={`text-xl mb-8 ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Start creating professional MongoDB schemas in minutes. No setup
            required.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="text-lg px-8 py-3"
              >
                Start Designing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        className={`relative z-10 border-t py-8 backdrop-blur-md ${
          isDark
            ? "border-white/10 bg-gray-900/70"
            : "border-gray-200/50 bg-white/70"
        }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              className="flex items-center gap-3 mb-4 md:mb-0"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Database
                className={`w-6 h-6 ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <span
                className={`font-semibold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                MongoDB Schema Designer
              </span>
            </motion.div>
            <motion.p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              © 2025 Manpreet Singh. Built with Next.js and ReactFlow.
            </motion.p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
