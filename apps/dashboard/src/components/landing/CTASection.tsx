import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-hero opacity-10"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Headline */}
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to get started?
          </h2>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-2xl mx-auto">
            Join developers managing AI agents with AgentDeck. No credit card required.
          </p>

          {/* CTA Button */}
          <Link
            to="/register"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-xl gradient-primary text-white font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            Create Free Account
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Trust line */}
          <p className="mt-8 text-text-secondary text-sm">
            Free forever • No credit card required • 2 minute setup
          </p>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent opacity-5 rounded-full blur-3xl"></div>
    </section>
  );
}
