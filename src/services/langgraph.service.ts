import { PromptTemplate } from "@langchain/core/prompts";
import {
  Annotation,
  END,
  MemorySaver,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import OpenAI from "openai";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch";
import { zodTextFormat } from "openai/helpers/zod";
import {
  CityCardArray,
  createValidPartialJson,
  isJsonValid,
} from "./openai.service";

export const StateAnnotation = Annotation.Root({
  output: Annotation<string>,
});

const cardNode = async (state: typeof StateAnnotation.State) => {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const stream = await client.responses.create({
    model: "gpt-4o",
    input: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates city cards. You should generate 6 city cards. Every city card should be a JSON object with the following fields: country, city, note, activities. All fields are required.",
      },
      {
        role: "user",
        content:
          "Generate 6 city cards. Tokyo, Bali, Paris, London, New York, Sydney.",
      },
    ],
    text: {
      format: zodTextFormat(CityCardArray, "card"),
    },
    stream: true,
  });
  let result = "";
  let lastValidJson = "";

  // Process stream chunks
  for await (const event of stream) {
    if (event.type === "response.output_text.delta" && event.delta) {
      result += event.delta;
      const partialJson = createValidPartialJson(result);

      console.log("raw result:", result);
      console.log("processed json:", partialJson);

      if (isJsonValid(partialJson)) {
        lastValidJson = partialJson;
        await dispatchCustomEvent("stream_text", partialJson);
      } else if (lastValidJson) {
        // Send the last valid JSON if current one is invalid
        await dispatchCustomEvent("stream_text", lastValidJson);
      }
    }
    if (event.type === "response.completed") {
      console.log("final result", result);
      // Send the final result, preferring the raw result if it's valid
      const finalJson = isJsonValid(result)
        ? result
        : createValidPartialJson(result);
      if (isJsonValid(finalJson)) {
        await dispatchCustomEvent("stream_text", finalJson);
      }
    }
  }
  return {
    output: result,
  };
};

export const createGraph = () => {
  const workflow = new StateGraph(StateAnnotation)
    .addNode("cardNode", cardNode)
    .addEdge(START, "cardNode")
    .addEdge("cardNode", END);

  const graph = workflow.compile();

  return graph;
};
