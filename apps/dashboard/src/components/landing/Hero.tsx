import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero opacity-20 blur-3xl"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-tertiary border border-border mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-secondary">Manage AI Agents, Beautifully</span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">AI Agent Management</span>
            <br />
            Made Simple
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-12">
            Create, execute, and monitor AI agents from multiple providers in one elegant dashboard.
            No complexity, just results.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="group px-8 py-4 rounded-lg gradient-primary text-white font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-lg bg-bg-tertiary border border-border text-white font-semibold text-lg hover:bg-bg-secondary transition-all duration-200"
            >
              Sign In
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-text-secondary text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>OpenAI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Anthropic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Google AI</span>
            </div>
          </div>
        </motion.div>

        {/* Floating dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20"
        >
          <div className="relative">
            <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-3xl"></div>
            <div className="relative bg-bg-tertiary border border-border rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-4">
                <div className="h-12 bg-bg-secondary rounded-lg animate-pulse"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-bg-secondary rounded-lg animate-pulse"></div>
                  <div className="h-24 bg-bg-secondary rounded-lg animate-pulse delay-75"></div>
                  <div className="h-24 bg-bg-secondary rounded-lg animate-pulse delay-150"></div>
                </div>
                <div className="h-32 bg-bg-secondary rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </section>
  );
}
