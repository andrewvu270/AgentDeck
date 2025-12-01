import { motion } from 'framer-motion';
import { Key, Bot, Activity } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Key,
    title: 'Add Your API Keys',
    description: 'Securely store your OpenAI, Anthropic, or Google AI credentials. All keys are encrypted.',
  },
  {
    number: '02',
    icon: Bot,
    title: 'Create Agents',
    description: 'Configure agents with custom prompts, select your preferred model, and set parameters.',
  },
  {
    number: '03',
    icon: Activity,
    title: 'Execute & Monitor',
    description: 'Run your agents and track execution history, token usage, and costs in real-time.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-32 px-6 bg-bg-secondary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold mb-6">
            Get started in <span className="gradient-text">3 simple steps</span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            From setup to execution in minutes. No complex configuration required.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting lines (desktop only) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-px bg-gradient-to-r from-primary via-secondary to-accent opacity-30"></div>

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Step number circle */}
              <div className="relative mb-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold relative z-10">
                  {step.number}
                </div>
                <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary blur-xl opacity-50"></div>
              </div>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-xl bg-bg-tertiary border border-border">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
