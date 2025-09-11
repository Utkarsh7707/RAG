"use client";

import { useChat } from "ai/react";
import { Message } from "ai";

// Import the components from their files
import Bubble from "@/components/Bubble";
import LoadingBubble from "@/components/LoadingBubble";
import PromptSuggestionRow from "@/components/PromptSuggestion";

const Home = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat();

  const showWelcomeScreen = messages.length === 0;

  // Function to handle prompt suggestion clicks
  const handleSuggestion = (prompt) => {
    append({ role: 'user', content: prompt });
  };

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">🏎️ F1 GPT</h1>
        <p className="text-gray-500">The ultimate place for Formula 1 fans!</p>
      </header>

      {/* Main chat/welcome area */}
      <section className="flex-grow flex flex-col mb-4 overflow-y-auto pr-2">
        {showWelcomeScreen ? (
          <div className="text-center my-auto">
            <p className="text-lg text-gray-600">
              Ask F1 GPT anything...
            </p>
            <PromptSuggestionRow handleSuggestionClick={handleSuggestion} />
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} />
            ))}
            {isLoading && <LoadingBubble />}
          </div>
        )}
      </section>

      {/* Input form */}
      <footer className="flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            onChange={handleInputChange}
            value={input}
            placeholder="Ask me something about F1..."
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white font-semibold px-5 py-3 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </footer>
    </main>
  );
};

export default Home;