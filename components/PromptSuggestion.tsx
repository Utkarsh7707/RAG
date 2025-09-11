/**
 * Renders a row of clickable prompt suggestion buttons.
 * @param {{ handleSuggestionClick: (prompt: string) => void }} props - The component props.
 */
const PromptSuggestionRow = ({ handleSuggestionClick }) => {
  const suggestions = [
    "Who has the most F1 wins?",
    "Explain how DRS works.",
    "What was the 'Crashgate' scandal?",
    "Summarize the 2021 Abu Dhabi GP.",
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {suggestions.map((prompt) => (
        <button
          key={prompt}
          onClick={() => handleSuggestionClick(prompt)}
          className="bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};

export default PromptSuggestionRow;