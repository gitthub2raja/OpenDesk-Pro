import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export const PricingTable = () => {
  const features = [
    {
      name: 'Manual Support',
      basic: true,
      pro: true,
    },
    {
      name: 'Ticket Management',
      basic: true,
      pro: true,
    },
    {
      name: 'User Management',
      basic: true,
      pro: true,
    },
    {
      name: 'Email Integration',
      basic: true,
      pro: true,
    },
    {
      name: 'SLA Automation',
      basic: false,
      pro: true,
    },
    {
      name: 'AI Chatbot',
      basic: false,
      pro: true,
    },
    {
      name: 'Advanced Analytics',
      basic: false,
      pro: true,
    },
    {
      name: 'Priority Support',
      basic: false,
      pro: true,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8"
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-white">Basic</h3>
              <span className="px-3 py-1 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                Open Source
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold text-white">Free</span>
              <span className="text-gray-400">Forever</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Perfect for small teams getting started
            </p>
          </div>

          <ul className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                {feature.basic ? (
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                )}
                <span className={feature.basic ? 'text-gray-300' : 'text-gray-600'}>
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Pro Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-primary-500/10 to-primary-600/10 backdrop-blur-xl border-2 border-primary-500/50 rounded-2xl p-8 relative overflow-hidden"
        >
          {/* Popular Badge */}
          <div className="absolute top-6 right-6">
            <span className="px-3 py-1 text-xs font-semibold bg-primary-500/20 text-primary-400 rounded-full border border-primary-500/50">
              Enterprise
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold text-white">₹4,999</span>
              <span className="text-gray-400">one-time</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Advanced features for growing teams
            </p>
          </div>

          <ul className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                {feature.pro ? (
                  <Check className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                )}
                <span className={feature.pro ? 'text-gray-300' : 'text-gray-600'}>
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

