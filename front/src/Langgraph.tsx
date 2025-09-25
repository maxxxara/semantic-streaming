import React, { useEffect, useState } from "react";
import type { ICard } from "./App";
import Card from "./Card";

function Langgraph() {
  const [response, setResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [cards, setCards] = useState<ICard[]>([]);

  useEffect(() => {
    console.log("cards", cards);
  }, [cards]);

  const handleStream = () => {
    setResponse("");
    setIsStreaming(true);

    const eventSource = new EventSource(
      `http://localhost:3000/stream-langgraph`
    );
    eventSource.onmessage = (event) => {
      console.log("event", event);

      try {
        const data = JSON.parse(event.data);

        if (data.content === "[DONE]") {
          console.log("[DONE]");
          eventSource.close();
          setIsStreaming(false);
          return;
        }

        if (data.error) {
          setResponse((prev) => prev + "\nError: " + data.error);
          eventSource.close();
          setIsStreaming(false);
        } else if (data.content) {
          const content = JSON.parse(data.content);
          console.log("Structured chunk:", content.cards);
          setCards(content.cards);
        }
      } catch (e) {
        console.error("Failed to parse SSE data:", e);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Connection error:", error);
      eventSource.close();
      setIsStreaming(false);
      setResponse((prev) => prev + "\nConnection error occurred");
    };
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-4">
      <button
        onClick={handleStream}
        disabled={isStreaming}
        className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isStreaming ? "Streaming..." : "Stream with Langgraph"}
      </button>
      {/* Card Component */}
      <div className="grid grid-cols-3 gap-4">
        {(cards || []).map((card) => (
          <Card
            country={card?.country || ""}
            city={card?.city || ""}
            note={card?.note || ""}
            activities={card?.activities || []}
          />
        ))}
      </div>
    </div>
  );
}

export default Langgraph;
