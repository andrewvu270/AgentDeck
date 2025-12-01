import { motion } from 'framer-motion';
import { Zap, DollarSign, Shield, Layers } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Multi-Provider Support',
    description: 'Connect OpenAI, Anthropic, and Google AI in one place. Switch between models effortlessly.',
    gradient: 'from-primary to-secondary',
    size: 'large',
  },
  {
    icon: Zap,
    title: 'Real-Time Execution',
    description: 'Watch your agents work in real-time with live execution logs.',
    gradient: 'from-secondary to-accent',
    size: 'small',
  },
  {
    icon: DollarSign,
    title: 'Cost Tracking',
    description: 'Monitor token usage and costs across all your agents.',
    gradient: 'from-accent to-primary',
    size: 'small',
  },
  {
    icon: Shield,
    title: 'Secure API Keys',
    description: 'Your API keys are encrypted with AES-256-GCM. We never see your keys.',
    gradient: 'from-primary to-accent',
    size: 'medium',
  },
];

export default function Features() {
  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold mb-6">
            Everything you need to
            <br />
            <span className="gradient-text">manage AI agents</span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            A powerful platform designed for developers who want simplicity without sacrificing control.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`
                group relative p-8 rounded-2xl bg-bg-tertiary border border-border
                hover:border-primary/50 transition-all duration-300
                ${feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                ${feature.size === 'medium' ? 'md:col-span-2' : ''}
              `}
            >
              {/* Gradient border effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>

                {/* Description */}
                <p className="text-text-secondary leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative element for large cards */}
                {feature.size === 'large' && (
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="h-20 rounded-lg bg-bg-secondary border border-border"></div>
                    <div className="h-20 rounded-lg bg-bg-secondary border border-border"></div>
                  </div>
                )}
              </div>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-300`}></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
