import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PaymentModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleBuyPro = () => {
    onClose();
    navigate('/activate');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md">
              <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl p-6">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
                >
                  <X size={20} />
                </button>

                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Upgrade to Pro
                  </h2>
                  <p className="text-gray-400">
                    Unlock advanced features with MernDesk Pro
                  </p>
                </div>

                {/* Pricing */}
                <div className="mb-6 p-4 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-xl border border-primary-500/20">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">₹4,999</span>
                    <span className="text-gray-400">one-time</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Lifetime license with all Pro features
                  </p>
                </div>

                {/* Features List */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                    </div>
                    <span className="text-gray-300">SLA Automation</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                    </div>
                    <span className="text-gray-300">AI Chatbot Integration</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                    </div>
                    <span className="text-gray-300">Priority Support</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                    </div>
                    <span className="text-gray-300">Advanced Analytics</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleBuyPro}
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40"
                >
                  Proceed to Payment
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure payment via UPI
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

