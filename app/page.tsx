"use client";

import { useChat } from "ai/react";
import { Message } from "ai";
import { useEffect, useRef } from "react";

// --- SVG Icon Components ---
const BotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);



// --- Main Chat Component ---
const Home = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } =
    useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const showWelcomeScreen = messages.length === 0;

  const handleSuggestion = (prompt: string) => {
    append({ role: "user", content: prompt });
  };

  const commonSymptoms = [
    "Fever and chills",
    "Persistent headaches", 
    "Sore throat symptoms",
    "Digestive concerns",
    "Muscle pain and stiffness",
    "Fatigue and weakness"
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center ">
              
              <div className=" items-center justify-center">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Prototype V1</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main chat/welcome area */}
        <section
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-8"
        >
          {showWelcomeScreen ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
              
              <div className="space-y-4">
               
                <div className="space-y-2">
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                    How can I help you today?
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Describe your symptoms or ask about health concerns
                  </p>
                </div>
              </div>
              
              <div className="w-full max-w-2xl space-y-4">
                <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Quick Start
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {commonSymptoms.map((symptom, index) => (
                    <button 
                      key={index}
                      onClick={() => handleSuggestion(`I have ${symptom.toLowerCase()}`)}
                      className="group p-4 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                        {symptom}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((m: Message) => (
                <div key={m.id} className={`flex items-start space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    m.role === 'user' 
                      ? 'bg-gray-100 dark:bg-gray-700' 
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {m.role === 'user' ? (
                      <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <BotIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className={`max-w-2xl rounded-2xl px-4 py-3 ${
                    m.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <BotIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Input form */}
        <footer className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-3" onSubmit={handleFormSubmit}>
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white dark:placeholder-gray-400 text-sm"
                onChange={handleInputChange}
                value={input}
                placeholder="Describe your symptoms..."
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e as any);
                  }
                }}
              />
            </div>
            <button
              onClick={handleFormSubmit}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-colors flex items-center justify-center disabled:cursor-not-allowed"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default Home;