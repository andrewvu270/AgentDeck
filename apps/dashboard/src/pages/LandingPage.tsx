import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Users, Zap, Shield, Code, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">AgentDeck</div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-gray-400 hover:text-white transition">
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Multi-Agent Orchestration Platform</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Orchestrate AI Agents
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                That Talk to Each Other
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Create specialized AI agents, facilitate multi-agent conversations, and extract deeper insights through agent-to-agent collaboration.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/register"
                className="group px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition flex items-center gap-2"
              >
                Start Building
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-semibold hover:bg-white/10 transition"
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl" />
            <div className="relative bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
              <div className="grid grid-cols-3 gap-4">
                {['Sales Agent', 'Marketing Agent', 'Strategy Agent'].map((name, i) => (
                  <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4" />
                    <div className="text-sm font-medium mb-2">{name}</div>
                    <div className="text-xs text-gray-500">Analyzing...</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-black/40 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-400">Multi-Agent Discussion</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/10 rounded-full w-3/4" />
                  <div className="h-2 bg-white/10 rounded-full w-1/2" />
                  <div className="h-2 bg-white/10 rounded-full w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for Collaboration
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to orchestrate intelligent agent conversations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'Multi-Agent Conversations',
                description: 'Agents discuss, debate, and collaborate with each other to generate comprehensive insights.',
              },
              {
                icon: Zap,
                title: 'Multiple Collaboration Modes',
                description: 'Sequential, parallel, debate, and brainstorm modes for different use cases.',
              },
              {
                icon: Sparkles,
                title: 'Specialized Personas',
                description: 'Create agents with unique system prompts for specific domains and expertise.',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your API keys are encrypted. Your data stays under your control.',
              },
              {
                icon: Code,
                title: 'Easy Integration',
                description: 'REST API with comprehensive documentation for seamless integration.',
              },
              {
                icon: MessageSquare,
                title: 'Real-time Insights',
                description: 'Watch agents interact and extract insights from their collaborative discussions.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple Yet Powerful
            </h2>
            <p className="text-xl text-gray-400">
              Get started in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Agents',
                description: 'Define specialized agents with custom system prompts and choose from OpenAI, Anthropic, or Google models.',
              },
              {
                step: '02',
                title: 'Start Conversations',
                description: 'Create multi-agent conversations and select collaboration modes that fit your use case.',
              },
              {
                step: '03',
                title: 'Extract Insights',
                description: 'Watch agents discuss and collaborate, then extract valuable insights from their interactions.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-white/5 mb-4">{item.step}</div>
                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Build Your
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Agent Team?
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Start orchestrating intelligent conversations today
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-2xl font-bold">AgentDeck</div>
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition">Documentation</a>
              <a href="#" className="hover:text-white transition">API</a>
              <a href="#" className="hover:text-white transition">GitHub</a>
              <a href="#" className="hover:text-white transition">Support</a>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 AgentDeck. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
