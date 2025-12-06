import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Download, Sparkles, Zap, Shield, Code, Github, Ticket, Users, Mail, Bot, BarChart3, Lock, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentModal } from '../components/PaymentModal';
import { PricingTable } from '../components/PricingTable';

// TODO: Update with your actual GitHub repository URL
const GITHUB_URL = 'https://github.com/yourusername/merndesk';

export const Landing = () => {
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleDownloadCore = () => {
    window.open(GITHUB_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">MernDesk</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="#features"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Pricing
              </a>
              <button
                onClick={() => navigate('/login')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                Buy Pro
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-gray-300">Open Source Ticketing Tool</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Modern Ticketing
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12">
              An open-source ticketing solution with freemium model.
              Start free, upgrade to Pro for advanced automation and AI features.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadCore}
                className="group flex items-center gap-3 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Download Core
                <Github className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPaymentModalOpen(true)}
                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40"
              >
                Buy Pro License
                <span className="text-sm opacity-90">₹4,999</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid md:grid-cols-3 gap-6 mt-20"
          >
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Built for performance with modern tech stack',
              },
              {
                icon: Shield,
                title: 'Secure & Reliable',
                description: 'Enterprise-grade security and data protection',
              },
              {
                icon: Code,
                title: 'Open Source',
                description: 'Fully customizable and community-driven',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 hover:border-primary-500/50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to manage support tickets efficiently
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Ticket,
                title: 'Ticket Management',
                description: 'Create, track, and resolve tickets with ease. Full lifecycle management with status tracking.',
                color: 'from-blue-500/20 to-blue-600/20',
                iconColor: 'text-blue-400',
              },
              {
                icon: Users,
                title: 'User Management',
                description: 'Comprehensive user roles and permissions. Manage teams, departments, and access levels.',
                color: 'from-purple-500/20 to-purple-600/20',
                iconColor: 'text-purple-400',
              },
              {
                icon: Mail,
                title: 'Email Integration',
                description: 'Seamless email integration for ticket creation and notifications. IMAP and SMTP support.',
                color: 'from-green-500/20 to-green-600/20',
                iconColor: 'text-green-400',
              },
              {
                icon: Bot,
                title: 'AI Chatbot (Pro)',
                description: 'Intelligent AI-powered chatbot for instant customer support and ticket routing.',
                color: 'from-primary-500/20 to-primary-600/20',
                iconColor: 'text-primary-400',
              },
              {
                icon: BarChart3,
                title: 'Analytics & Reports',
                description: 'Advanced analytics and reporting. Track performance metrics and generate insights.',
                color: 'from-orange-500/20 to-orange-600/20',
                iconColor: 'text-orange-400',
              },
              {
                icon: Lock,
                title: 'Security & SSO',
                description: 'Enterprise-grade security with SSO support. SAML, OAuth, and Azure AD integration.',
                color: 'from-red-500/20 to-red-600/20',
                iconColor: 'text-red-400',
              },
              {
                icon: Settings,
                title: 'SLA Automation (Pro)',
                description: 'Automated SLA management with policy enforcement and escalation workflows.',
                color: 'from-primary-500/20 to-primary-600/20',
                iconColor: 'text-primary-400',
              },
              {
                icon: Shield,
                title: 'Multi-Factor Auth',
                description: 'Enhanced security with MFA support. Protect your account with two-factor authentication.',
                color: 'from-indigo-500/20 to-indigo-600/20',
                iconColor: 'text-indigo-400',
              },
              {
                icon: Code,
                title: 'API & Integrations',
                description: 'RESTful API for custom integrations. Connect with your existing tools and workflows.',
                color: 'from-cyan-500/20 to-cyan-600/20',
                iconColor: 'text-cyan-400',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`bg-gradient-to-br ${feature.color} backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-300`}
              >
                <div className={`w-12 h-12 bg-gray-900/50 rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400">
              Choose the plan that fits your needs
            </p>
          </motion.div>

          <PricingTable />
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
};

