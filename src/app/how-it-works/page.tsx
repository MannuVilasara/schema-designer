"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Database, Code, Download } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function HowItWorksPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: {},
    show: { transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white' 
        : 'bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      <Navbar isDark={isDark} toggleTheme={toggleTheme} scrollY={scrollY} />

      {/* Main Content */}
      <main className="pt-20 relative z-10">
        {/* Hero Section */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto text-center py-24 px-4"
        >
          <motion.div variants={fadeUp} className="mb-16">
            <div className={`inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full border backdrop-blur-sm transition-colors ${
              isDark 
                ? 'border-white/10 bg-white/5 text-gray-300' 
                : 'border-gray-200 bg-white/80 text-gray-600'
            }`}>
              <Eye className="w-4 h-4" />
              <span>How It Works</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simple 3-Step Process
            </h1>
            <p className={`text-xl max-w-2xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Get started with your MongoDB schema design in minutes. Our intuitive interface makes database design effortless.
            </p>
          </motion.div>
        </motion.section>

        {/* Steps Section */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-6xl mx-auto py-24 px-4 relative z-10"
        >
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Collections",
                description: "Start by adding collections to your schema. Simply click and drag to position them on the canvas. Each collection represents a document structure in your MongoDB database.",
                icon: Database,
                color: "blue",
                details: [
                  "Drag and drop interface",
                  "Visual positioning",
                  "Collection naming",
                  "Schema organization"
                ]
              },
              {
                step: "02", 
                title: "Define Fields",
                description: "Add fields to your collections with data types, validation rules, and relationships. Configure indexes, constraints, and references between collections.",
                icon: Code,
                color: "purple",
                details: [
                  "Multiple data types",
                  "Validation rules",
                  "Field relationships",
                  "Index configuration"
                ]
              },
              {
                step: "03",
                title: "Export & Use",
                description: "Generate code for Mongoose, Prisma, or JSON schemas. Export your design and integrate it directly into your projects with production-ready code.",
                icon: Download,
                color: "green",
                details: [
                  "Mongoose schemas",
                  "Prisma models",
                  "JSON export",
                  "TypeScript support"
                ]
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                className={`border backdrop-blur-sm p-8 rounded-2xl transition-all duration-300 ${
                  isDark 
                    ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10' 
                    : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:bg-white hover:shadow-lg'
                }`}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className={`w-16 h-16 mb-6 rounded-full flex items-center justify-center text-lg font-bold ${
                    step.color === 'blue' ? (isDark ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/30' : 'bg-blue-100 text-blue-600 border-2 border-blue-200') :
                    step.color === 'purple' ? (isDark ? 'bg-purple-500/20 text-purple-400 border-2 border-purple-500/30' : 'bg-purple-100 text-purple-600 border-2 border-purple-200') :
                    (isDark ? 'bg-green-500/20 text-green-400 border-2 border-green-500/30' : 'bg-green-100 text-green-600 border-2 border-green-200')
                  }`}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {step.step}
                </motion.div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className={`leading-relaxed mb-6 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>{step.description}</p>
                
                <ul className="space-y-2">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className={`flex items-center text-sm ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-3 ${
                        step.color === 'blue' ? (isDark ? 'bg-blue-400' : 'bg-blue-600') :
                        step.color === 'purple' ? (isDark ? 'bg-purple-400' : 'bg-purple-600') :
                        (isDark ? 'bg-green-400' : 'bg-green-600')
                      }`} />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Additional Information */}
        <motion.section
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto py-24 px-4 text-center"
        >
          <motion.div variants={fadeUp}>
            <h2 className="text-3xl font-bold mb-6">
              Why Choose Our Schema Designer?
            </h2>
            <p className={`text-lg mb-8 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Built for developers who want to move fast without sacrificing quality. Our visual approach to schema design helps you catch issues early and collaborate effectively.
            </p>
            <motion.button 
              className="px-8 py-3 rounded bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition text-white"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Designing Now
            </motion.button>
          </motion.div>
        </motion.section>
      </main>

      <Footer isDark={isDark} />
    </div>
  );
}
