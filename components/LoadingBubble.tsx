/**
 * Renders a loading indicator for when the AI is typing.
 */
const LoadingBubble = () => {
  return (
    <div className="self-start bg-gray-200 text-gray-800 rounded-lg px-4 py-3 my-1 shadow">
      <div className="flex items-center justify-center space-x-1">
        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

export default LoadingBubble;