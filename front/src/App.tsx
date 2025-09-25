import React, { useEffect, useState } from "react";
import Card from "./Card";
import Openai from "./Openai";
import Langchain from "./Langchain";

export interface ICard {
  country: string;
  city: string;
  note: string;
  activities: string[];
}

function App() {
  const [tab, setTab] = useState<"openai" | "langchain">("openai");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setTab("openai")}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                tab === "openai"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              OpenAI
            </button>
            <button
              onClick={() => setTab("langchain")}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                tab === "langchain"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              Langchain
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {tab === "openai" && <Openai />}
        {tab === "langchain" && <Langchain />}
      </div>
    </div>
  );
}

export default App;
