interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  accentColor?: string;
}

export function ChatBubble({ role, content, accentColor = "#7C3AED" }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-xl ${
          isUser
            ? "bg-[#7C3AED] text-white"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
        }`}
        style={!isUser ? { borderLeft: `3px solid ${accentColor}` } : {}}
      >
        {content}
      </div>
    </div>
  );
}