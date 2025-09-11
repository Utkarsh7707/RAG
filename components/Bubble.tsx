import { Message } from "ai";

/**
 * Renders a chat message bubble with appropriate styling for user or assistant.
 * @param {{ message: Message }} props - The component props.
 */
const Bubble = ({ message }) => {
  const isUser = message.role === "user";

  // Different styles for user vs. AI bubbles
  const bubbleClasses = isUser
    ? "bg-blue-500 text-white self-end" // User message styles
    : "bg-gray-200 text-gray-800 self-start"; // AI message styles

  return (
    <div
      className={`w-fit max-w-xl rounded-lg px-4 py-2 my-1 shadow ${bubbleClasses}`}
    >
      <p className="whitespace-pre-wrap">{message.content}</p>
    </div>
  );
};

export default Bubble;