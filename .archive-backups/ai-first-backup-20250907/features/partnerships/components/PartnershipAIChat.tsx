import { memo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Mic,
  ArrowUp,
  Plus,
  FileText,
  Code,
  BookOpen,
  PenTool,
  BrainCircuit,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

interface PartnershipAIChatProps {
  onApplyNow: () => void;
}

export const PartnershipAIChat = memo(({ onApplyNow }: PartnershipAIChatProps) => {
  const [inputValue, setInputValue] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [deepResearchEnabled, setDeepResearchEnabled] = useState(false);
  const [reasonEnabled, setReasonEnabled] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showUploadAnimation, setShowUploadAnimation] = useState(false);
  const [activeCommandCategory, setActiveCommandCategory] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{message: string, response: string}>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const partnershipSuggestions = {
    partnership: [
      "How quickly do I get paid?",
      "What commission rates do you offer?",
      "Do I need technical knowledge?",
      "What support do you provide?",
      "Can I see examples of previous work?",
    ],
    process: [
      "How does the referral process work?",
      "What happens after I refer a client?",
      "How do you onboard new clients?",
      "What's the typical project timeline?",
      "How do you handle client communication?",
    ],
    earnings: [
      "What's the earning potential?",
      "How do you calculate commissions?",
      "When do payments get processed?",
      "Are there performance bonuses?",
      "What's your top partner earning?",
    ],
  };

  const handleUploadFile = () => {
    setShowUploadAnimation(true);
    setTimeout(() => {
      const newFile = `Partnership_Info.pdf`;
      setUploadedFiles((prev) => [...prev, newFile]);
      setShowUploadAnimation(false);
    }, 1500);
  };

  const handleCommandSelect = (command: string) => {
    setInputValue(command);
    setActiveCommandCategory(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Add a response based on the question
      const response = getPartnershipResponse(inputValue);
      setChatMessages(prev => [...prev, { message: inputValue, response }]);
      setInputValue("");
    }
  };

  const getPartnershipResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes("paid") || q.includes("payment")) {
      return "Commission is paid within 7 days of final client payment. We use secure bank transfers for all payments.";
    } else if (q.includes("commission") || q.includes("rate")) {
      return "Our commission rates range from 15-25% depending on project size and your partnership tier. Premium partners can earn up to 30%.";
    } else if (q.includes("technical") || q.includes("knowledge")) {
      return "Not at all! We handle all technical aspects. You focus on relationship building and connecting us with potential clients.";
    } else if (q.includes("support")) {
      return "Complete training materials, marketing collateral, technical support, client communication templates, and a dedicated partner manager.";
    } else if (q.includes("examples") || q.includes("work") || q.includes("portfolio")) {
      return "Yes! We provide a complete portfolio, case studies, and can arrange calls with existing clients for references.";
    } else {
      return "That's a great question! I'd be happy to connect you with our partnership team for a detailed discussion. They can provide personalized answers based on your specific situation.";
    }
  };

  const openNewChat = () => {
    // This would typically open a new chat window or navigate to a chat page
    console.log("Opening new chat with breadcrumb navigation");
  };

  return (
    <div id="faq" className="w-full px-4 pb-32">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-xl md:text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular text-center text-white mx-auto mb-6">
            Ask Our AI <span className="text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-500 bg-clip-text">Assistant</span>
          </h2>
          <p className="text-lg leading-relaxed tracking-tight text-gray-300 max-w-2xl mx-auto">
            Get instant answers about our partnership program, commission structure, and more.
          </p>
        </motion.div>

        {/* Chat Messages Display */}
        {chatMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-4 max-h-96 overflow-y-auto"
          >
            {chatMessages.map((chat, index) => (
              <div key={index} className="space-y-3">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-orange-500/20 border border-orange-500/30 rounded-2xl px-4 py-3 max-w-md">
                    <p className="text-white text-sm">{chat.message}</p>
                  </div>
                </div>
                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl px-4 py-3 max-w-md">
                    <p className="text-gray-300 text-sm">{chat.response}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* AI Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm 
            border border-gray-700/50 rounded-2xl overflow-hidden mb-8"
        >
          {/* Input Area */}
          <div className="p-6">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about partnership benefits, commissions, process..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full bg-transparent text-white text-lg outline-none 
                placeholder:text-gray-400 border-b border-gray-600/50 pb-3 
                focus:border-orange-500/50 transition-colors duration-300"
            />
          </div>          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="px-6 pb-3">
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-700/50 py-1 px-2 rounded-md 
                      border border-gray-600/50"
                  >
                    <FileText className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-gray-300">{file}</span>
                    <button
                      onClick={() =>
                        setUploadedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="text-gray-400 hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Features & Actions */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700/30">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchEnabled(!searchEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  searchEnabled
                    ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                    : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50"
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
              <button
                onClick={() => setDeepResearchEnabled(!deepResearchEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  deepResearchEnabled
                    ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                    : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50"
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Research</span>
              </button>
              <button
                onClick={() => setReasonEnabled(!reasonEnabled)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  reasonEnabled
                    ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
                    : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={openNewChat}
                className="p-2 text-gray-400 hover:text-orange-400 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                  inputValue.trim()
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Upload Files */}
          <div className="px-6 py-3 border-t border-gray-700/30">
            <button
              onClick={handleUploadFile}
              className="flex items-center gap-2 text-gray-400 text-sm hover:text-orange-400 
                transition-colors"
            >
              {showUploadAnimation ? (
                <motion.div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Upload Partnership Documents</span>
            </button>
          </div>
        </motion.div>

        {/* Question Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <CategoryButton
            icon={<MessageCircle className="w-5 h-5" />}
            label="Partnership"
            isActive={activeCommandCategory === "partnership"}
            onClick={() =>
              setActiveCommandCategory(
                activeCommandCategory === "partnership" ? null : "partnership"
              )
            }
          />
          <CategoryButton
            icon={<BookOpen className="w-5 h-5" />}
            label="Process"
            isActive={activeCommandCategory === "process"}
            onClick={() =>
              setActiveCommandCategory(
                activeCommandCategory === "process" ? null : "process"
              )
            }
          />
          <CategoryButton
            icon={<PenTool className="w-5 h-5" />}
            label="Earnings"
            isActive={activeCommandCategory === "earnings"}
            onClick={() =>
              setActiveCommandCategory(
                activeCommandCategory === "earnings" ? null : "earnings"
              )
            }
          />
        </div>        {/* Question Suggestions */}
        <AnimatePresence>
          {activeCommandCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mb-8 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 
                backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-700/30">
                  <h3 className="text-lg font-semibold text-white">
                    {activeCommandCategory === "partnership"
                      ? "Partnership Questions"
                      : activeCommandCategory === "process"
                      ? "Process Questions"
                      : "Earnings Questions"}
                  </h3>
                </div>
                <ul className="divide-y divide-gray-700/30">
                  {partnershipSuggestions[
                    activeCommandCategory as keyof typeof partnershipSuggestions
                  ].map((suggestion, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleCommandSelect(suggestion)}
                      className="p-4 hover:bg-orange-500/10 cursor-pointer transition-colors duration-300"
                    >
                      <div className="flex items-center gap-3">
                        {activeCommandCategory === "partnership" ? (
                          <MessageCircle className="w-4 h-4 text-orange-400" />
                        ) : activeCommandCategory === "process" ? (
                          <BookOpen className="w-4 h-4 text-orange-400" />
                        ) : (
                          <PenTool className="w-4 h-4 text-orange-400" />
                        )}
                        <span className="text-gray-300 hover:text-white transition-colors">
                          {suggestion}
                        </span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="relative bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-gray-900/80 
            backdrop-blur-xl border border-gray-700/40 rounded-3xl p-12 lg:p-16
            shadow-2xl shadow-black/30 overflow-hidden">
            
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 opacity-60"></div>
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
            
            {/* Header Section */}
            <div className="relative z-10 mb-12">
              <motion.h3 
                className="text-xl md:text-3xl md:text-5xl tracking-tighter font-regular text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Ready to Start <span className="text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text">Earning?</span>
              </motion.h3>
              <motion.p 
                className="text-lg leading-relaxed tracking-tight text-gray-300 max-w-2xl mx-auto font-light"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Join our partnership program and start earning commissions today. Our AI assistant is here to help with any questions.
              </motion.p>
            </div>
            
            {/* Action Buttons */}
            <motion.div 
              className="relative z-10 flex flex-col sm:flex-row gap-8 justify-center items-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={onApplyNow}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px rgba(251, 146, 60, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-12 py-6 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 
                  hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white font-bold text-xl
                  rounded-2xl shadow-xl shadow-orange-500/40 transition-all duration-300 
                  border border-orange-400/30 overflow-hidden min-w-[240px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 
                  transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Apply Now
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
              
              <motion.button
                onClick={openNewChat}
                whileHover={{ 
                  scale: 1.05,
                  borderColor: "rgba(251, 146, 60, 0.7)",
                  backgroundColor: "rgba(75, 85, 99, 0.8)"
                }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 bg-gray-800/60 hover:bg-gray-700/70 text-white font-semibold text-xl
                  border-2 border-gray-600/40 hover:border-orange-500/70 rounded-2xl 
                  transition-all duration-300 flex items-center gap-4 justify-center
                  backdrop-blur-sm shadow-xl shadow-black/30 min-w-[240px]"
              >
                <ExternalLink className="w-6 h-6" />
                <span>Open Full Chat</span>
              </motion.button>
            </motion.div>

            {/* Additional Info */}
            <motion.div 
              className="relative z-10 pt-8 border-t border-gray-700/20"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-center gap-3 text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-lg font-medium">
                  💬 AI assistant available 24/7 to answer your questions
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

interface CategoryButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function CategoryButton({ icon, label, isActive, onClick }: CategoryButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl 
        border transition-all duration-300 ${
        isActive
          ? "bg-orange-500/20 border-orange-500/50 shadow-lg shadow-orange-500/20"
          : "bg-gray-800/60 border-gray-700/50 hover:border-orange-500/30 hover:bg-gray-700/60"
      }`}
    >
      <div className={`${isActive ? "text-orange-400" : "text-gray-400"} transition-colors`}>
        {icon}
      </div>
      <span
        className={`text-sm font-medium transition-colors ${
          isActive ? "text-orange-300" : "text-gray-300"
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
}