import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Download, FileJson, Upload, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { validateTransaction, generateAndDownloadLicense } from '../utils/licenseGenerator';

export const ProActivation = () => {
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    try {
      const isValid = await validateTransaction(transactionId);
      
      if (isValid) {
        setIsValidated(true);
        toast.success('Transaction validated successfully!');
        // Auto-download license after a short delay
        setTimeout(() => {
          generateAndDownloadLicense(transactionId);
          toast.success('License file downloaded!');
        }, 500);
      } else {
        setError('Invalid transaction ID. Please check and try again.');
        toast.error('Validation failed');
      }
    } catch (err) {
      setError('An error occurred during validation. Please try again.');
      toast.error('Validation error');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-900/50 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <FileJson className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">MernDesk</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Activate Pro License
            </h1>
            <p className="text-xl text-gray-400">
              Complete your payment and activate your Pro features
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Payment & Activation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">Step 1: Complete Payment</h2>

                {/* UPI QR Code Placeholder */}
                <div className="mb-8">
                  <div className="bg-white p-6 rounded-xl flex items-center justify-center mb-4">
                    <div className="w-64 h-64 bg-gray-200 rounded-lg flex flex-col items-center justify-center gap-4">
                      <div className="w-48 h-48 bg-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📱</div>
                          <div className="text-sm font-semibold">UPI QR Code</div>
                          <div className="text-xs mt-1">Scan to Pay ₹4,999</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 text-center">
                    Scan this QR code with any UPI app to complete payment
                  </p>
                </div>

                {/* Transaction ID Input */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Payment Transaction ID
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => {
                        setTransactionId(e.target.value);
                        setError('');
                        setIsValidated(false);
                      }}
                      placeholder="Enter your UPI transaction ID"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={isValidating || isValidated}
                      required
                    />
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex items-center gap-2 text-red-400 text-sm"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </motion.div>
                    )}
                  </div>

                  <AnimatePresence>
                    {isValidated && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <div>
                          <p className="text-green-400 font-semibold">License Generated!</p>
                          <p className="text-sm text-gray-400">Your license.json file has been downloaded.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={isValidating || isValidated || !transactionId}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 flex items-center justify-center gap-2"
                  >
                    {isValidating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Validating...
                      </>
                    ) : isValidated ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        License Generated
                      </>
                    ) : (
                      <>
                        Validate & Download License
                        <Download className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Right Column - How to Activate */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6">Step 2: How to Activate</h2>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center border border-primary-500/50">
                        <span className="text-primary-400 font-bold">1</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">Download License File</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        After payment validation, your license.json file will be automatically downloaded.
                      </p>
                      <div className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-2">
                        <FileJson className="w-5 h-5 text-primary-400" />
                        <span className="text-sm text-gray-300 font-mono">license.json</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center border border-primary-500/50">
                        <span className="text-primary-400 font-bold">2</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">Locate MernDesk Root Directory</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        Navigate to your MernDesk installation directory.
                      </p>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <code className="text-sm text-gray-300 font-mono">
                          /path/to/merndesk/
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center border border-primary-500/50">
                        <span className="text-primary-400 font-bold">3</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">Drag & Drop License File</h3>
                      <p className="text-gray-400 text-sm mb-3">
                        Simply drag the license.json file into the MernDesk root directory.
                      </p>
                      <div className="bg-gray-800/50 rounded-lg p-4 border-2 border-dashed border-gray-700">
                        <div className="flex flex-col items-center justify-center gap-3 py-4">
                          <div className="w-16 h-16 bg-primary-500/10 rounded-xl flex items-center justify-center">
                            <Upload className="w-8 h-8 text-primary-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-300 font-semibold">Drop license.json here</p>
                            <p className="text-xs text-gray-500 mt-1">or place it in the root directory</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center border border-primary-500/50">
                        <span className="text-primary-400 font-bold">4</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">Restart Application</h3>
                      <p className="text-gray-400 text-sm">
                        Restart your MernDesk application. Pro features will be automatically activated!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visual Guide */}
                <div className="mt-8 p-6 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-xl border border-primary-500/20">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary-400" />
                    Activation Complete
                  </h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary-400" />
                      <span>SLA Automation enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary-400" />
                      <span>AI Chatbot activated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary-400" />
                      <span>Advanced analytics unlocked</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

